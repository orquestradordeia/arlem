import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import ProductGrid from '../components/ProductGrid';
import BrandsBar from '../components/BrandsBar';
import Newsletter from '../components/Newsletter';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ProductGrid />
      <BrandsBar />
      <Newsletter />
    </>
  );
}
