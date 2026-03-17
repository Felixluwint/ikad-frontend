import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Images,
  Sparkles,
  ZoomIn,
} from 'lucide-react';
import VirtualRoomStudio from '@/components/VirtualRoomStudio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { resolveProductImage } from '@/lib/productMedia';
import { cn } from '@/lib/utils';

type Product = {
  id: string | number;
  name: string;
  category: 'porcellanato' | 'ceramic';
  size: string;
  image?: string | null;
  illustrationImages?: string[];
  illustration_images?: string[] | null;
  price?: number | string;
  stock: number;
  description?: string | null;
  featured?: boolean;
  brand?: string | null;
  stock_status?: string | null;
  stock_label?: string | null;
};

interface ProductCardProps {
  product: Product;
  index: number;
}

function getAspectClass(size: string) {
  const map: Record<string, string> = {
    '20x25': 'aspect-[4/5]',
    '25x40': 'aspect-[5/8]',
    '30x30': 'aspect-square',
    '30x60': 'aspect-[1/2]',
    '40x40': 'aspect-square',
    '50x50': 'aspect-square',
    '60x60': 'aspect-square',
    '80x80': 'aspect-square',
    '60x120': 'aspect-[1/2]',
  };

  return map[size] || 'aspect-square';
}

function formatPrice(price?: number | string) {
  if (price === undefined || price === null || price === '') {
    return 'Harga konsultasi';
  }

  const normalized = Number(price);
  if (Number.isNaN(normalized)) {
    return 'Harga konsultasi';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(normalized);
}

function getStockBadge(product: Product) {
  const normalizedStatus = product.stock_status?.toLowerCase();

  if (normalizedStatus === 'out' || normalizedStatus === 'out_of_stock' || product.stock === 0) {
    return {
      label: product.stock_label || 'Stok habis',
      tone: 'text-red-600',
      chip: 'bg-red-50 text-red-700',
    };
  }

  if (product.stock_label) {
    const tone = normalizedStatus === 'limited' ? 'text-amber-600' : 'text-green-600';
    const chip = normalizedStatus === 'limited' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700';

    return {
      label: product.stock_label,
      tone,
      chip,
    };
  }

  const limitedThreshold = ['40x40', '50x50'].includes(product.size) ? 200 : 100;

  if (product.stock < limitedThreshold) {
    return {
      label: product.stock <= 50 ? `Sisa ${product.stock} ktk` : 'Stok terbatas',
      tone: 'text-amber-600',
      chip: 'bg-amber-50 text-amber-700',
    };
  }

  return {
    label: 'Ready stock',
    tone: 'text-emerald-600',
    chip: 'bg-emerald-50 text-emerald-700',
  };
}

function buildWhatsAppLink(product: Product) {
  const text = encodeURIComponent(
    `Halo IKAD, saya tertarik dengan produk ${product.name} ukuran ${product.size} dan ingin konsultasi detail serta visual room-nya.`,
  );

  return `https://wa.me/6285261738861?text=${text}`;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'visualizer'>('details');

  const productImage = resolveProductImage(product.image);
  const stockBadge = useMemo(() => getStockBadge(product), [product]);
  const brandLabel = product.brand?.trim() || (product.category === 'porcellanato' ? 'PREMIERE' : 'IKAD');
  const categoryLabel = product.category === 'porcellanato' ? 'Porcellanato' : 'IKAD Ceramic';
  const description =
    product.description?.trim() || 'Pilihan material premium untuk proyek residensial dan komersial dengan tampilan yang rapi dan modern.';

  const illustrationImages = useMemo(
    () =>
      [...new Set([...(product.illustrationImages ?? []), ...(product.illustration_images ?? [])])].filter(
        (image): image is string => Boolean(image && image.trim()),
      ),
    [product.illustrationImages, product.illustration_images],
  );

  const hasIllustrations = illustrationImages.length > 0;
  const galleryImage = hasIllustrations ? illustrationImages[activeSlide] : productImage;

  const detailStats = useMemo(
    () => [
      { label: 'Brand', value: brandLabel },
      { label: 'Ukuran', value: `${product.size} cm` },
      { label: 'Harga', value: formatPrice(product.price) },
      { label: 'Ketersediaan', value: stockBadge.label, tone: stockBadge.tone },
      { label: 'Visual preset', value: '6 room 3D' },
      { label: 'Ilustrasi', value: hasIllustrations ? `${illustrationImages.length} gambar` : 'Siap via virtual room' },
    ],
    [brandLabel, hasIllustrations, illustrationImages.length, product.price, product.size, stockBadge.label, stockBadge.tone],
  );

  useEffect(() => {
    if (!isDialogOpen || activeTab !== 'details' || illustrationImages.length <= 1 || !isAutoPlaying) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % illustrationImages.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [activeTab, illustrationImages.length, isAutoPlaying, isDialogOpen]);

  const handleOpenDialog = () => {
    setActiveSlide(0);
    setActiveTab('details');
    setIsAutoPlaying(true);
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setActiveTab('details');
      setIsAutoPlaying(true);
      setActiveSlide(0);
    }
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setActiveSlide((current) => (current - 1 + illustrationImages.length) % illustrationImages.length);
  };

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setActiveSlide((current) => (current + 1) % illustrationImages.length);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-shadow duration-500 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)]"
        >
          <button type="button" onClick={handleOpenDialog} className="block w-full text-left">
            <div className={cn('relative overflow-hidden bg-slate-100', getAspectClass(product.size))}>
              {!imageLoaded ? (
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#e2e8f0_0%,#f8fafc_60%,#cbd5e1_100%)] animate-pulse" />
              ) : null}

              <img
                src={productImage}
                alt={product.name}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
                className={cn(
                  'h-full w-full object-cover transition-all duration-700',
                  isHovered ? 'scale-[1.08]' : 'scale-100',
                  imageLoaded ? 'opacity-100' : 'opacity-0',
                )}
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0.06)_38%,rgba(15,23,42,0.55)_100%)]" />

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Badge className="border-0 bg-white/92 text-slate-900 shadow-sm">{categoryLabel}</Badge>
                <Badge className="border-0 bg-slate-900/85 text-white shadow-sm">{product.size} cm</Badge>
              </div>

              <div className="absolute left-4 right-4 top-16 flex items-center justify-between gap-3">
                <span className="rounded-full bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                  Virtual room ready
                </span>
                {hasIllustrations ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
                    <Images className="h-3 w-3" />
                    {illustrationImages.length} ilustrasi
                  </span>
                ) : null}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex items-center justify-center bg-slate-950/28"
              >
                <motion.div
                  initial={{ scale: 0.88, opacity: 0 }}
                  animate={{ scale: isHovered ? 1 : 0.88, opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
                    <ZoomIn className="h-6 w-6 text-slate-900" />
                  </div>
                  <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    Buka detail & preview
                  </span>
                </motion.div>
              </motion.div>

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{brandLabel}</p>
                  <h3 className="line-clamp-2 text-lg font-bold text-white">{product.name}</h3>
                </div>
                <span className={cn('rounded-full px-3 py-1 text-xs font-semibold shadow-sm', stockBadge.chip)}>
                  {stockBadge.label}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{description}</p>

              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Harga</p>
                  <p className="text-base font-bold text-slate-900">{formatPrice(product.price)}</p>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  6 room 3D
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Premium finish
                </span>
                <span className="inline-flex items-center gap-1">
                  <Grid3X3 className="h-3.5 w-3.5 text-amber-500" />
                  Visual room ready
                </span>
              </div>
            </div>
          </button>
        </motion.div>
      </motion.article>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent
          className="flex max-h-[92vh] flex-col overflow-hidden border border-slate-200 bg-white p-0 shadow-[0_40px_120px_rgba(15,23,42,0.2)] sm:rounded-[32px]"
          style={{ width: 'min(1240px, calc(100vw - 1rem))', maxWidth: '1240px' }}
        >
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'details' | 'visualizer')}
            className="flex min-h-0 flex-1 flex-col gap-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.7)_0%,rgba(255,255,255,1)_22%)]"
          >
            <div className="shrink-0 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <DialogHeader className="max-w-3xl space-y-3 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-0 bg-slate-900 text-white">{brandLabel}</Badge>
                    <Badge className="border-0 bg-slate-100 text-slate-600">{categoryLabel}</Badge>
                    <Badge className="border-0 bg-amber-50 text-amber-700">{product.size} cm</Badge>
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-slate-900 sm:text-3xl">
                      {product.name}
                    </DialogTitle>
                    <DialogDescription className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                      {description}
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1.5 lg:w-[340px]">
                  <TabsTrigger value="details" className="rounded-xl py-2.5 text-sm font-semibold">
                    Detail Produk
                  </TabsTrigger>
                  <TabsTrigger value="visualizer" className="rounded-xl py-2.5 text-sm font-semibold">
                    Virtual Room
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="details" className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          {hasIllustrations ? 'Gallery Preview' : 'Surface Preview'}
                        </p>
                        <h4 className="mt-1 text-lg font-bold text-slate-900">
                          {hasIllustrations ? 'Ilustrasi pemasangan produk' : 'Tile swatch siap untuk virtual room'}
                        </h4>
                      </div>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {hasIllustrations ? `${activeSlide + 1} / ${illustrationImages.length}` : 'Preview'}
                      </span>
                    </div>

                    <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-slate-100 shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
                      <div className="relative aspect-[16/10]">
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={`${galleryImage}-${activeSlide}`}
                            src={galleryImage}
                            alt={hasIllustrations ? `${product.name} ilustrasi ${activeSlide + 1}` : product.name}
                            className={cn(
                              'absolute inset-0 h-full w-full object-cover',
                              hasIllustrations ? 'object-cover' : 'object-contain bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] p-10',
                            )}
                            initial={{ opacity: 0.35, scale: 1.02 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0.4, scale: 0.985 }}
                            transition={{ duration: 0.28 }}
                          />
                        </AnimatePresence>

                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0.08)_80%,rgba(15,23,42,0.24)_100%)]" />

                        {hasIllustrations && illustrationImages.length > 1 ? (
                          <>
                            <button
                              type="button"
                              onClick={prevSlide}
                              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={nextSlide}
                              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </>
                        ) : null}

                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          <Badge className="border-0 bg-white/92 text-slate-700">
                            {hasIllustrations ? 'Installed look' : 'Tile reference'}
                          </Badge>
                          <Badge className="border-0 bg-slate-900/85 text-white">
                            {hasIllustrations ? 'Premium catalogue visual' : 'Virtual room enabled'}
                          </Badge>
                        </div>

                        {isAutoPlaying && hasIllustrations && illustrationImages.length > 1 ? (
                          <div className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                            Auto
                          </div>
                        ) : null}

                        {!hasIllustrations ? (
                          <div className="absolute inset-x-5 bottom-5 rounded-[22px] bg-white/92 px-4 py-3 shadow-[0_16px_30px_rgba(15,23,42,0.12)] backdrop-blur">
                            <p className="text-sm font-semibold text-slate-900">Belum ada foto ilustrasi untuk produk ini.</p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                              Pakai tab Virtual Room untuk melihat simulasi pemasangan di 6 virtual room 3D.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {hasIllustrations && illustrationImages.length > 1 ? (
                      <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                        {illustrationImages.map((image, imageIndex) => {
                          const isActive = imageIndex === activeSlide;

                          return (
                            <button
                              key={`${image}-${imageIndex}`}
                              type="button"
                              onClick={() => {
                                setIsAutoPlaying(false);
                                setActiveSlide(imageIndex);
                              }}
                              className={cn(
                                'overflow-hidden rounded-2xl border-2 transition-all',
                                isActive ? 'border-slate-900 shadow-md' : 'border-transparent opacity-70 hover:opacity-100',
                              )}
                            >
                              <img src={image} alt="" className="aspect-square h-full w-full object-cover" />
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Why it works</p>
                      <h5 className="mt-2 text-lg font-bold text-slate-900">Cocok untuk user yang ingin visual cepat</h5>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Dialog ini menggabungkan detail produk, gallery pemasangan, dan virtual room supaya customer bisa compare feel tile tanpa keluar dari katalog.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-amber-100 bg-amber-50/80 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Next Step</p>
                      <h5 className="mt-2 text-lg font-bold text-slate-900">Masuk ke visual room</h5>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Pilih preset ruang, atur scale tile, dan lihat kombinasi floor atau wall untuk produk ini.
                      </p>
                      <Button
                        type="button"
                        onClick={() => setActiveTab('visualizer')}
                        className="mt-4 h-11 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Buka Virtual Room
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Ringkasan Produk</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      {detailStats.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                        >
                          <span className="text-sm text-slate-400">{item.label}</span>
                          <span className={cn('text-sm font-semibold text-slate-700', item.tone)}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Selling Points</p>
                    <div className="mt-4 space-y-3">
                      {[
                        'Preview tile langsung dari katalog tanpa pindah halaman.',
                        'Ada 6 scene 3D asli yang lebih rapi untuk bantu customer membayangkan pemasangan.',
                        'Cocok untuk sales assist, konsultasi cepat, dan pengambilan keputusan desain.',
                      ].map((point) => (
                        <div key={point} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <p className="text-sm leading-relaxed text-slate-600">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)] p-5 text-white shadow-[0_22px_60px_rgba(15,23,42,0.22)]">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">Consultation CTA</p>
                    <h5 className="mt-2 text-lg font-bold">Mau kirim ke tim sales?</h5>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      Tinggal share produk ini ke WhatsApp untuk minta mockup proyek, stok, atau rekomendasi alternatif senada.
                    </p>
                    <a
                      href={buildWhatsAppLink(product)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-amber-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                    >
                      Tanya Produk Ini
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visualizer" className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
              <VirtualRoomStudio product={product} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
