
import { Product, ProductCategory, ProductFilter, ExpiryStatus } from '../types/product';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockProducts: Product[] = [
  {
    id: uuidv4(),
    name: 'Organic Milk 1L',
    barcode: '7290000000001',
    batchId: 'BM12345',
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    quantity: 24,
    category: 'food',
    location: 'Store A, Shelf 3',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Fresh Bread 500g',
    barcode: '7290000000002',
    batchId: 'BB54321',
    expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    quantity: 12,
    category: 'food',
    location: 'Store A, Shelf 2',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Aspirin 500mg',
    barcode: '7290000000003',
    batchId: 'M980765',
    expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (expired)
    quantity: 50,
    category: 'medicine',
    location: 'Pharmacy, Drawer 5',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Facial Cream 50ml',
    barcode: '7290000000004',
    batchId: 'C456789',
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    quantity: 15,
    category: 'cosmetics',
    location: 'Store B, Section 4',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Yogurt Pack 4x125g',
    barcode: '7290000000005',
    batchId: 'Y123456',
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    quantity: 30,
    category: 'food',
    location: 'Store A, Fridge 2',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// In-memory storage
let products: Product[] = [...mockProducts];

export const getExpiryStatus = (expiryDate: Date): ExpiryStatus => {
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return 'danger';  // Expired
  } else if (diffDays <= 2) {
    return 'warning'; // Expiring soon (1-2 days)
  } else {
    return 'safe';    // Not expiring soon
  }
};

// Service functions
export const getAllProducts = (): Product[] => {
  return products;
};

export const getProductsByFilter = (filter: ProductFilter): Product[] => {
  let filteredProducts = [...products];
  
  if (filter.status) {
    filteredProducts = filteredProducts.filter(product => 
      getExpiryStatus(product.expiryDate) === filter.status
    );
  }
  
  if (filter.category) {
    filteredProducts = filteredProducts.filter(product => 
      product.category === filter.category
    );
  }
  
  if (filter.location) {
    filteredProducts = filteredProducts.filter(product => 
      product.location.toLowerCase().includes(filter.location!.toLowerCase())
    );
  }
  
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchLower) || 
      product.barcode?.toLowerCase().includes(searchLower) ||
      product.batchId?.toLowerCase().includes(searchLower)
    );
  }
  
  return filteredProducts;
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
  const newProduct: Product = {
    ...product,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  products.push(newProduct);
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Product | undefined => {
  const index = products.findIndex(product => product.id === id);
  
  if (index === -1) {
    return undefined;
  }
  
  const updatedProduct: Product = {
    ...products[index],
    ...updates,
    updatedAt: new Date()
  };
  
  products[index] = updatedProduct;
  return updatedProduct;
};

export const deleteProduct = (id: string): boolean => {
  const initialLength = products.length;
  products = products.filter(product => product.id !== id);
  return products.length < initialLength;
};

// Mock barcode database (in real app, this would be an API call)
const barcodeDatabase: Record<string, Partial<Product>> = {
  '7290000000001': {
    name: 'Organic Milk 1L',
    category: 'food',
  },
  '7290000000002': {
    name: 'Fresh Bread 500g',
    category: 'food',
  },
  '7290000000003': {
    name: 'Aspirin 500mg',
    category: 'medicine',
  },
  '7290000000004': {
    name: 'Facial Cream 50ml',
    category: 'cosmetics',
  },
  '7290000000005': {
    name: 'Yogurt Pack 4x125g',
    category: 'food',
  }
};

export const getProductInfoFromBarcode = (barcode: string): Partial<Product> | null => {
  return barcodeDatabase[barcode] || null;
};

export const getStats = () => {
  const now = new Date();
  const totalProducts = products.length;
  const expiredProducts = products.filter(p => p.expiryDate < now).length;
  const nearExpiryProducts = products.filter(p => {
    const diffTime = p.expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 2;
  }).length;
  const safeProducts = totalProducts - expiredProducts - nearExpiryProducts;
  
  return {
    totalProducts,
    expiredProducts,
    nearExpiryProducts,
    safeProducts
  };
};
