import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { profileId, password } = await req.json();

    if (!profileId || !password || password.length < 8) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // 1. Update user password and user metadata in Auth
    const { error: authErr } = await supabaseServer.auth.admin.updateUserById(profileId, {
      password,
      user_metadata: { cpf: password },
    });

    if (authErr) throw authErr;

    // 2. Update profiles table with cpf
    const { error: profileErr } = await supabaseServer
      .from('profiles')
      .update({ cpf: password })
      .eq('id', profileId);

    if (profileErr) throw profileErr;

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao definir senha';
    console.error('set-default-password error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
