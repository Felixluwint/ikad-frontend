export interface Product {
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
}

// Local storage key for products
const PRODUCTS_STORAGE_KEY = 'ikad_products';

const defaultProducts: Product[] = [
  // Porcellanato 60x60
  {
    id: 'p1',
    name: 'HMGPL SWAN WHITE',
    category: 'porcellanato',
    size: '60x60',
    image: '/images/porcellanato-swan-white.jpg',
    description: 'Elegant white porcelain tile with smooth finish',
    featured: true,
    stock: 150,
    price: 185000
  },
  {
    id: 'p2',
    name: 'HT PEARL WHITE',
    category: 'porcellanato',
    size: '60x60',
    image: '/images/porcellanato-pearl-white.jpg',
    description: 'Premium pearl white with glossy surface',
    stock: 120,
    price: 195000
  },
  {
    id: 'p3',
    name: 'HTGPL IMOLA',
    category: 'porcellanato',
    size: '60x60',
    image: '/images/porcellanato-imola.jpg',
    description: 'Italian-inspired marble design',
    stock: 80,
    price: 210000
  },
  {
    id: 'p4',
    name: 'HTGPL PLATINA MARBLE I/N',
    category: 'porcellanato',
    size: '60x60',
    image: '/images/porcellanato-platina.jpg',
    description: 'Luxurious platinum marble pattern',
    stock: 95,
    price: 225000
  },
  {
    id: 'p5',
    name: 'HMGPL DOVE WHITE',
    category: 'porcellanato',
    size: '60x60',
    image: '/images/porcellanato-dove-white.jpg',
    description: 'Soft dove white for modern spaces',
    stock: 110,
    price: 190000
  },
  {
    id: 'p6',
    name: 'HTGPL LAGUNA N',
    category: 'porcellanato',
    size: '60x60',
    image: '/images/porcellanato-laguna.jpg',
    description: 'Refreshing lagoon blue tones',
    stock: 75,
    price: 205000
  },
  {
    id: 'p7',
    name: 'HTGPL PAGANI I/N',
    category: 'porcellanato',
    size: '60x60',
    image: '/images/porcellanato-pagani.jpg',
    description: 'Sophisticated Pagani marble design',
    stock: 60,
    price: 235000
  },
  {
    id: 'p8',
    name: 'HMGPL NEBULA WHITE',
    category: 'porcellanato',
    size: '60x60',
    image: '/images/porcellanato-nebula.jpg',
    description: 'Stunning nebula-inspired pattern',
    stock: 85,
    price: 215000
  },
  {
    id: 'p9',
    name: 'HMGPM HELIOS WHITE',
    category: 'porcellanato',
    size: '60x60',
    image: '/images/porcellanato-helios-white.jpg',
    description: 'Bright helios white for any room',
    stock: 130,
    price: 175000
  },
  {
    id: 'p10',
    name: 'HMGPM HELIOS BLUE',
    category: 'porcellanato',
    size: '60x60',
    image: '/images/porcellanato-helios-blue.jpg',
    description: 'Elegant blue with marble veins',
    featured: true,
    stock: 100,
    price: 185000
  },
  {
    id: 'p11',
    name: 'HMGPM HELIOS GREEN',
    category: 'porcellanato',
    size: '60x60',
    image: '/images/porcellanato-helios-green.jpg',
    description: 'Nature-inspired green tones',
    stock: 70,
    price: 185000
  },
  {
    id: 'p12',
    name: 'HTGPM VOLCANO WHITE',
    category: 'porcellanato',
    size: '60x60',
    image: '/images/porcellanato-volcano.jpg',
    description: 'Dramatic volcano-inspired design',
    stock: 55,
    price: 245000
  },
  {
    id: 'p13',
    name: 'HMGPM OASIS GREY',
    category: 'porcellanato',
    size: '60x60',
    image: '/images/porcellanato-oasis-grey.jpg',
    description: 'Calming oasis grey pattern',
    featured: true,
    stock: 90,
    price: 200000
  },
  
  // Porcellanato 80x80
  {
    id: 'p14',
    name: 'HTGPL MARBLE WHITE 80',
    category: 'porcellanato',
    size: '80x80',
    image: '/images/porcellanato-marble-white-80.jpg',
    description: 'Grand marble design in large format',
    stock: 65,
    price: 325000
  },
  {
    id: 'p15',
    name: 'HTGPL CARRARA 80',
    category: 'porcellanato',
    size: '80x80',
    image: '/images/porcellanato-carrara-80.jpg',
    description: 'Classic Carrara marble replica',
    stock: 50,
    price: 340000
  },
  
  // Porcellanato 60x120
  {
    id: 'p16',
    name: 'HTGPL STATUARIO 120',
    category: 'porcellanato',
    size: '60x120',
    image: '/images/porcellanato-statuario-120.jpg',
    description: 'Elegant Statuario in rectangular format',
    stock: 45,
    price: 385000
  },
  {
    id: 'p17',
    name: 'HTGPL CALACATTA 120',
    category: 'porcellanato',
    size: '60x120',
    image: '/images/porcellanato-calacatta-120.jpg',
    description: 'Premium Calacatta gold design',
    stock: 40,
    price: 410000
  },

  // Ceramic Tile 20x25
  {
    id: 'c1',
    name: 'DL 37616',
    category: 'ceramic',
    size: '20x25',
    image: '/images/ceramic-37616.jpg',
    description: 'Classic wall tile design',
    stock: 200,
    price: 45000
  },
  {
    id: 'c2',
    name: 'DL 43616',
    category: 'ceramic',
    size: '20x25',
    image: '/images/ceramic-43616.jpg',
    description: 'Versatile ceramic for bathrooms',
    stock: 180,
    price: 48000
  },
  
  // Ceramic Tile 25x40
  {
    id: 'c3',
    name: 'SZ 11159 D3',
    category: 'ceramic',
    size: '25x40',
    image: '/images/ceramic-11159.jpg',
    description: 'Decorative wall tile',
    featured: true,
    stock: 160,
    price: 65000
  },
  {
    id: 'c4',
    name: 'SZ 11160 D3',
    category: 'ceramic',
    size: '25x40',
    image: '/images/ceramic-11160.jpg',
    description: 'Elegant wall tile pattern',
    stock: 150,
    price: 68000
  },
  
  // Ceramic Tile 30x30
  {
    id: 'c5',
    name: 'GE 64043 P1',
    category: 'ceramic',
    size: '30x30',
    image: '/images/ceramic-64043.jpg',
    description: 'Durable floor tile',
    featured: true,
    stock: 220,
    price: 72000
  },
  {
    id: 'c6',
    name: 'GE 64044 P1',
    category: 'ceramic',
    size: '30x30',
    image: '/images/ceramic-64044.jpg',
    description: 'Classic floor tile design',
    stock: 190,
    price: 75000
  },
  
  // Ceramic Tile 30x60
  {
    id: 'c7',
    name: 'HT 30501',
    category: 'ceramic',
    size: '30x60',
    image: '/images/ceramic-30501.jpg',
    description: 'Modern rectangular tile',
    stock: 140,
    price: 95000
  },
  {
    id: 'c8',
    name: 'HT 30502',
    category: 'ceramic',
    size: '30x60',
    image: '/images/ceramic-30502.jpg',
    description: 'Sleek wall and floor tile',
    stock: 130,
    price: 98000
  },
  
  // Ceramic Tile 40x40
  {
    id: 'c9',
    name: 'DL 40401',
    category: 'ceramic',
    size: '40x40',
    image: '/images/ceramic-40401.jpg',
    description: 'Versatile medium format tile',
    stock: 170,
    price: 115000
  },
  {
    id: 'c10',
    name: 'DL 40402',
    category: 'ceramic',
    size: '40x40',
    image: '/images/ceramic-40402.jpg',
    description: 'Classic floor tile',
    stock: 160,
    price: 118000
  },
  
  // Ceramic Tile 50x50
  {
    id: 'c11',
    name: 'HT 50501',
    category: 'ceramic',
    size: '50x50',
    image: '/images/ceramic-50501.jpg',
    description: 'Large format ceramic tile',
    stock: 110,
    price: 145000
  },
  {
    id: 'c12',
    name: 'HT 50502',
    category: 'ceramic',
    size: '50x50',
    image: '/images/ceramic-50502.jpg',
    description: 'Premium floor tile',
    stock: 100,
    price: 148000
  }
];

// Get products from local storage or return default products
export const getProducts = (): Product[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return defaultProducts;
};

// Export products for backward compatibility
export const products = getProducts();

// Save products to local storage
export const saveProducts = (products: Product[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }
};

// Add new product
export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: `p${Date.now()}`,
  };
  const updatedProducts = [...products, newProduct];
  saveProducts(updatedProducts);
  return newProduct;
};

// Update product
export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  const updatedProduct = { ...products[index], ...updates };
  products[index] = updatedProduct;
  saveProducts(products);
  return updatedProduct;
};

// Delete product
export const deleteProduct = (id: string): boolean => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  saveProducts(filtered);
  return true;
};

// Reset to default products
export const resetProducts = () => {
  saveProducts(defaultProducts);
};

export const getFeaturedProducts = () => getProducts().filter(p => p.featured && p.stock > 0);
export const getProductsByCategory = (category: 'porcellanato' | 'ceramic') => 
  getProducts().filter(p => p.category === category);
export const getProductsBySize = (size: string) => 
  getProducts().filter(p => p.size === size);

export const porcellanatoSizes = ['60x60', '80x80', '60x120'];
export const ceramicSizes = ['20x25', '25x40', '30x30', '30x60', '40x40', '50x50'];

// Format price to Indonesian Rupiah
export const formatPrice = (price?: number): string => {
  if (!price) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};
