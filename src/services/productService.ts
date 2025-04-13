
import { Product, ProductCategory, ProductFilter, ExpiryStatus } from '../types/product';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage
let products: Product[] = [];

export const getExpiryStatus = (expiryDate: Date): ExpiryStatus => {
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Get user's threshold setting
  let threshold = 2; // Default
  const savedSettings = localStorage.getItem('notificationSettings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    threshold = parseInt(settings.expiryThreshold || '2', 10);
  }
  
  if (diffDays <= 0) {
    return 'danger';  // Expired
  } else if (diffDays <= threshold) {
    return 'warning'; // Expiring soon (within threshold days)
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

export const getProductByBarcode = (barcode: string): Product | undefined => {
  return products.find(product => product.barcode === barcode);
};

export const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
  const newProduct: Product = {
    ...product,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  products.push(newProduct);
  
  // Check if notifications should be shown
  checkAndNotifyForExpiringProducts();
  
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
  
  // Check if notifications should be shown
  checkAndNotifyForExpiringProducts();
  
  return updatedProduct;
};

export const deleteProduct = (id: string): boolean => {
  const initialLength = products.length;
  products = products.filter(product => product.id !== id);
  return products.length < initialLength;
};

// Empty barcode database
const barcodeDatabase: Record<string, Partial<Product>> = {};

export const getProductInfoFromBarcode = (barcode: string): Partial<Product> | null => {
  return barcodeDatabase[barcode] || null;
};

export const getStats = () => {
  const now = new Date();
  const totalProducts = products.length;
  
  // Get user's threshold setting
  let threshold = 2; // Default
  const savedSettings = localStorage.getItem('notificationSettings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    threshold = parseInt(settings.expiryThreshold || '2', 10);
  }
  
  const expiredProducts = products.filter(p => p.expiryDate < now).length;
  const nearExpiryProducts = products.filter(p => {
    const diffTime = p.expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= threshold;
  }).length;
  const safeProducts = totalProducts - expiredProducts - nearExpiryProducts;
  
  return {
    totalProducts,
    expiredProducts,
    nearExpiryProducts,
    safeProducts
  };
};

export const checkAndNotifyForExpiringProducts = () => {
  const stats = getStats();
  const savedSettings = localStorage.getItem('notificationSettings');
  
  if (!savedSettings) return;
  
  const settings = JSON.parse(savedSettings);
  
  if (settings.appNotifications && (stats.expiredProducts > 0 || stats.nearExpiryProducts > 0)) {
    const message = `You have ${stats.expiredProducts} expired and ${stats.nearExpiryProducts} nearly expired products`;
    // We're not directly showing the toast here because this function
    // might be called from the service layer where we don't have direct
    // access to the UI. Components will handle showing the toast.
    
    // Store the notification so components can show it
    localStorage.setItem('pendingNotification', message);
  }
};
