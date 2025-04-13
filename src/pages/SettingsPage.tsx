
import { useState } from 'react';
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
import { toast } from 'sonner';

const SettingsPage = () => {
  const [expiryThreshold, setExpiryThreshold] = useState('2');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);

  const handleSaveSettings = () => {
    // In a real app, these would be saved to a backend
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

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

            <div className="pt-4">
              <Button onClick={handleSaveSettings}>Save Settings</Button>
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
