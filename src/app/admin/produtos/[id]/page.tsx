import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";

export const dynamic = "force-dynamic";

async function getData(id: number) {
  const { data } = await supabaseServer.from("products").select("*, product_images(url, sort_order)").eq("id", id).single();
  return data;
}

async function getCategories() {
  const { data } = await supabaseServer.from("categories").select("id, name").order("name");
  return data ?? [];
}

async function handleSave(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string);
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category_id = formData.get("category_id") ? parseInt(formData.get("category_id") as string) : null;
  const active = formData.get("active") === "on";
  const featured = formData.get("featured") === "on";

  const imagesJson = formData.get("images") as string;
  const imagesUrls = imagesJson ? JSON.parse(imagesJson) as string[] : [];

  const { error } = await supabaseServer.from("products").update({
    name, slug, description, price, category_id, active, featured,
  }).eq("id", id);

  if (error) throw new Error(error.message);

  // Update images
  await supabaseServer.from("product_images").delete().eq("product_id", id);
  if (imagesUrls.length > 0) {
    const imagesToInsert = imagesUrls.map((url, index) => ({
      product_id: id,
      url: url,
      sort_order: index,
      alt: name
    }));
    const { error: imagesError } = await supabaseServer.from("product_images").insert(imagesToInsert);
    if (imagesError) throw new Error(imagesError.message);
  }

  redirect("/admin/produtos");
}

export default async function EditarProduto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const produto = await getData(parseInt(id));
  if (!produto) notFound();

  const categories = await getCategories();
  const initialImages = (produto.product_images as any[])
    ?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(img => img.url) || [];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/produtos" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none" }}>&larr; Voltar</Link>
        <h1 style={{ fontSize: 22, marginTop: 8 }}>Editar Produto</h1>
      </div>
      <form action={handleSave} className="admin-card" style={{ maxWidth: 720 }}>
        <input type="hidden" name="id" value={produto.id} />
        <div className="admin-form-grid">
          <div><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Nome</label><input name="name" className="admin-input" defaultValue={produto.name} required /></div>
          <div><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Slug</label><input name="slug" className="admin-input" defaultValue={produto.slug} required /></div>
          <div className="admin-full"><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Descrição</label><textarea name="description" className="admin-input" rows={3} defaultValue={produto.description ?? ""} /></div>
          <div><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Preço (R$)</label><input name="price" type="number" step="0.01" className="admin-input" defaultValue={Number(produto.price).toFixed(2)} required /></div>
          <div><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Categoria</label><select name="category_id" className="admin-input" defaultValue={produto.category_id ?? ""}><option value="">Sem categoria</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          
          <div className="admin-full">
            <ImageUploader initialImages={initialImages} />
          </div>

          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}><input type="checkbox" name="active" defaultChecked={produto.active} style={{ accentColor: "var(--neon-cyan)" }} /> Ativo</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}><input type="checkbox" name="featured" defaultChecked={produto.featured} style={{ accentColor: "var(--neon-cyan)" }} /> Destaque</label>
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
