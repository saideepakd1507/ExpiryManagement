
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductForm from '@/components/ProductForm';
import { toast } from 'sonner';
import { addProduct, getProductInfoFromBarcode, getProductByBarcode } from '@/services/productService';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [manualBarcodeInput, setManualBarcodeInput] = useState<string>('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [existingProduct, setExistingProduct] = useState<boolean>(false);
  const [key, setKey] = useState(0); // Add a key to force remount of scanner
  
  // Reset scanner when navigating back to this page
  useEffect(() => {
    // Reset state when component mounts
    setScannedBarcode(null);
    setManualBarcodeInput('');
    setIsManualEntry(false);
    setExistingProduct(false);
    
    // Force remount of scanner component
    setKey(prev => prev + 1);
  }, []);
  
  const handleScanSuccess = (barcode: string) => {
    setScannedBarcode(barcode);
    
    // Check if this is an existing product
    const existingProd = getProductByBarcode(barcode);
    if (existingProd) {
      setExistingProduct(true);
      toast.info(`Found existing product: ${existingProd.name}`);
      return;
    }
    
    // Try to get product info from barcode database
    const productInfo = getProductInfoFromBarcode(barcode);
    if (productInfo) {
      toast.success(`Found product info: ${productInfo.name}`);
    }
  };
  
  const handleManualBarcodeSubmit = () => {
    if (manualBarcodeInput.trim()) {
      setScannedBarcode(manualBarcodeInput);
      
      // Check if this is an existing product
      const existingProd = getProductByBarcode(manualBarcodeInput);
      if (existingProd) {
        setExistingProduct(true);
        toast.info(`Found existing product: ${existingProd.name}`);
        return;
      }
      
      // Try to get product info from barcode database
      const productInfo = getProductInfoFromBarcode(manualBarcodeInput);
      if (productInfo) {
        toast.success(`Found product info: ${productInfo.name}`);
      }
    } else {
      toast.error('Please enter a barcode');
    }
  };
  
  const handleFormSubmit = (data: ProductFormValues) => {
    try {
      // Ensure all required properties are present before passing to addProduct
      const productData = {
        name: data.name,
        barcode: data.barcode,
        batchId: data.batchId,
        expiryDate: data.expiryDate,
        quantity: data.quantity,
        category: data.category,
        location: data.location
      };
      
      addProduct(productData);
      toast.success('Product added successfully');
      navigate('/products');
    } catch (error) {
      toast.error('Failed to add product');
      console.error(error);
    }
  };
  
  const navigateToExistingProduct = () => {
    if (scannedBarcode) {
      const product = getProductByBarcode(scannedBarcode);
      if (product) {
        navigate(`/edit/${product.id}`);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scan Product</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">1. Scan or Enter Barcode</h2>
          
          {!isManualEntry ? (
            <>
              <BarcodeScanner 
                key={key} // Force remount when key changes
                onScanSuccess={handleScanSuccess} 
              />
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Having trouble scanning?
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsManualEntry(true)}
                  className="text-sm"
                >
                  Enter Barcode Manually
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label htmlFor="manual-barcode" className="block text-sm font-medium mb-1">
                    Barcode
                  </label>
                  <Input
                    id="manual-barcode"
                    value={manualBarcodeInput}
                    onChange={(e) => setManualBarcodeInput(e.target.value)}
                    placeholder="Enter barcode number"
                  />
                </div>
                <Button onClick={handleManualBarcodeSubmit}>
                  Submit
                </Button>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsManualEntry(false);
                  setManualBarcodeInput('');
                  // Force scanner remount when switching back
                  setKey(prev => prev + 1);
                }}
                className="text-sm"
              >
                Go Back to Scanner
              </Button>
            </div>
          )}
          
          {existingProduct && scannedBarcode && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle>Product already exists</AlertTitle>
              <AlertDescription className="flex justify-between items-center">
                <span>This product is already in your inventory.</span>
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={navigateToExistingProduct}
                >
                  View/Edit Product
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {scannedBarcode && !existingProduct && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Barcode detected:</p>
              <p className="text-lg">{scannedBarcode}</p>
            </div>
          )}
        </div>
        
        {!existingProduct && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">2. Complete Product Details</h2>
            <ProductForm
              barcode={scannedBarcode || undefined}
              onSubmit={handleFormSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanPage;
