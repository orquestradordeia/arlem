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

    let dbStatus = "pending";
    if (mpStatus === "paid") dbStatus = "paid";
    else if (mpStatus === "cancelled") dbStatus = "cancelled";

    if (mpOrder.id) {
      const mpOrderId = mpOrder.id.toString();
      const validStatus: Record<string, "pending" | "paid" | "cancelled"> = {
        pending: "pending", paid: "paid", cancelled: "cancelled",
      };
      await supabaseServer
        .from("orders")
        .update({ status: validStatus[mpStatus ?? ""] ?? "pending" })
        .eq("mp_payment_id", mpOrderId);
    }

    return NextResponse.json({ status: mpStatus });
  } catch {
    return NextResponse.json({ status: "pending" });
  }
}
