
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductForm from '@/components/ProductForm';
import { toast } from 'sonner';
import { addProduct } from '@/services/productService';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  barcode: z.string().optional(),
  batchId: z.string().optional(),
  expiryDate: z.date({
    required_error: 'Expiry date is required',
  }),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  category: z.enum(['food', 'medicine', 'cosmetics', 'other'] as const),
  location: z.string().min(1, 'Location is required'),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ScanPage = () => {
  const navigate = useNavigate();
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  
  const handleScanSuccess = (barcode: string) => {
    setScannedBarcode(barcode);
  };
  
  const handleFormSubmit = (data: ProductFormValues) => {
    try {
      addProduct(data);
      toast.success('Product added successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to add product');
      console.error(error);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scan Product</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">1. Scan Barcode</h2>
          <BarcodeScanner onScanSuccess={handleScanSuccess} />
          
          {scannedBarcode && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Barcode detected:</p>
              <p className="text-lg">{scannedBarcode}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">2. Complete Product Details</h2>
          <ProductForm
            barcode={scannedBarcode || undefined}
            onSubmit={handleFormSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
