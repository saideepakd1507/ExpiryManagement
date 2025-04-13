
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductList from '@/components/ProductList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllProducts, deleteProduct, getStats } from '@/services/productService';
import { toast } from 'sonner';
import { PackagePlus, Search, QrCode, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Extract search parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const query = params.get('query');
    
    if (query) {
      setSearchTerm(query);
    }
    
    // Check for notifications based on settings
    const notificationSettings = localStorage.getItem('notificationSettings');
    if (notificationSettings) {
      const settings = JSON.parse(notificationSettings);
      const stats = getStats();
      
      if (settings.appNotifications && (stats.expiredProducts > 0 || stats.nearExpiryProducts > 0)) {
        toast.warning(
          `You have ${stats.expiredProducts} expired and ${stats.nearExpiryProducts} nearly expired products`,
          {
            duration: 5000,
            action: {
              label: "View Settings",
              onClick: () => navigate('/settings'),
            },
          }
        );
      }
    }
  }, [location, navigate]);
  
  const products = getAllProducts();
  
  const handleDelete = (id: string) => {
    const success = deleteProduct(id);
    if (success) {
      toast.success('Product deleted successfully');
      setRefreshKey(prevKey => prevKey + 1);
    } else {
      toast.error('Failed to delete product');
    }
  };

  const stats = getStats();
  const hasExpiringProducts = stats.expiredProducts > 0 || stats.nearExpiryProducts > 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <h1 className="text-2xl font-bold">All Products</h1>
        <div className="flex-1 md:flex md:justify-end gap-2">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <Button onClick={() => navigate('/scan')} variant="outline">
                <QrCode className="mr-2 h-4 w-4" />
                Scan to Find
              </Button>
              <Button onClick={() => navigate('/add')}>
                <PackagePlus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {hasExpiringProducts && (
        <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Attention Required!</AlertTitle>
          <AlertDescription>
            You have {stats.expiredProducts} expired and {stats.nearExpiryProducts} nearly expiring products.
            <Button 
              variant="link" 
              className="p-0 h-auto text-yellow-800 underline" 
              onClick={() => navigate('/settings')}
            >
              Configure notifications
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <ProductList 
        key={refreshKey}
        products={products} 
        onDelete={handleDelete} 
        initialSearchTerm={searchTerm}
      />
    </div>
  );
};

export default ProductsPage;
