import { supabaseServer as supabase } from './supabase-server';

export type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice: number;
  badge: string;
  img: string;
  images: string[];
  sizes: number[];
  description: string;
  features: string[];
  reviews: { name: string; rating: number; text: string }[];
  featured: boolean;
};

function calcBadge(price: number, oldPrice: number): string {
  if (!oldPrice || oldPrice <= price) return '';
  const pct = Math.round(((oldPrice - price) / oldPrice) * 100);
  return `-${pct}%`;
}

const storageUrl = 'https://cjxmynoimzpomynhyiwq.supabase.co/storage/v1/object/public/product-images';

export async function getProducts(): Promise<Product[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, brand, description, price, compare_price, features, featured,
      category:category_id(name),
      product_images(url),
      product_sizes(size:size_id(label)),
      product_reviews(name, rating, text)
    `)
    .eq('active', true);

  if (error || !products) return [];

  return products.map((p) => {
    const images = p.product_images?.map((i: { url: string }) => i.url) ?? [];
    const sizes = p.product_sizes
      ?.map((s: { size: { label: string } | null }) => s.size?.label)
      .filter(Boolean)
      .map(Number) ?? [];
    const reviews = p.product_reviews ?? [];
    const price = Number(p.price);
    const oldPrice = Number(p.compare_price ?? p.price);
    const category = (p.category as { name: string } | null)?.name ?? '';

    return {
      id: p.id,
      name: p.name,
      brand: p.brand ?? '',
      category,
      price,
      oldPrice,
      badge: calcBadge(price, oldPrice),
      featured: p.featured ?? false,
      img: images[0] ?? '',
      images,
      sizes,
      description: p.description ?? '',
      features: (p.features as string[]) ?? [],
      reviews: reviews.map((r: { name: string; rating: number; text: string | null }) => ({
        name: r.name,
        rating: r.rating,
        text: r.text ?? '',
      })),
    };
  });
}

export async function getProduct(id: number): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) ?? null;
}
