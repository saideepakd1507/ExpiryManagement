
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, XCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
}

const BarcodeScanner = ({ onScanSuccess }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'barcode-scanner';

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(error => {
          console.error('Error stopping scanner:', error);
        });
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      // Initialize the scanner if it doesn't exist
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }

      setIsScanning(true);

      const cameraId = await getCameraId();
      if (!cameraId) {
        toast.error("No camera found. Please check your camera permissions.");
        setIsScanning(false);
        return;
      }

      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // On successful scan
          onScanSuccess(decodedText);
          toast.success("Barcode scanned successfully!");
          stopScanner();
        },
        (errorMessage) => {
          // Ignore errors during scanning - these are mostly non-detections
          console.log(errorMessage);
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast.error("Failed to start camera. Please check your camera permissions.");
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(error => {
        console.error('Error stopping scanner:', error);
      });
    }
    setIsScanning(false);
  };

  const getCameraId = async (): Promise<string | null> => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        return devices[0].id;
      }
      return null;
    } catch (error) {
      console.error('Error getting cameras:', error);
      return null;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-4">
          {!isScanning ? (
            <Button onClick={startScanner} className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopScanner} variant="destructive" className="w-full">
              <XCircle className="mr-2 h-4 w-4" />
              Stop Camera
            </Button>
          )}
          
          <div 
            id={scannerContainerId} 
            className="w-full aspect-video rounded-lg relative overflow-hidden bg-gray-100"
          >
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <p>Camera will appear here</p>
              </div>
            )}
            {isScanning && (
              <div className="scanner-overlay rounded-lg"></div>
            )}
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            Position the barcode within the scanner frame to capture it automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;
