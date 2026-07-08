import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/supabase-auth';
import { supabaseServer } from '@/lib/supabase-server';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout – ALL Shops',
};

export const dynamic = 'force-dynamic';

export type CheckoutInitialData = {
  email: string;
  name: string;
  phone: string;
  cpf: string;
  profileId: string;
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  } | null;
} | null;

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  let initialData: CheckoutInitialData = null;

  if (user) {
    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('name, phone, role, cpf')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'customer') {
      // Try default address first, then most recent
      let addrResult = await supabaseServer
        .from('addresses')
        .select('street, number, complement, neighborhood, city, state, zip_code')
        .eq('profile_id', user.id)
        .eq('is_default', true)
        .maybeSingle();

      if (!addrResult.data) {
        addrResult = await supabaseServer
          .from('addresses')
          .select('street, number, complement, neighborhood, city, state, zip_code')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
      }

      const addr = addrResult.data;

      initialData = {
        email: user.email ?? '',
        name: profile.name ?? '',
        phone: profile.phone ?? '',
        cpf: profile.cpf ?? '',
        profileId: user.id,
        address: addr
          ? {
              street: addr.street,
              number: addr.number,
              complement: addr.complement ?? '',
              neighborhood: addr.neighborhood,
              city: addr.city,
              state: addr.state,
              zip_code: addr.zip_code,
            }
          : null,
      };
    }
  }

  return <CheckoutClient initialData={initialData} />;
}
