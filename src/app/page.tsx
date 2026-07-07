import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import ProductGrid from '@/components/ProductGrid';
import BrandsBar from '@/components/BrandsBar';
import Newsletter from '@/components/Newsletter';
import { getProducts, type Product } from '@/lib/products';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fillFeatured(featured: Product[], allProducts: Product[]): Product[] {
  if (featured.length >= 4) return featured.slice(0, 4);
  const needed = 4 - featured.length;
  const featuredIds = new Set(featured.map(p => p.id));
  const pool = shuffle(allProducts.filter(p => !featuredIds.has(p.id)));
  return [...featured, ...pool.slice(0, needed)];
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getProducts();
  const featured = fillFeatured(products.filter(p => p.featured), products);
  const featuredIds = new Set(featured.map(p => p.id));
  const releases = products.filter(p => !featuredIds.has(p.id));

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ProductGrid products={featured} title="DESTAQUES" subtitle="Featured" id="destaques" />
      <ProductGrid products={releases} title="LANÇAMENTOS" subtitle="Best Sellers" id="produtos" />
      <BrandsBar />
      <Newsletter />
    </>
  );
}
