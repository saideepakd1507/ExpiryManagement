
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductList from '@/components/ProductList';
import { Button } from '@/components/ui/button';
import { getAllProducts, deleteProduct } from '@/services/productService';
import { toast } from 'sonner';
import { PackagePlus } from 'lucide-react';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Products</h1>
        <Button onClick={() => navigate('/add')}>
          <PackagePlus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      <ProductList 
        key={refreshKey}
        products={products} 
        onDelete={handleDelete} 
      />
    </div>
  );
};

export default ProductsPage;
