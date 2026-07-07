import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getCategories() {
  const { data } = await supabaseServer.from("categories").select("id, name").order("name");
  return data ?? [];
}

async function getSizes() {
  const { data } = await supabaseServer.from("sizes").select("id, label").order("label");
  return data ?? [];
}

async function handleSave(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category_id = formData.get("category_id") ? parseInt(formData.get("category_id") as string) : null;
  const featured = formData.get("featured") === "on";

  const { error } = await supabaseServer.from("products").insert({
    name, slug, description, price, category_id,
    active: true, featured,
  });

  if (error) throw new Error(error.message);
  redirect("/admin/produtos");
}

export default async function NovoProduto() {
  const categories = await getCategories();
  const sizes = await getSizes();

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/produtos" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none" }}>&larr; Voltar</Link>
        <h1 style={{ fontSize: 22, marginTop: 8 }}>Novo Produto</h1>
      </div>
      <form action={handleSave} className="admin-card" style={{ maxWidth: 720 }}>
        <div className="admin-form-grid">
          <div><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Nome</label><input name="name" className="admin-input" required /></div>
          <div><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Slug</label><input name="slug" className="admin-input" required /></div>
          <div className="admin-full"><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Descrição</label><textarea name="description" className="admin-input" rows={3} /></div>
          <div><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Preço (R$)</label><input name="price" type="number" step="0.01" className="admin-input" required /></div>
          <div><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Categoria</label><select name="category_id" className="admin-input"><option value="">Sem categoria</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}><input type="checkbox" name="featured" style={{ accentColor: "var(--neon-cyan)" }} /> Destaque</label>
          </div>
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <button type="submit" className="admin-btn">Salvar</button>
          <Link href="/admin/produtos" className="admin-btn admin-btn-outline">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
