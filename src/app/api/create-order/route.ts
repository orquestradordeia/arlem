import { MercadoPagoConfig, Order } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer, address, payment_method, card } = body;

    const total = items.reduce(
      (sum: number, i: { unit_price: number; quantity: number }) =>
        sum + i.unit_price * i.quantity,
      0,
    );

    const phoneStr = String(customer.phone ?? "");
    const areaCode = phoneStr.length >= 2 ? phoneStr.slice(0, 2) : "";
    const phoneNumber = phoneStr.length > 2 ? phoneStr.slice(2) : phoneStr;

    const externalRef = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const paymentMethod =
      payment_method === "credit"
        ? {
            id: card.payment_method_id,
            type: "credit_card" as const,
            token: card.token,
            installments: card.installments,
          }
        : { id: "pix", type: "bank_transfer" as const };

    const orderApi = new Order(client);
    const mpOrder = await orderApi.create({
      body: {
        type: "online",
        total_amount: total.toFixed(2).toString(),
        external_reference: externalRef,
        transactions: {
          payments: [
            {
              amount: total.toFixed(2),
              payment_method: paymentMethod,
            },
          ],
        },
        items: items.map(
          (i: { title: string; quantity: number; unit_price: number }) => ({
            title: i.title,
            quantity: Number(i.quantity),
            unit_price: i.unit_price.toFixed(2),
          }),
        ),
        payer: {
          email: customer.email,
          phone: { area_code: areaCode, number: phoneNumber },
        },
      },
    });

    const { data: dbAddress, error: addrError } = await supabaseServer
      .from("addresses")
      .insert({
        profile_id: null,
        street: address.street,
        number: address.number,
        complement: address.complement || null,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zip_code: address.zip_code,
        is_default: true,
      })
      .select()
      .single();

    if (addrError) throw addrError;

    const { data: dbOrder, error: orderError } = await supabaseServer
      .from("orders")
      .insert({
        profile_id: null,
        total,
        shipping_address_id: dbAddress.id,
        mp_payment_id: mpOrder.id?.toString() ?? null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(
      (i: {
        product_id: number;
        size_id: number | null;
        quantity: number;
        unit_price: number;
      }) => ({
        order_id: dbOrder.id,
        product_id: i.product_id,
        size_id: i.size_id ?? null,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total: i.unit_price * i.quantity,
      }),
    );

    await supabaseServer.from("order_items").insert(orderItems);

    const payment = mpOrder.transactions?.payments?.[0];
    const pmData = (payment?.payment_method as Record<string, unknown>)?.data as
      | { qr_code?: string; qr_code_base64?: string }
      | undefined;

    const mpPaymentStatus = payment?.status as string | undefined;

    if (mpPaymentStatus === "approved") {
      await supabaseServer
        .from("orders")
        .update({ status: "paid" })
        .eq("id", dbOrder.id);
    }

    return NextResponse.json({
      order: { id: dbOrder.id, status: mpPaymentStatus === "approved" ? "paid" : "pending" },
      mpOrder: { id: mpOrder.id },
      qrCode: pmData?.qr_code_base64 ?? null,
      qrCodeText: pmData?.qr_code ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error creating order:", message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
