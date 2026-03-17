import { motion } from 'framer-motion';
import { Instagram, MessageCircle, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: 'home' | 'products' | 'admin') => void;
}

const footerLinks = {
  produk: [
    { name: 'Porcellanato', action: 'products' },
    { name: 'Ceramic Tile', action: 'products' },
    { name: 'Produk Unggulan', href: '#products' },
    { name: 'Katalog Lengkap', action: 'products' },
  ],
  perusahaan: [
    { name: 'Tentang Kami', href: '#about' },
    { name: 'Visi & Misi', href: '#about' },
    { name: 'Karir', href: '#' },
    { name: 'Berita', href: '#' },
  ],
  layanan: [
    { name: 'Konsultasi', href: '#contact' },
    { name: 'Pengiriman', href: '#contact' },
    { name: 'Instalasi', href: '#contact' },
    { name: 'Garansi', href: '#contact' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com/ikadmedan', label: 'Instagram' },
  { icon: MessageCircle, href: 'https://wa.me/6285261738861', label: 'WhatsApp' },
  { icon: Mail, href: 'mailto:info@ikadmedan.com', label: 'Email' },
];

export default function Footer({ onNavigate }: FooterProps) {
  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLinkClick = (item: { name: string; href?: string; action?: string }) => {
    if (item.action && onNavigate) {
      onNavigate(item.action as 'home' | 'products' | 'admin');
    } else if (item.href) {
      scrollToSection(item.href);
    }
  };

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="/images/logo-ikad-small.png" 
                alt="IKAD Logo" 
                className="h-12 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-slate-400 mb-6 leading-relaxed max-w-sm">
                Distributor resmi keramik dan porcellanato berkualitas premium. 
                Melayani kebutuhan konstruksi dan interior di Medan dan sekitarnya sejak 2009.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-400">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">Jl. Gatot Subroto No. 123, Medan</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Phone className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">+62 812-3456-7890</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">info@ikadmedan.com</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-slate-800 hover:bg-amber-500 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              <h4 className="text-lg font-semibold mb-4 capitalize">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleLinkClick(link)}
                      className="text-slate-400 hover:text-amber-500 transition-colors text-sm flex items-center gap-1 group text-left"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} PT. Mitra Pelita Sukses (IKAD Medan). All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-amber-500 transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-amber-500 transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-12 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center z-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    </footer>
  );
}
