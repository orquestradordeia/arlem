import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getData() {
  const { data } = await supabaseServer.from("categories").select("id, name, slug").order("name");
  return data ?? [];
}

async function addCategory(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  await supabaseServer.from("categories").insert({ name, slug });
  redirect("/admin/categorias");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string);
  await supabaseServer.from("categories").delete().eq("id", id);
  redirect("/admin/categorias");
}

export default async function AdminCategorias() {
  const categorias = await getData();

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22 }}>Categorias</h1>
      </div>

      <div className="admin-card" style={{ marginBottom: 24, maxWidth: 480 }}>
        <form action={addCategory} style={{ display: "flex", gap: 12, alignItems: "end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Nome</label>
            <input name="name" className="admin-input" required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Slug</label>
            <input name="slug" className="admin-input" required />
          </div>
          <button type="submit" className="admin-btn">Adicionar</button>
        </form>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead><tr><th>Nome</th><th>Slug</th><th></th></tr></thead>
          <tbody>
            {categorias.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>
                  <form action={deleteCategory} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="admin-btn admin-btn-sm admin-btn-danger" onClick={e => { if (!confirm("Excluir?")) e.preventDefault(); }}>Excluir</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
