
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductList from '@/components/ProductList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllProducts, deleteProduct } from '@/services/productService';
import { toast } from 'sonner';
import { PackagePlus, Search, QrCode } from 'lucide-react';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
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
