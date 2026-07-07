import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const c = readFileSync(".env.local", "utf-8");
for (const l of c.split("\n")) {
  const t = l.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  process.env[t.slice(0, eq)] = t.slice(eq + 1).replace(/^"|"$/g, "");
}
const sup = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);
(async () => {
  const { data: orders } = await sup.from("orders").select("id, total, status").order("id", { ascending: true });
  console.log("Antes:", orders?.map(o => `#${o.id} ${o.status} R$${o.total}`).join(", "));

  const { error } = await sup.from("orders").update({ status: "paid" }).in("id", [1, 2, 3, 5, 6]);
  if (error) console.error("Erro:", error);
  else console.log("\nPedidos 1,2,3,5,6 marcados como paid!");

  const { data: after } = await sup.from("orders").select("id, total, status").order("id", { ascending: true });
  console.log("Depois:", after?.map(o => `#${o.id} ${o.status} R$${o.total}`).join(", "));
})();
