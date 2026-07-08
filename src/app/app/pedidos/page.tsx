import { getCurrentUser } from '@/lib/supabase-auth';
import { supabaseServer } from '@/lib/supabase-server';
import PedidosPageClient from './PedidosPageClient';

export const dynamic = 'force-dynamic';

async function getOrders(userId: string) {
  const { data } = await supabaseServer
    .from('orders')
    .select(`
      id, total, status, created_at, mp_payment_id,
      order_items(
        product_id,
        quantity,
        unit_price,
        total,
        products:product_id(name)
      )
    `)
    .eq('profile_id', userId)
    .order('created_at', { ascending: false });

  // Map product join manually if needed, or cast directly
  const formattedOrders = (data ?? []).map((order: any) => ({
    id: Number(order.id),
    total: Number(order.total),
    status: order.status,
    created_at: order.created_at,
    mp_payment_id: order.mp_payment_id,
    order_items: (order.order_items ?? []).map((item: any) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      total: Number(item.total),
      products: item.products ? { name: item.products.name } : null,
    })),
  }));

  return formattedOrders;
}

export default async function MeusPedidos() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch profile
  const { data: profile } = await supabaseServer
    .from('profiles')
    .select('name, phone')
    .eq('id', user.id)
    .single();

  // 2. Fetch default address or most recent address
  let addressResult = await supabaseServer
    .from('addresses')
    .select('street, number, complement, neighborhood, city, state, zip_code')
    .eq('profile_id', user.id)
    .eq('is_default', true)
    .maybeSingle();

  if (!addressResult.data) {
    addressResult = await supabaseServer
      .from('addresses')
      .select('street, number, complement, neighborhood, city, state, zip_code')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
  }

  // 3. Fetch orders
  const orders = await getOrders(user.id);

  const formattedProfile = {
    name: profile?.name ?? null,
    phone: profile?.phone ?? null,
    email: user.email ?? '',
  };

  const formattedAddress = addressResult.data
    ? {
        street: addressResult.data.street,
        number: addressResult.data.number,
        complement: addressResult.data.complement ?? null,
        neighborhood: addressResult.data.neighborhood,
        city: addressResult.data.city,
        state: addressResult.data.state,
        zip_code: addressResult.data.zip_code,
      }
    : null;

  return (
    <PedidosPageClient
      profile={formattedProfile}
      address={formattedAddress}
      orders={orders}
    />
  );
}
