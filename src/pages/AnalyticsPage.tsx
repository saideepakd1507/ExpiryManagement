
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart } from '@/components/ui/chart';
import { getAllProducts, getExpiryStatus } from '@/services/productService';
import { format, subDays } from 'date-fns';

const AnalyticsPage = () => {
  const products = getAllProducts();
  
  // Count products by category
  const categoryCounts = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Format for pie chart
  const categoryData = Object.keys(categoryCounts).map(category => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: categoryCounts[category]
  }));
  
  // Count products by expiry status
  const statusCounts = products.reduce((acc, product) => {
    const status = getExpiryStatus(product.expiryDate);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Format for bar chart
  const statusData = [
    { name: 'Safe', value: statusCounts.safe || 0 },
    { name: 'Expiring Soon', value: statusCounts.warning || 0 },
    { name: 'Expired', value: statusCounts.danger || 0 }
  ];
  
  // Generate mock historical data for the past 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, i);
    return format(date, 'MMM dd');
  }).reverse();
  
  const trendData = last7Days.map(day => ({
    name: day,
    'Expired Products': Math.floor(Math.random() * 5),
    'Near Expiry': Math.floor(Math.random() * 8),
  }));
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Products by Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <PieChart 
              data={categoryData}
              className="h-80 w-full"
              colors={['#3b82f6', '#10b981', '#f59e0b', '#6366f1']}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Products by Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarChart 
              data={statusData}
              className="h-80 w-full"
              colors={['#10b981', '#f59e0b', '#ef4444']}
              dataKey="value"
              xAxisDataKey="name"
              showLegend={false}
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Expiration Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <LineChart 
              data={trendData}
              className="h-80 w-full"
              lines={[
                { dataKey: 'Expired Products', color: '#ef4444' },
                { dataKey: 'Near Expiry', color: '#f59e0b' },
              ]}
              xAxisDataKey="name"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
