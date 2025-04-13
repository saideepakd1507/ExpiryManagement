
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { getStats } from '@/services/productService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [expiryThreshold, setExpiryThreshold] = useState('2');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);
  const [emailAddress, setEmailAddress] = useState('');
  const [hasExpiringProducts, setHasExpiringProducts] = useState(false);

  useEffect(() => {
    // Check for expiring products on load
    const stats = getStats();
    setHasExpiringProducts(stats.expiredProducts > 0 || stats.nearExpiryProducts > 0);
    
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setExpiryThreshold(settings.expiryThreshold || '2');
      setEmailNotifications(settings.emailNotifications !== false);
      setAppNotifications(settings.appNotifications !== false);
      setEmailAddress(settings.emailAddress || '');
    }
    
    // Set up app notifications if enabled
    if (appNotifications && hasExpiringProducts) {
      showNotificationToast();
    }
  }, []);

  const showNotificationToast = () => {
    const stats = getStats();
    if (stats.expiredProducts > 0 || stats.nearExpiryProducts > 0) {
      toast.warning(
        `You have ${stats.expiredProducts} expired and ${stats.nearExpiryProducts} nearly expired products`,
        {
          duration: 5000,
          action: {
            label: "View Products",
            onClick: () => navigate('/products?status=warning'),
          },
        }
      );
    }
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      expiryThreshold,
      emailNotifications,
      appNotifications,
      emailAddress,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    
    // In a real app, these would be saved to a backend
    toast.success('Settings saved successfully');
    
    // Check if we should show notifications right away
    if (appNotifications && hasExpiringProducts) {
      showNotificationToast();
    }
  };

  const handleTestNotification = () => {
    if (appNotifications) {
      toast.warning('This is a test expiry notification', {
        duration: 5000,
        action: {
          label: "View Products",
          onClick: () => navigate('/products'),
        },
      });
    }
    
    if (emailNotifications && emailAddress) {
      toast.success(`Test email notification would be sent to ${emailAddress}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {hasExpiringProducts && (
        <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Attention Needed!</AlertTitle>
          <AlertDescription>
            You have products that are expired or expiring soon. Check your inventory.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure how you want to be notified about expiring products
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Expiry Alert Threshold</h3>
              <RadioGroup
                value={expiryThreshold}
                onValueChange={setExpiryThreshold}
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="1" id="threshold-1" />
                  <Label htmlFor="threshold-1" className="font-normal">
                    1 day before expiry
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="2" id="threshold-2" />
                  <Label htmlFor="threshold-2" className="font-normal">
                    2 days before expiry
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="7" id="threshold-7" />
                  <Label htmlFor="threshold-7" className="font-normal">
                    7 days before expiry
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Methods</h3>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive daily email digest for expiring products
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              {emailNotifications && (
                <div className="space-y-2">
                  <Label htmlFor="email-address">Email Address</Label>
                  <Input 
                    id="email-address" 
                    type="email" 
                    placeholder="your@email.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="app-notifications">In-App Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Show alerts in the dashboard when products are expiring
                  </p>
                </div>
                <Switch
                  id="app-notifications"
                  checked={appNotifications}
                  onCheckedChange={setAppNotifications}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <Button onClick={handleSaveSettings}>Save Settings</Button>
              <Button variant="outline" onClick={handleTestNotification}>Test Notification</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Application version and update information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Updated</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
