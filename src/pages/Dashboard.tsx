
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardStats from '@/components/DashboardStats';
import ProductList from '@/components/ProductList';
import { Button } from '@/components/ui/button';
import { getProductsByFilter, deleteProduct } from '@/services/productService';
import { ProductFilter } from '@/types/product';
import { ArrowRight, Package, QrCode } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ProductFilter>({
    status: 'warning', // Default to showing near-expiry products
  });
  
  const nearExpiryProducts = getProductsByFilter(filter);
  
  const handleDelete = (id: string) => {
    const success = deleteProduct(id);
    if (success) {
      toast.success('Product deleted successfully');
    } else {
      toast.error('Failed to delete product');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/scan')}>
            <QrCode className="mr-2 h-4 w-4" />
            Scan Product
          </Button>
          <Button onClick={() => navigate('/add')}>
            <Package className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
      
      <DashboardStats />
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Products Expiring Soon</h2>
          <Button variant="outline" onClick={() => navigate('/products')}>
            View All Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <ProductList products={nearExpiryProducts} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default Dashboard;
