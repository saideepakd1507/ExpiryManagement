
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStats } from '@/services/productService';
import { PackageCheck, AlertTriangle, AlertCircle, Package2 } from 'lucide-react';

const DashboardStats = () => {
  const stats = getStats();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package2 className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-gray-500">Items in inventory</p>
        </CardContent>
      </Card>
      
      <Card className="border-green-100">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Safe Products</CardTitle>
          <PackageCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.safeProducts}</div>
          <p className="text-xs text-gray-500">Not expiring soon</p>
        </CardContent>
      </Card>
      
      <Card className="border-yellow-100">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Near Expiry</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.nearExpiryProducts}</div>
          <p className="text-xs text-gray-500">Expiring in 1-2 days</p>
        </CardContent>
      </Card>
      
      <Card className="border-red-100">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Expired</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.expiredProducts}</div>
          <p className="text-xs text-gray-500">Need immediate attention</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
