import { supabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    const { data: users } = await supabaseServer.auth.admin.listUsers();
    const existing = users?.users.find((u) => u.email === email);

    if (existing) {
      if (name || phone) {
        try {
          await supabaseServer
            .from("profiles")
            .update({
              ...(name ? { name } : {}),
              ...(phone ? { phone } : {}),
            })
            .eq("id", existing.id);

          let formattedPhone = phone ? String(phone).replace(/\D/g, "") : "";
          if (formattedPhone && !formattedPhone.startsWith("+")) {
            formattedPhone = formattedPhone.length <= 11 ? `+55${formattedPhone}` : `+${formattedPhone}`;
          }

          const updateData: any = {
            user_metadata: {
              ...existing.user_metadata,
              ...(name ? { name, full_name: name } : {}),
              ...(phone ? { phone } : {}),
              role: "customer",
            }
          };

          if (formattedPhone && /^\+[1-9]\d{1,14}$/.test(formattedPhone)) {
            updateData.phone = formattedPhone;
          }

          const { error: authUpdateError } = await supabaseServer.auth.admin.updateUserById(
            existing.id,
            updateData
          );

          if (authUpdateError && updateData.phone) {
            delete updateData.phone;
            await supabaseServer.auth.admin.updateUserById(existing.id, updateData);
          }
        } catch (updateErr) {
          console.error("Error updating existing profile on find-or-create:", updateErr);
        }
      }

      const { data: profile } = await supabaseServer
        .from("profiles")
        .select("id, name, phone, role, cpf, created_at")
        .eq("id", existing.id)
        .single();

      const { data: addresses } = await supabaseServer
        .from("addresses")
        .select("*")
        .eq("profile_id", existing.id)
        .order("is_default", { ascending: false });

      return NextResponse.json({
        profile: profile ?? { id: existing.id, name: null, phone: null, role: "customer", cpf: null, created_at: existing.created_at },
        addresses: addresses ?? [],
        is_new: false,
      });
    }

    const { data: newUser, error: createErr } = await supabaseServer.auth.admin.createUser({
      email,
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: { 
        name: name ?? null, 
        phone: phone ?? null,
        full_name: name ?? null,
        role: "customer"
      },
    });

    if (createErr) throw createErr;

    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("id, name, phone, role, created_at")
      .eq("id", newUser.user.id)
      .single();

    return NextResponse.json({
      profile: profile ?? { id: newUser.user.id, name, phone, role: "customer", created_at: newUser.user.created_at },
      addresses: [],
      is_new: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("find-or-create-profile error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
