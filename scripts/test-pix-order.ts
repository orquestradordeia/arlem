import { MercadoPagoConfig, Order } from "mercadopago";
import { readFileSync } from "fs";

const c = readFileSync(".env.local", "utf-8");
for (const l of c.split("\n")) {
  const t = l.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  process.env[t.slice(0, eq)] = t.slice(eq + 1).replace(/^"|"$/g, "");
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

async function test() {
  const orderApi = new Order(client);
  const result = await orderApi.create({
    body: {
      type: "online",
      total_amount: "1.00",
      external_reference: `test_${Date.now()}`,
      transactions: {
        payments: [
          { amount: "1.00", payment_method: { id: "pix", type: "bank_transfer" } },
        ],
      },
      items: [{ title: "Teste", quantity: 1, unit_price: "1.00" }],
      payer: { email: "comprador1@testuser.com" },
    },
  });

  const payment = result.transactions?.payments?.[0];
  const pm = payment?.payment_method;

  console.log("=== Full result keys ===");
  console.log(Object.keys(result));

  console.log("\n=== Transaction payment ===");
  console.log("payment keys:", Object.keys(payment || {}));
  console.log("payment.status:", payment?.status);

  console.log("\n=== payment_method (raw) ===");
  console.log("pm:", JSON.stringify(pm, null, 2));

  console.log("\n=== payment_method keys ===");
  console.log(Object.keys(pm || {}));

  console.log("\n=== qr_code attempts ===");
  console.log("pm.qr_code_base64:", pm && "qr_code_base64" in pm ? (pm as any).qr_code_base64 : "NOT FOUND");
  console.log("pm.data?.qr_code_base64:", pm && "data" in pm ? (pm as any).data?.qr_code_base64 : "NO data FIELD");
  console.log("pm.qr_code:", pm && "qr_code" in pm ? (pm as any).qr_code : "NOT FOUND");
  console.log("pm.data?.qr_code:", pm && "data" in pm ? (pm as any).data?.qr_code : "NO data FIELD");
}

test().catch(console.error);
