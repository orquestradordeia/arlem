'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: number; name: string; slug: string };

export function CategoryManager({
  categories: initial,
  addAction,
  editAction,
  deleteAction,
}: {
  categories: Category[];
  addAction: (formData: FormData) => Promise<void>;
  editAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<{ open: boolean; editing?: Category }>({ open: false });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22 }}>Categorias</h1>
        <button className="admin-btn" onClick={() => setModal({ open: true })}>+ Nova Categoria</button>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead><tr><th>Nome</th><th>Slug</th><th></th></tr></thead>
          <tbody>
            {initial.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td style={{ display: "flex", gap: 8, justifyContent: "end" }}>
                  <button className="admin-btn admin-btn-sm admin-btn-outline"
                    onClick={() => setModal({ open: true, editing: c })}>
                    Editar
                  </button>
                  <form action={deleteAction} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="admin-btn admin-btn-sm admin-btn-danger"
                      onClick={e => { if (!confirm("Excluir?")) e.preventDefault(); }}>
                      Excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <CategoryModal
          category={modal.editing}
          onClose={() => setModal({ open: false })}
          action={modal.editing ? editAction : addAction}
        />
      )}
    </>
  );
}

function CategoryModal({ category, onClose, action }: {
  category?: Category;
  onClose: () => void;
  action: (formData: FormData) => Promise<void>;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.6)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg-primary)", borderRadius: 12,
        border: "1px solid var(--glass-border)", padding: 32,
        width: "100%", maxWidth: 440,
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: 18, marginBottom: 24 }}>
          {category ? "Editar Categoria" : "Nova Categoria"}
        </h2>
        <form action={async (fd) => {
          setSaving(true);
          if (category) fd.set("id", String(category.id));
          await action(fd);
          setSaving(false);
          onClose();
        }}>
          {category && <input type="hidden" name="id" value={category.id} />}
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Nome</label>
              <input name="name" className="admin-input" value={name}
                onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Slug</label>
              <input name="slug" className="admin-input" value={slug}
                onChange={e => setSlug(e.target.value)} required />
            </div>
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "end" }}>
            <button type="button" className="admin-btn admin-btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="admin-btn" disabled={saving}>
              {saving ? "Salvando..." : category ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
