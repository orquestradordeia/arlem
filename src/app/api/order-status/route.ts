import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Order } from "mercadopago";
import { supabaseServer } from "@/lib/supabase-server";

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
      await supabaseServer
        .from("orders")
        .update({ status: dbStatus as "pending" | "paid" | "cancelled" })
        .eq("mp_payment_id", mpOrderId);
    }

    return NextResponse.json({ status: dbStatus });
  } catch {
    return NextResponse.json({ status: "pending" });
  }
}
