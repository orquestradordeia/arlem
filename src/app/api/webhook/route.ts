import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment, Order } from "mercadopago";
import { supabaseServer as supabase } from "@/lib/supabase-server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "payment") {
      const payment = new Payment(client);
      const mpPayment = await payment.get({ id: body.data.id });

      const orderId = mpPayment.order?.id
        ? Number(mpPayment.order.id)
        : null;

      if (orderId && mpPayment.id) {
        await supabase.from("payments").insert({
          order_id: orderId,
          mp_payment_id: mpPayment.id.toString(),
          mp_status: mpPayment.status,
          amount: Number(mpPayment.transaction_amount),
          payment_method: mpPayment.payment_method_id,
        });
      }
    }

    if (body.type === "order" && body.data.id) {
      const orderApi = new Order(client);
      const mpOrder = await orderApi.get({ id: body.data.id });

      const mpStatus = mpOrder.status;

      if (mpOrder.id) {
        const mpOrderId = mpOrder.id.toString();

        const validStatus: Record<string, "pending" | "paid" | "cancelled"> = {
          pending: "pending",
          paid: "paid",
          cancelled: "cancelled",
        };

        const dbStatus = validStatus[mpStatus ?? ""] ?? "pending";

        await supabase
          .from("orders")
          .update({ status: dbStatus, mp_payment_id: mpOrderId })
          .eq("mp_payment_id", mpOrderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
