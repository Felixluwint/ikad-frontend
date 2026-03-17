import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Award, Users, Building2, Truck, CheckCircle2, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Award,
    title: 'Kualitas Premium',
    description: 'Produk berkualitas tinggi dengan standar internasional'
  },
  {
    icon: Users,
    title: 'Pelayanan Terbaik',
    description: 'Tim profesional siap membantu kebutuhan Anda'
  },
  {
    icon: Building2,
    title: 'Showroom Luas',
    description: 'Kunjungi showroom kami untuk melihat langsung koleksi'
  },
  {
    icon: Truck,
    title: 'Pengiriman Cepat',
    description: 'Layanan pengiriman ke seluruh wilayah Indonesia'
  }
];

const stats = [
  { value: '15+', label: 'Tahun Pengalaman', suffix: '' },
  { value: '5000', label: 'Produk Terjual', suffix: '+' },
  { value: '1000', label: 'Pelanggan Puas', suffix: '+' },
  { value: '50', label: 'Mitra Bisnis', suffix: '+' }
];

const values = [
  {
    title: 'Integritas',
    description: 'Kami menjunjung tinggi kejujuran dan transparansi dalam setiap transaksi'
  },
  {
    title: 'Kualitas',
    description: 'Hanya produk terbaik yang kami tawarkan kepada pelanggan'
  },
  {
    title: 'Inovasi',
    description: 'Selalu mengikuti perkembangan desain dan teknologi terbaru'
  },
  {
    title: 'Kepuasan',
    description: 'Kepuasan pelanggan adalah prioritas utama kami'
  }
];

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const isStatsInView = useInView(statsRef, { once: true, margin: '-100px' });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

  return (
    <section id="about" ref={containerRef} className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-900">
        <motion.div 
          style={{ y }}
          className="absolute inset-0 opacity-30"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80')`,
            }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/20 border-amber-500/30">
            Tentang Kami
          </Badge>
          {/* Logo MPS */}
          <div className="flex items-center justify-center mb-3">
            <img
              src="/images/logo-mps-amber.png"
              alt="MPS Logo"
              className="h-20 w-auto"
              style={{ filter: 'drop-shadow(0 0 12px rgba(245,158,11,0.4))' }}
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            PT. Mitra Pelita Sukses
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Sejak 2009, kami telah menjadi distributor terpercaya untuk keramik dan porcellanato 
            berkualitas premium di Medan dan sekitarnya. Komitmen kami adalah memberikan 
            produk terbaik dengan pelayanan profesional.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500/30 transition-colors">
                <feature.icon className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <div ref={statsRef} className="mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isStatsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-3xl p-8 border border-amber-500/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-amber-400" />
              <h3 className="text-2xl font-bold text-white">Visi</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Menjadi distributor keramik dan porcellanato terkemuka di Sumatera Utara 
              yang dikenal karena kualitas produk, pelayanan prima, dan inovasi berkelanjutan.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-amber-400" />
              <h3 className="text-2xl font-bold text-white">Misi</h3>
            </div>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                Menyediakan produk berkualitas dengan harga kompetitif
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                Memberikan pelayanan profesional dan responsif
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                Membangun hubungan jangka panjang dengan pelanggan
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                Berkontribusi pada pembangunan infrastruktur berkualitas
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">Nilai-Nilai Kami</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                  <span className="text-2xl font-bold text-white">{value.title[0]}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{value.title}</h4>
                <p className="text-sm text-slate-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
