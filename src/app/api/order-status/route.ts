import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Order } from "mercadopago";
import { supabaseServer } from "@/lib/supabase-server";
import { sendOrderEmail } from "@/lib/email";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const orderApi = new Order(client);
    const mpOrder = await orderApi.get({ id });

    const mpStatus = mpOrder.status;

    const statusMap: Record<string, string> = {
      processed: "paid",
      canceled: "cancelled",
      expired: "cancelled",
    };

    const dbStatus = statusMap[mpStatus ?? ""] ?? "pending";

    if (mpOrder.id) {
      const mpOrderId = mpOrder.id.toString();
      if (dbStatus === "paid") {
        const { data: order } = await supabaseServer
          .from("orders")
          .select("id, status")
          .eq("mp_payment_id", mpOrderId)
          .maybeSingle();

        if (order && order.status !== "paid") {
          await supabaseServer
            .from("orders")
            .update({ status: "paid" })
            .eq("id", order.id);

          try {
            await sendOrderEmail(order.id);
          } catch (emailErr) {
            console.error("Failed to send order email:", emailErr);
          }
        }
      } else {
        await supabaseServer
          .from("orders")
          .update({ status: dbStatus as "pending" | "paid" | "cancelled" })
          .eq("mp_payment_id", mpOrderId);
      }
    }

    return NextResponse.json({ status: dbStatus });
  } catch {
    return NextResponse.json({ status: "pending" });
  }
}
