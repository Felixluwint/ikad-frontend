import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, LayoutList, X, Search, SlidersHorizontal, Layers } from 'lucide-react';
import { porcellanatoSizes, ceramicSizes } from '@/data/products';
import { productApi } from '@/services/api';

type Product = {
  id: string;
  name: string;
  category: 'porcellanato' | 'ceramic';
  size: string;
  image: string;
  price?: number;
  stock: number;
  description?: string;
  featured?: boolean;
  stock_status?: string;
  stock_label?: string;
};

import ProductCard from '@/components/ProductCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Footer from '@/sections/Footer';
import Navbar from '@/components/Navbar';

type CategoryType = 'all' | 'porcellanato' | 'ceramic';

interface ProductsPageProps {
  onBackToHome: () => void;
}

export default function ProductsPage({ onBackToHome }: ProductsPageProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.getAll()
      .then(res => setProducts(res.data.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { id: 'all' as CategoryType, name: 'Semua Produk', count: products.length },
    { id: 'porcellanato' as CategoryType, name: 'Porcellanato', count: products.filter(p => p.category === 'porcellanato').length },
    { id: 'ceramic' as CategoryType, name: 'Ceramic Tile', count: products.filter(p => p.category === 'ceramic').length },
  ];

  const availableSizes = useMemo(() => {
    if (activeCategory === 'porcellanato') return porcellanatoSizes;
    if (activeCategory === 'ceramic') return ceramicSizes;
    return [...new Set([...porcellanatoSizes, ...ceramicSizes])];
  }, [activeCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.stock === 0) return false;
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSize = !activeSize || p.size === activeSize;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.size.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      return matchesCategory && matchesSize && matchesSearch;
    });
  }, [products, activeCategory, activeSize, searchQuery]);

  const groupedBySizes = useMemo(() => {
    // Get all unique sizes from filtered products
    const allSizes = [...new Set(filteredProducts.map(p => p.size))];

    // Sort numerically: parse "WxH" → sort by W first, then H
    const parsePx = (s: string) => {
      const [w, h] = s.toLowerCase().split('x').map(Number);
      return { w: w || 0, h: h || 0, area: (w || 0) * (h || 0) };
    };
    allSizes.sort((a, b) => {
      const pa = parsePx(a), pb = parsePx(b);
      if (pa.area !== pb.area) return pa.area - pb.area;
      if (pa.w !== pb.w) return pa.w - pb.w;
      return pa.h - pb.h;
    });

    return allSizes.map(size => ({
      size,
      products: filteredProducts.filter(p => p.size === size),
    })).filter(g => g.products.length > 0);
  }, [filteredProducts, activeCategory]);

  const clearFilters = () => { setActiveCategory('all'); setActiveSize(null); setSearchQuery(''); };
  const hasActiveFilters = activeCategory !== 'all' || activeSize !== null || searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        onNavigate={(page) => { if (page === 'home') onBackToHome(); }}
        onSectionNavigate={(href) => {
          onBackToHome();
          setTimeout(() => { document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }); }, 300);
        }}
      />

      {/* Hero */}
      <section className="pt-20 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse at 15% 60%, rgba(245,158,11,0.15) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(220,38,38,0.1) 0%, transparent 45%)' }}
        />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-4">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-xs font-semibold tracking-wide uppercase">Koleksi Lengkap</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
              Katalog <span className="text-amber-400">Produk</span>
            </h1>
            <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
              Keramik & porcellanato premium untuk mempercantik setiap ruang
            </p>
          </motion.div>

          {/* Category tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <motion.button key={cat.id} onClick={() => { setActiveCategory(cat.id); setActiveSize(null); }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/30'
                    : 'bg-white/8 text-slate-300 hover:bg-white/15 border border-white/10'
                }`}
              >
                {cat.name}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                  {cat.count}
                </span>
              </motion.button>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="-mb-7">
            <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-2.5 flex gap-2.5 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input type="text" placeholder="Cari produk, ukuran, kode..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-9 py-3 rounded-xl border-0 bg-slate-50 focus:bg-white focus-visible:ring-amber-400 text-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`px-4 rounded-xl border transition-all flex items-center gap-2 text-sm font-semibold ${showFilters ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Ukuran
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pt-14 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Size filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mt-5 mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Filter Ukuran</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setActiveSize(null)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${!activeSize ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      Semua
                    </button>
                    {availableSizes.map((size) => (
                      <button key={size} onClick={() => setActiveSize(size === activeSize ? null : size)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSize === size ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'}`}>
                        {size} cm
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toolbar */}
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-2 flex-wrap">
              {hasActiveFilters ? (
                <>
                  {searchQuery && <Badge className="bg-amber-100 text-amber-700 border-0 gap-1 cursor-pointer hover:bg-amber-200" onClick={() => setSearchQuery('')}>"{searchQuery}" <X className="w-3 h-3" /></Badge>}
                  {activeCategory !== 'all' && <Badge className="bg-amber-100 text-amber-700 border-0 gap-1 cursor-pointer hover:bg-amber-200" onClick={() => setActiveCategory('all')}>{categories.find(c => c.id === activeCategory)?.name} <X className="w-3 h-3" /></Badge>}
                  {activeSize && <Badge className="bg-amber-100 text-amber-700 border-0 gap-1 cursor-pointer hover:bg-amber-200" onClick={() => setActiveSize(null)}>{activeSize} cm <X className="w-3 h-3" /></Badge>}
                  <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-red-500 transition-colors">Hapus semua</button>
                </>
              ) : (
                <span className="text-sm text-slate-500">
                  <span className="font-bold text-slate-800">{filteredProducts.length}</span> produk tersedia
                </span>
              )}
            </div>
            <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><Grid3X3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutList className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center py-32 gap-4">
              <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Memuat produk...</p>
            </div>
          )}

          {/* Grouped products */}
          {!loading && (
            <AnimatePresence mode="wait">
              <motion.div key={`${activeCategory}-${activeSize}-${searchQuery}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {groupedBySizes.length > 0 ? (
                  <div className="space-y-14">
                    {groupedBySizes.map(({ size, products: sizeProducts }, groupIdx) => (
                      <motion.div key={size}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: groupIdx * 0.06 }}
                      >
                        {/* Size header */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-7 bg-amber-500 rounded-full" />
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-0.5">Ukuran</p>
                              <h2 className="text-xl font-bold text-slate-900 leading-none">
                                {size.replace('x', ' × ')} <span className="text-slate-400 font-medium text-base">cm</span>
                              </h2>
                            </div>
                          </div>
                          <div className="flex-1 h-px bg-slate-200" />
                          <span className="text-xs font-semibold text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm">
                            {sizeProducts.length} produk
                          </span>
                        </div>

                        {/* Products */}
                        <div className={`grid gap-5 ${
                          viewMode === 'grid'
                            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                            : 'grid-cols-1'
                        }`}>
                          {sizeProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-28">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Produk tidak ditemukan</h3>
                    <p className="text-slate-400 text-sm mb-6">Coba kata kunci lain atau hapus filter yang aktif</p>
                    <button onClick={clearFilters} className="px-6 py-2.5 bg-amber-500 text-white rounded-full text-sm font-semibold hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/20">
                      Hapus Semua Filter
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {!loading && filteredProducts.length > 0 && (
            <p className="text-center text-sm text-slate-400 mt-14">
              Menampilkan <span className="font-bold text-slate-700">{filteredProducts.length}</span> dari <span className="font-bold text-slate-700">{products.length}</span> produk
            </p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
