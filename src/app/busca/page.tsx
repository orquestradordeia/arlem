import type { Metadata } from 'next';
import { getProducts } from '@/lib/products';
import SearchPageClient from './SearchPageClient';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  return {
    title: query ? `Resultados para "${query}" – ALL Shops` : 'Busca – ALL Shops',
    description: query
      ? `${query} — encontre os melhores sneakers na ALL Shops.`
      : 'Busque produtos, marcas e categorias na ALL Shops.',
  };
}

export const dynamic = 'force-dynamic';

export default async function BuscaPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const allProducts = await getProducts();

  const results = query
    ? allProducts.filter(p => {
        const term = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
        );
      })
    : [];

  return <SearchPageClient products={results} query={query} />;
}
