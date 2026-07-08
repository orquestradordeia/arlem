import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment, Order } from "mercadopago";
import { supabaseServer as supabase } from "@/lib/supabase-server";
import { sendOrderEmail } from "@/lib/email";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dataId = body.data?.id;

    if (!dataId) {
      return NextResponse.json({ received: true });
    }

    const isOrderId = String(dataId).startsWith("ORD");

    if (body.type === "order" || isOrderId) {
      const orderApi = new Order(client);
      const mpOrder = await orderApi.get({ id: dataId });

      const mpStatus = mpOrder.status;

      if (mpOrder.id) {
        const mpOrderId = mpOrder.id.toString();

        const statusMap: Record<string, string> = {
          processed: "paid",
          canceled: "cancelled",
          expired: "cancelled",
        };

        const dbStatus = statusMap[mpStatus ?? ""] ?? "pending";

        if (dbStatus === "paid") {
          const { data: order } = await supabase
            .from("orders")
            .select("id, status")
            .eq("mp_payment_id", mpOrderId)
            .maybeSingle();

          if (order && order.status !== "paid") {
            await supabase
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
          await supabase
            .from("orders")
            .update({ status: dbStatus as "pending" | "paid" | "cancelled", mp_payment_id: mpOrderId })
            .eq("mp_payment_id", mpOrderId);
        }
      }
    } else if (body.type === "payment") {
      const payment = new Payment(client);
      const mpPayment = await payment.get({ id: dataId });

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

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
