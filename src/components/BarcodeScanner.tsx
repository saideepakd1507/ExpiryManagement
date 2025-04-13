
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, XCircle, RefreshCw, ScanLine } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
}

const BarcodeScanner = ({ onScanSuccess }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'barcode-scanner';
  const scanAttempts = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create scanner instance only once 
  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(error => {
          console.error('Error stopping scanner on unmount:', error);
        });
      }
      
      // Clean up the scanner instance
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setCameraError(null);
      
      // Ensure scanner container exists
      if (!containerRef.current) {
        toast.error("Scanner container not found");
        return;
      }
      
      // Initialize or clear the scanner
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      } else if (scannerRef.current.isScanning) {
        // If already scanning, stop it first
        await scannerRef.current.stop();
      }

      setIsScanning(true);
      scanAttempts.current = 0;

      const cameraId = await getCameraId();
      if (!cameraId) {
        toast.error("No camera found. Please check your camera permissions.");
        setIsScanning(false);
        setCameraError("No camera detected. Please ensure camera permissions are granted.");
        return;
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.DATA_MATRIX
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      await scannerRef.current.start(
        cameraId,
        config,
        (decodedText) => {
          // On successful scan
          onScanSuccess(decodedText);
          toast.success("Barcode scanned successfully!");
          stopScanner();
        },
        (errorMessage) => {
          // Increase attempt counter for logging purposes
          scanAttempts.current++;
          
          // Only log every 50 attempts to avoid console spam
          if (scanAttempts.current % 50 === 0) {
            console.log(`Still scanning... (${scanAttempts.current} attempts)`);
          }
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast.error("Failed to start camera. Please check your camera permissions.");
      setIsScanning(false);
      setCameraError("Error accessing camera. Please ensure camera permissions are granted and try again.");
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        console.log('Scanner stopped successfully');
        setIsScanning(false);
      }).catch(error => {
        console.error('Error stopping scanner:', error);
        setIsScanning(false);
      });
    } else {
      setIsScanning(false);
    }
  };

  const restartScanner = () => {
    stopScanner();
    // Add a small delay to ensure the scanner is fully stopped
    setTimeout(() => {
      startScanner();
    }, 500);
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
            <div className="flex space-x-2 w-full">
              <Button onClick={stopScanner} variant="destructive" className="flex-1">
                <XCircle className="mr-2 h-4 w-4" />
                Stop Camera
              </Button>
              <Button onClick={restartScanner} variant="outline" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Restart Scanner
              </Button>
            </div>
          )}
          
          <div 
            id={scannerContainerId} 
            ref={containerRef}
            className="w-full aspect-video rounded-lg relative overflow-hidden bg-gray-100"
          >
            {!isScanning && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ScanLine className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p>Camera will appear here</p>
                </div>
              </div>
            )}
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4 text-center">
                <p>{cameraError}</p>
              </div>
            )}
            {isScanning && (
              <div className="scanner-overlay rounded-lg"></div>
            )}
          </div>
          
          <div className="text-sm text-gray-500 space-y-2 w-full">
            <p className="text-center">
              Position the barcode within the scanner frame to capture it automatically.
            </p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">Tips for better scanning:</h4>
              <ul className="list-disc pl-5 text-blue-700 text-xs">
                <li>Ensure good lighting conditions</li>
                <li>Hold the camera steady</li>
                <li>Position barcode 4-8 inches from camera</li>
                <li>Try both horizontal and vertical orientations</li>
                <li>If scanning fails, use the restart button or enter manually</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;
