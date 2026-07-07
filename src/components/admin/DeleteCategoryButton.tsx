'use client';

export function DeleteCategoryButton({ id, action }: { id: number; action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} style={{ display: "inline" }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="admin-btn admin-btn-sm admin-btn-danger"
        onClick={e => { if (!confirm("Excluir?")) e.preventDefault(); }}>
        Excluir
      </button>
    </form>
  );
}
