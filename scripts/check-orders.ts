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
  const { data } = await sup.from("orders").select("id, total, status, created_at").order("created_at", { ascending: false });
  console.log(JSON.stringify(data, null, 2));
  console.log("Total:", data?.length ?? 0);
  console.log("Paid:", data?.filter((o: any) => o.status === "paid").length ?? 0);
})();
