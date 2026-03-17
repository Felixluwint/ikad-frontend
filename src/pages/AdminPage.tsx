import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Package, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Boxes,
  Save,
  X,
  LogOut,
  AlertTriangle,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Check
} from 'lucide-react';
import { formatPrice, porcellanatoSizes, ceramicSizes } from '@/data/products';
import { productApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

type Product = {
  id: string;
  name: string;
  category: 'porcellanato' | 'ceramic';
  size: string;
  image: string;
  illustrationImages?: string[];
  price?: number;
  stock: number;
  description?: string;
  featured?: boolean;
};
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface AdminPageProps {
  onBackToHome: () => void;
}

interface ProductFormData {
  name: string;
  category: 'porcellanato' | 'ceramic';
  size: string;
  price: string;
  stock: string;
  description: string;
  featured: boolean;
  image: string;
  illustrationImages: string[];
}

const initialFormData: ProductFormData = {
  name: '',
  category: 'porcellanato',
  size: '60x60',
  price: '',
  stock: '',
  description: '',
  featured: false,
  image: '/images/placeholder.jpg',
  illustrationImages: [],
};

// Image Editor Component
interface ImageEditorProps {
  imageSrc: string;
  onSave: (editedImage: string) => void;
  onCancel: () => void;
}

function ImageEditor({ imageSrc, onSave, onCancel }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(1);
  const [flipV, setFlipV] = useState(1);
  const [scale, setScale] = useState(1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      drawImage(img, rotation, flipH, flipV, scale);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (image) {
      drawImage(image, rotation, flipH, flipV, scale);
    }
  }, [rotation, flipH, flipV, scale, image]);

  const drawImage = (img: HTMLImageElement, rot: number, fh: number, fv: number, scl: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate canvas size based on rotation
    const rad = (rot * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const newWidth = img.width * cos + img.height * sin;
    const newHeight = img.width * sin + img.height * cos;

    canvas.width = newWidth * scl;
    canvas.height = newHeight * scl;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Move to center
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply transformations
    ctx.rotate(rad);
    ctx.scale(fh * scl, fv * scl);

    // Draw image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    ctx.restore();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onSave(dataUrl);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center" style={{ minHeight: '300px' }}>
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-[400px] object-contain"
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRotation(r => r - 90)}
        >
          <RotateCw className="w-4 h-4 mr-1" style={{ transform: 'scaleX(-1)' }} />
          Putar Kiri
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRotation(r => r + 90)}
        >
          <RotateCw className="w-4 h-4 mr-1" />
          Putar Kanan
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFlipH(f => f * -1)}
        >
          <FlipHorizontal className="w-4 h-4 mr-1" />
          Flip H
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFlipV(f => f * -1)}
        >
          <FlipVertical className="w-4 h-4 mr-1" />
          Flip V
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setScale(s => Math.min(2, s + 0.1))}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setRotation(0); setFlipH(1); setFlipV(1); setScale(1); }}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Batal
        </Button>
        <Button onClick={handleSave} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
          <Check className="w-4 h-4 mr-2" />
          Simpan Gambar
        </Button>
      </div>
    </div>
  );
}

const SESSION_KEY = 'ikad_admin_session';

export default function AdminPage({ onBackToHome }: AdminPageProps) {
  const { login: apiLogin, logout: apiLogout, isAuthenticated } = useAuth();

  // ── Login state ──────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true' || isAuthenticated;
  });
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailInput || !passwordInput) {
      setLoginError('Email dan password wajib diisi.');
      return;
    }
    setIsLoginLoading(true);
    try {
      await apiLogin(emailInput, passwordInput);
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsLoggedIn(true);
      setLoginError('');
    } catch {
      setLoginError('Email atau password salah. Coba lagi.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPasswordInput('');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await apiLogout(); } catch {}
    sessionStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
    setPasswordInput('');
  };

  // ── Admin Content hooks (must be before any return) ─────────
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState<'all' | 'porcellanato' | 'ceramic'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'az' | 'za'>('az');
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'low' | 'empty'>('all');
  const [brandFilter, setBrandFilter] = useState<'all' | 'IKAD' | 'PREMIERE'>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [illustrationFiles, setIllustrationFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoggedIn) loadProducts();
  }, [isLoggedIn]);

  const loadProducts = async () => {
    try {
      const res = await productApi.getAll({ show_all: true });
      setProducts(res.data.data);
    } catch {
      toast.error('Gagal memuat produk!');
    }
  };

  // ── Login Screen ─────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full max-w-md ${isShaking ? 'animate-bounce' : ''}`}
          style={isShaking ? { animation: 'shake 0.4s ease-in-out' } : {}}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin IKAD</h1>
            <p className="text-slate-400 text-sm mt-1">Masukkan password untuk melanjutkan</p>
          </div>

          {/* Card Login */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Email</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setLoginError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="admin@ikadmedan.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => { setPasswordInput(e.target.value); setLoginError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Masukkan password..."
                    className={`w-full px-4 py-3 pr-12 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      loginError
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-white/20 focus:ring-amber-500/50 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-1"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {loginError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoginLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold text-base shadow-lg shadow-amber-500/25 transition-all"
              >
                {isLoginLoading ? 'Memproses...' : 'Masuk ke Admin'}
              </Button>

              <Button
                variant="ghost"
                onClick={onBackToHome}
                className="w-full text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </div>
          </div>

          <p className="text-center text-slate-500 text-xs mt-6">
            Akses terbatas untuk pengelola toko
          </p>
        </motion.div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            60% { transform: translateX(-10px); }
            80% { transform: translateX(10px); }
          }
        `}</style>
      </div>
    );
  }

  // ── Admin Content (setelah login) ────────────────────────────

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeTab === 'all' || p.category === activeTab;
      const matchesBrand = brandFilter === 'all' || (p as any).brand === brandFilter;
      const matchesStock =
        stockFilter === 'all' ? true :
        stockFilter === 'available' ? p.stock > 10 :
        stockFilter === 'low' ? (p.stock > 0 && p.stock <= 10) :
        stockFilter === 'empty' ? p.stock === 0 : true;
      return matchesSearch && matchesCategory && matchesStock && matchesBrand;
    })
    .sort((a, b) => {
      if (sortBy === 'az') return a.name.localeCompare(b.name);
      if (sortBy === 'za') return b.name.localeCompare(a.name);
      return 0;
    });

  const handleAddProduct = () => {
    setFormData(initialFormData);
    setPreviewImage(null);
    setIsAddDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    const illustrations = (product as any).illustration_images || product.illustrationImages || [];
    setFormData({
      name: product.name,
      category: product.category,
      size: product.size,
      price: product.price?.toString() || '',
      stock: product.stock.toString(),
      description: product.description || '',
      featured: product.featured || false,
      image: product.image,
      illustrationImages: illustrations,
    });
    setPreviewImage(product.image);
    setIllustrationFiles([]);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImage = () => {
    if (previewImage || formData.image) {
      setIsImageEditorOpen(true);
    }
  };

  const handleImageEdited = (editedImage: string) => {
    setPreviewImage(editedImage);
    setFormData({ ...formData, image: editedImage });
    setIsImageEditorOpen(false);
  };

  const saveProduct = async (isEdit: boolean) => {
    if (!formData.name.trim()) {
      toast.error('Nama produk wajib diisi!');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('size', formData.size);
    data.append('stock', formData.stock || '0');
    data.append('description', formData.description);
    data.append('featured', formData.featured ? '1' : '0');
    if (formData.price) data.append('price', formData.price);
    if (imageFile) data.append('image', imageFile);

    // Kirim existing illustration URLs yang masih ada (tidak dihapus user)
    const existingUrls = formData.illustrationImages.filter(img => img.startsWith('http'));
    existingUrls.forEach((url, i) => {
      data.append(`existing_illustrations[${i}]`, url);
    });
    // Flag bahwa ilustrasi sudah diupdate (termasuk kalau semua dihapus)
    data.append('illustrations_updated', '1');

    // Kirim file ilustrasi baru
    illustrationFiles.forEach((file, i) => {
      data.append(`illustration_images[${i}]`, file);
    });

    if (isEdit) data.append('_method', 'PUT');

    try {
      if (isEdit && selectedProduct) {
        await productApi.update(Number(selectedProduct.id), data);
        toast.success('Produk berhasil diperbarui!');
      } else {
        await productApi.create(data);
        toast.success('Produk berhasil ditambahkan!');
      }
      await loadProducts();
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setImageFile(null);
      setIllustrationFiles([]);
    } catch {
      toast.error('Gagal menyimpan produk!');
    }
  };

  const confirmDelete = async () => {
    if (selectedProduct) {
      try {
        await productApi.delete(Number(selectedProduct.id));
        toast.success('Produk berhasil dihapus!');
        await loadProducts();
        setIsDeleteDialogOpen(false);
      } catch {
        toast.error('Gagal menghapus produk!');
      }
    }
  };

  const handleReset = () => {
    toast.info('Reset data tidak tersedia di mode database.');
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Habis', color: 'bg-red-100 text-red-700' };
    if (stock < 50) return { label: 'Menipis', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Tersedia', color: 'bg-green-100 text-green-700' };
  };

  const totalValue = products.reduce((sum, p) => sum + (p.price || 0) * p.stock, 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock < 50).length;

  const availableSizes = formData.category === 'porcellanato' ? porcellanatoSizes : ceramicSizes;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={onBackToHome}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Beranda
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Produk</p>
                <p className="text-2xl font-bold text-slate-900">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Stok</p>
                <p className="text-2xl font-bold text-slate-900">{totalStock}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Boxes className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Nilai Inventori</p>
                <p className="text-2xl font-bold text-slate-900">{formatPrice(totalValue)}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Stok Menipis</p>
                <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {lowStockCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              onClick={handleAddProduct}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-slate-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Data
            </Button>
          </div>

          <div className="flex-1" />

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'porcellanato', label: 'Porcellanato' },
            { id: 'ceramic', label: 'Ceramic Tile' },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-full ${
                activeTab === tab.id
                  ? 'bg-slate-900 hover:bg-slate-800'
                  : 'border-slate-300'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Filter & Sort Row */}
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          {/* Brand Filter */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {[
              { id: 'all', label: 'Semua Brand' },
              { id: 'IKAD', label: 'IKAD' },
              { id: 'PREMIERE', label: 'Premiere' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBrandFilter(b.id as typeof brandFilter)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  brandFilter === b.id
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Stock Filter */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {[
              { id: 'all', label: 'Semua Stok' },
              { id: 'available', label: '✅ Ada Stok' },
              { id: 'low', label: '⚠️ Menipis' },
              { id: 'empty', label: '❌ Habis' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStockFilter(s.id as typeof stockFilter)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  stockFilter === s.id
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {[
              { id: 'az', label: 'A → Z' },
              { id: 'za', label: 'Z → A' },
              { id: 'default', label: 'Default' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id as typeof sortBy)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  sortBy === s.id
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <span className="text-sm text-slate-400 ml-auto">
            {filteredProducts.length} produk ditemukan
          </span>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Produk</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Brand</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ukuran</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Harga</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Stok</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                              }}
                            />
                            <div>
                              <p className="font-medium text-slate-900">{product.name}</p>
                              {product.featured && (
                                <Badge className="bg-amber-100 text-amber-700 text-xs">Unggulan</Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={(product as any).brand === 'PREMIERE' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}>
                            {(product as any).brand || 'IKAD'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={product.category === 'porcellanato' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                            {product.category === 'porcellanato' ? 'Porcellanato' : 'Ceramic'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{product.size} cm</td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {product.stock < 50 ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            )}
                            <span className={product.stock < 50 ? 'text-red-600 font-medium' : 'text-slate-600'}>
                              {product.stock}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(product)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Tidak ada produk ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setPreviewImage(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? 'Perbarui informasi produk' : 'Isi detail produk baru'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Image Upload Section */}
            <div className="border rounded-xl p-4 bg-slate-50">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Gambar Produk</label>
              <div className="flex gap-4 items-start">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center border">
                  {previewImage || formData.image ? (
                    <img
                      src={previewImage || formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Gambar
                  </Button>
                  {(previewImage || formData.image) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEditImage}
                      className="w-full"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Gambar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Illustration Images Section */}
            <div className="border rounded-xl p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700">
                  Foto Ilustrasi Ruangan
                  <span className="ml-2 text-xs text-slate-400 font-normal">(maks. 3 foto)</span>
                </label>
                {formData.illustrationImages.length < 3 && (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const remaining = 3 - formData.illustrationImages.length;
                        const newFiles = files.slice(0, remaining);
                        setIllustrationFiles(prev => [...prev, ...newFiles].slice(0, 3));
                        newFiles.forEach((file) => {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const result = ev.target?.result as string;
                            setFormData(prev => ({
                              ...prev,
                              illustrationImages: [...prev.illustrationImages, result].slice(0, 3)
                            }));
                          };
                          reader.readAsDataURL(file);
                        });
                        e.target.value = '';
                      }}
                    />
                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-50 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      Tambah Foto
                    </span>
                  </label>
                )}
              </div>
              {formData.illustrationImages.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Belum ada foto ilustrasi
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {formData.illustrationImages.map((img, i) => (
                    <div key={i} className="relative group w-20 h-20">
                      <img src={img} alt={`ilustrasi ${i + 1}`} className="w-full h-full object-cover rounded-lg border" />
                      <button
                        onClick={() => {
                          const img = formData.illustrationImages[i];
                          // If it's a new file (base64), remove from illustrationFiles too
                          if (!img.startsWith('http')) {
                            const base64Index = formData.illustrationImages.filter(x => !x.startsWith('http')).indexOf(img);
                            setIllustrationFiles(prev => prev.filter((_, idx) => idx !== base64Index));
                          }
                          setFormData(prev => ({
                            ...prev,
                            illustrationImages: prev.illustrationImages.filter((_, idx) => idx !== i)
                          }));
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">{i + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Nama Produk</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: HMGPL SWAN WHITE"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Kategori</label>
                <Select
                  value={formData.category}
                  onValueChange={(value: 'porcellanato' | 'ceramic') => {
                    setFormData({ 
                      ...formData, 
                      category: value,
                      size: value === 'porcellanato' ? '60x60' : '20x25'
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porcellanato">Porcellanato</SelectItem>
                    <SelectItem value="ceramic">Ceramic Tile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Ukuran</label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSizes.map((size) => (
                      <SelectItem key={size} value={size}>{size} cm</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Harga (Rp)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="185000"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Stok</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Deskripsi</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi produk..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="featured" className="text-sm text-slate-700">
                Tandai sebagai produk unggulan
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setPreviewImage(null);
                }}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button
                onClick={() => saveProduct(isEditDialogOpen)}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Editor Dialog */}
      <Dialog open={isImageEditorOpen} onOpenChange={setIsImageEditorOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Gambar</DialogTitle>
            <DialogDescription>
              Putar, flip, atau zoom gambar sesuai kebutuhan
            </DialogDescription>
          </DialogHeader>
          {(previewImage || formData.image) && (
            <ImageEditor
              imageSrc={previewImage || formData.image}
              onSave={handleImageEdited}
              onCancel={() => setIsImageEditorOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk <strong>{selectedProduct?.name}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={confirmDelete}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
