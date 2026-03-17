import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Instagram, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Alamat',
    content: 'Jl. Gunung Krakatau No.47 ABC, Glugur Darat I, Medan Timur, Kota Medan, Sumatera Utara 20236',
    link: null
  },
  {
    icon: Phone,
    title: 'Telepon',
    content: '+62 852-6173-8861',
    link: 'tel:+6285261738861'
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'info@ikadmedan.com',
    link: 'mailto:info@ikadmedan.com'
  },
  {
    icon: Clock,
    title: 'Jam Operasional',
    content: 'Senin - Sabtu: 08:00 - 17:00 WIB',
    link: null
  }
];

const socialLinks = [
  {
    icon: Instagram,
    name: 'Instagram',
    link: 'https://instagram.com/ikadmedan',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500'
  },
  {
    icon: MessageCircle,
    name: 'WhatsApp',
    link: 'https://wa.me/6285261738861',
    color: 'bg-green-500'
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Pesan Terkirim!',
      description: 'Terima kasih telah menghubungi kami. Kami akan segera merespons.',
    });
    
    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-100">
            Hubungi Kami
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Mari <span className="text-amber-500">Berkolaborasi</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Punya pertanyaan atau ingin konsultasi? Tim kami siap membantu Anda 
            menemukan solusi terbaik untuk kebutuhan keramik Anda.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Informasi Kontak</h3>
            
            <div className="space-y-3 mb-8">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm border border-slate-100"
                >
                  <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{item.title}</p>
                    {item.link ? (
                      <a
                        href={item.link}
                        target={item.link.startsWith('http') ? '_blank' : undefined}
                        rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-slate-800 font-medium hover:text-amber-600 transition-colors text-sm leading-snug block"
                      >
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-slate-800 font-medium text-sm leading-snug">{item.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Ikuti Kami</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-12 h-12 ${social.color} rounded-xl flex items-center justify-center text-white shadow-lg`}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 rounded-2xl overflow-hidden shadow-lg"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.8353334553954!2d98.68106209999999!3d3.6250685000000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x303131f36299a741%3A0xc513ace9dda978e1!2sMitra%20Pelita%20Sukses.%20PT!5e0!3m2!1sid!2sid!4v1773237100842!5m2!1sid!2sid"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Kirim Pesan</h3>
              <p className="text-slate-500 mb-6">Isi formulir di bawah ini dan kami akan segera menghubungi Anda.</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Lengkap
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama Anda"
                    className="rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@anda.com"
                      className="rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Nomor Telepon
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+62 xxx xxxx xxxx"
                      className="rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    Pesan
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tulis pesan Anda di sini..."
                    rows={5}
                    className="rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500 resize-none"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-lg transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Mengirim...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Kirim Pesan
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
