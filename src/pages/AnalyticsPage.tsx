
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStats } from "@/services/productService";
import { BarChart3, LineChart, PieChart } from "lucide-react";

const AnalyticsPage = () => {
  const stats = getStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Expiry Status</CardTitle>
            <PieChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Safe</span>
                </div>
                <span className="font-medium">{stats.safeProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Expiring Soon</span>
                </div>
                <span className="font-medium">{stats.nearExpiryProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>Expired</span>
                </div>
                <span className="font-medium">{stats.expiredProducts}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
            <LineChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center text-gray-400">
              Monthly trend chart will be displayed here
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Category Distribution</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center text-gray-400">
              Category distribution chart will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Product Expiry Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              The analytics dashboard provides insights into your inventory expiry status.
              Currently, you have {stats.totalProducts} products in your inventory.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 text-center">
              <div className="flex-1 p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.safeProducts}</div>
                <p className="text-sm text-green-600">Safe Products</p>
              </div>
              
              <div className="flex-1 p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.nearExpiryProducts}</div>
                <p className="text-sm text-yellow-600">Expiring Soon</p>
              </div>
              
              <div className="flex-1 p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.expiredProducts}</div>
                <p className="text-sm text-red-600">Expired Products</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
