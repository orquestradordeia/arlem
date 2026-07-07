import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { CategoryManager } from "@/components/admin/CategoryManager";

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

async function editCategory(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string);
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  await supabaseServer.from("categories").update({ name, slug }).eq("id", id);
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
    <CategoryManager
      categories={categorias}
      addAction={addCategory}
      editAction={editCategory}
      deleteAction={deleteCategory}
    />
  );
}
