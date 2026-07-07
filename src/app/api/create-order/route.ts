import { MercadoPagoConfig, Order } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    first_name: parts[0] ?? fullName,
    last_name: parts.slice(1).join(" ") || undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer, address, payment_method, card, device_id, profile_id, identification } = body;

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
            statement_descriptor: "A E L SHOP",
          }
        : { id: "pix", type: "bank_transfer" as const };

    const { first_name, last_name } = splitName(customer.name);

    const orderApi = new Order(client);
    const payerEmail = customer.email;

    const productIds = items.map((i: { product_id: number }) => i.product_id).filter((id: unknown): id is number => typeof id === "number");
    const { data: products } = await supabaseServer
      .from("products")
      .select("id, category_id")
      .in("id", productIds);

    const productCatMap = new Map(
      (products ?? []).map((p: { id: number; category_id: number | null }) => [p.id, p.category_id]),
    );

    const orderBody: Record<string, unknown> = {
      type: "online",
      total_amount: total.toFixed(2).toString(),
      external_reference: externalRef,
      config: {
        statement_descriptor: "A E L SHOP",
      },
      transactions: {
        payments: [
          {
            amount: total.toFixed(2),
            payment_method: paymentMethod,
          },
        ],
      },
      items: items.map(
        (i: { title: string; quantity: number; unit_price: number; product_id: number }) => ({
          title: i.title,
          quantity: Number(i.quantity),
          unit_price: i.unit_price.toFixed(2),
          category_id: productCatMap.get(i.product_id)?.toString(),
        }),
      ),
      payer: {
        email: payerEmail,
        entity_type: "individual",
        first_name,
        last_name,
        phone: { area_code: areaCode, number: phoneNumber },
        ...(identification?.type && identification?.number
          ? { identification: { type: identification.type, number: identification.number } }
          : {}),
        address: {
          zip_code: address.zip_code,
          street_name: address.street,
          street_number: address.number,
          neighborhood: address.neighborhood,
          state: address.state,
          city: address.city,
          complement: address.complement || "SEM COMPLEMENTO",
        },
      },
      shipment: {
        mode: "custom",
        address: {
          street_name: address.street,
          street_number: address.number,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zip_code: address.zip_code,
          complement: address.complement || "SEM COMPLEMENTO",
        },
      },

    };

    if (device_id) {
      orderBody.device_id = device_id;
    }

    const mpOrder = await orderApi.create({ body: orderBody });

    const { data: dbAddress, error: addrError } = await supabaseServer
      .from("addresses")
      .insert({
        profile_id: profile_id ?? null,
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
        profile_id: profile_id ?? null,
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
    const pm = payment?.payment_method as
      | { qr_code?: string; qr_code_base64?: string }
      | undefined;

    const mpPaymentStatus = payment?.status as string | undefined;

    if (mpPaymentStatus === "processed" || mpPaymentStatus === "approved") {
      await supabaseServer
        .from("orders")
        .update({ status: "paid" })
        .eq("id", dbOrder.id);
    }

    return NextResponse.json({
      order: { id: dbOrder.id, status: mpPaymentStatus === "processed" || mpPaymentStatus === "approved" ? "paid" : "pending" },
      mpOrder: { id: mpOrder.id },
      qrCode: pm?.qr_code_base64 ?? null,
      qrCodeText: pm?.qr_code ?? null,
    });
  } catch (error: unknown) {
    let message = "Erro interno ao processar pagamento. Tente novamente.";

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "object" && error !== null) {
      const obj = error as Record<string, unknown>;
      const causes = obj.cause;
      if (Array.isArray(causes) && causes.length > 0) {
        const parts = causes.map((c: Record<string, unknown>) =>
          [c.description, c.error_description].filter(Boolean).join(". ")
        ).filter(Boolean);
        if (parts.length > 0) message = parts.join(". ");
      } else if (typeof obj.message === "string") {
        message = obj.message;
      }
    }

    console.error("Error creating order:", message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
