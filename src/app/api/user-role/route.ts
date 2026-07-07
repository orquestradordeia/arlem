import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase-auth";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ role: null });

  const { data: profile } = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ role: profile?.role ?? null });
}
