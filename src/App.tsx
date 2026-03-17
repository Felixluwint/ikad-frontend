import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Hero from '@/sections/Hero';
import Products from '@/sections/Products';
import About from '@/sections/About';
import Contact from '@/sections/Contact';
import Footer from '@/sections/Footer';
import ProductsPage from '@/pages/ProductsPage';
import AdminPage from '@/pages/AdminPage';
import './App.css';

type PageType = 'home' | 'products' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  useEffect(() => {
    // Check URL hash for routing
    const checkHash = () => {
      const hash = window.location.hash.slice(1); // Remove #
      if (hash === 'admin') {
        setCurrentPage('admin');
      } else if (hash === 'products') {
        setCurrentPage('products');
      } else {
        setCurrentPage('home');
      }
    };

    // Check on mount
    checkHash();

    // Listen for hash changes
    window.addEventListener('hashchange', checkHash);
    
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      window.removeEventListener('hashchange', checkHash);
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const navigateTo = (page: PageType) => {
    window.location.hash = page === 'home' ? '' : page;
    setCurrentPage(page);
  };

  // Render different pages based on currentPage state
  if (currentPage === 'products') {
    return (
      <>
        <ProductsPage onBackToHome={() => navigateTo('home')} />
        <Toaster position="bottom-right" />
      </>
    );
  }

  if (currentPage === 'admin') {
    return (
      <>
        <AdminPage onBackToHome={() => navigateTo('home')} />
        <Toaster position="bottom-right" />
      </>
    );
  }

  // Home page
  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigate={navigateTo} />
      <main>
        <Hero />
        <Products onViewAllProducts={() => navigateTo('products')} />
        <About />
        <Contact />
      </main>
      <Footer onNavigate={navigateTo} />
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
