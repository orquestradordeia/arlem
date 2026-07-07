import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import TopBar from './components/TopBar';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartProvider>
      <TopBar />
      <Header onCartToggle={() => setCartOpen(o => !o)} onSearchToggle={() => alert('Função de busca')} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>

      <Footer />
    </CartProvider>
  );
}
