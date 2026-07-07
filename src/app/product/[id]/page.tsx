import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/products';
import ProductPageClient from './ProductPageClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(Number(id));

  if (!product) return { title: 'Produto não encontrado – ALL Shops' };

  return {
    title: `${product.name} – ALL Shops`,
    description: product.description.replace(/<[^>]*>/g, '').slice(0, 160),
    openGraph: {
      title: `${product.name} – ALL Shops`,
      description: product.description.replace(/<[^>]*>/g, '').slice(0, 160),
      images: [{ url: product.img, width: 800, height: 800 }],
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const [product, allProducts] = await Promise.all([
    getProduct(Number(id)),
    getProducts(),
  ]);

  if (!product) notFound();

  return <ProductPageClient product={product} allProducts={allProducts} />;
}
