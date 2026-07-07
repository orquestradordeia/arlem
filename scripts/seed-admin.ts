import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const content = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function seedAdmin() {
  const email = "admin@aelstore.com";
  const password = "Arlem#2026";

  console.log(`Criando usuário admin: ${email}`);

  const { data: user, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr) {
    if (createErr.message.includes("already registered")) {
      console.log("Usuário já existe. Atualizando role...");
      const { data: existing } = await supabase.auth.admin.listUsers();
      const found = existing?.users.find(u => u.email === email);
      if (found) {
        const { error: updateErr } = await supabase
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", found.id);
        if (updateErr) throw updateErr;
        console.log("Role atualizada para admin no perfil existente.");
      }
    } else {
      throw createErr;
    }
  } else {
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.user.id);
    if (profileErr) throw profileErr;
    console.log("Admin criado com sucesso!");
  }

  console.log("Pronto! admin@aelstore.com / Arlem#2026");
}

seedAdmin().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
