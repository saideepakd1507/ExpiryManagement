
export interface Product {
  id: string;
  name: string;
  barcode?: string;
  batchId?: string;
  expiryDate: Date;
  quantity: number;
  category: ProductCategory;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = 
  | 'food'
  | 'medicine'
  | 'cosmetics'
  | 'other';

export type ExpiryStatus = 
  | 'safe'     // Not expiring soon
  | 'warning'  // Expiring soon (1-2 days)
  | 'danger';  // Expired

export interface ProductFilter {
  status?: ExpiryStatus;
  category?: ProductCategory;
  location?: string;
  search?: string;
}
