import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Package } from 'lucide-react';
import { productApi } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductsProps {
  onViewAllProducts?: () => void;
}

export default function Products({ onViewAllProducts }: ProductsProps) {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    productApi.getAll({ featured: true })
      .then(res => setFeaturedProducts(res.data.data))
      .catch(() => setFeaturedProducts([]));
  }, []);

  return (
    <section id="products" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-100">
            Koleksi Produk
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Produk <span className="text-amber-500">Unggulan</span> Kami
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Pilihan terbaik keramik dan porcellanato berkualitas premium untuk mempercantik ruang Anda
          </p>

          {/* Brand Logos */}
          <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap mt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-36 md:w-44 h-20 flex items-center justify-center">
                <img src="/images/logo-ikad.jpg" alt="IKAD Ceramic Tile" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm text-slate-500 font-medium">Ceramic Tile</span>
            </motion.div>
            <div className="w-px h-16 bg-slate-300 hidden md:block" />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-36 md:w-44 h-20 flex items-center justify-center">
                <img src="/images/logo-premiere.png" alt="Premiere Series" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm text-slate-500 font-medium">Premiere Series</span>
            </motion.div>
            <div className="w-px h-16 bg-slate-300 hidden md:block" />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-36 md:w-44 h-20 flex items-center justify-center">
                <img src="/images/logo-porcellanato.jpg" alt="Porcellanato" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm text-slate-500 font-medium">Premium Collection</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Featured Products */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <span className="w-1 h-8 bg-amber-500 rounded-full" />
            Produk Pilihan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </motion.div>

        {/* CTA ke Katalog */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-20"
        >
          <Button
            onClick={onViewAllProducts}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-amber-500/25"
          >
            <Package className="w-5 h-5 mr-2" />
            Lihat Katalog Lengkap
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-slate-500 mt-4 text-sm">
            Jelajahi semua koleksi dengan fitur pencarian dan filter lengkap
          </p>
        </motion.div>

        {/* Category Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 cursor-pointer"
            onClick={onViewAllProducts}
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&q=80')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative z-10">
              <Badge className="mb-4 bg-yellow-400 text-slate-900 hover:bg-yellow-400">Premium</Badge>
              <h3 className="text-3xl font-bold text-white mb-2">Porcellanato</h3>
              <p className="text-slate-300 mb-6">Koleksi porcellanato premium dengan desain marble elegan dan ketahanan luar biasa</p>
              <div className="flex items-center text-yellow-400 font-medium group-hover:translate-x-2 transition-transform">
                Lihat Koleksi <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 to-red-900 p-8 cursor-pointer"
            onClick={onViewAllProducts}
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative z-10">
              <Badge className="mb-4 bg-white text-red-700 hover:bg-white">Classic</Badge>
              <h3 className="text-3xl font-bold text-white mb-2">Ceramic Tile</h3>
              <p className="text-red-100 mb-6">Keramik berkualitas dengan berbagai ukuran dan motif untuk setiap kebutuhan</p>
              <div className="flex items-center text-white font-medium group-hover:translate-x-2 transition-transform">
                Lihat Koleksi <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
