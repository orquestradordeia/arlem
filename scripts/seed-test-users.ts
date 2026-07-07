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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[key] = value;
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const address = {
  street: "Rua Passagem Nacional",
  number: "25",
  complement: "",
  neighborhood: "Nossa Senhora das Graças",
  city: "Manaus",
  state: "Amazonas",
  zip_code: "69053-010",
};

async function getUserIdByEmail(email: string) {
  const { data: users } = await supabase.auth.admin.listUsers();
  return users?.users.find(u => u.email === email)?.id;
}

async function upsertTestUser(email: string, name: string, phone: string, mpUserId: string) {
  let userId = await getUserIdByEmail(email);

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email, password: "Teste@123", email_confirm: true,
      user_metadata: { full_name: name },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`  Usuário ${email} criado.`);
  } else {
    console.log(`  Usuário ${email} já existe.`);
  }

  await supabase.from("profiles").update({ role: "customer", name, phone }).eq("id", userId);

  const { data: existingAddr } = await supabase
    .from("addresses")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (!existingAddr) {
    const { error: addrErr } = await supabase.from("addresses").insert({
      profile_id: userId, ...address, is_default: true,
    });
    if (addrErr) console.error(`  Erro ao inserir endereço:`, addrErr.message);
    else console.log(`  Endereço criado.`);
  } else {
    console.log(`  Endereço já existe.`);
  }
}

async function main() {
  console.log("Criando/atualizando usuários de teste...\n");

  await upsertTestUser("comprador1@teste.com", "Carlos Silva", "(92) 99123-4567", "3525648998");
  await upsertTestUser("comprador2@teste.com", "Ana Oliveira", "(92) 99876-5432", "3525455088");

  console.log(`\nSenha de ambos: Teste@123`);
  console.log(`Endereço: Rua Passagem Nacional, 25 - Nossa Senhora das Graças, Manaus/AM`);
  console.log(`\nMP test users referência: 3525648998 (comprador1), 3525455088 (comprador2)`);
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
