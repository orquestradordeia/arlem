import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import ProductGrid from '@/components/ProductGrid';
import BrandsBar from '@/components/BrandsBar';
import Newsletter from '@/components/Newsletter';
import { getProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ProductGrid products={products} />
      <BrandsBar />
      <Newsletter />
    </>
  );
}
