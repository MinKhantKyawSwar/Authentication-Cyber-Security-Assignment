import React, { useRef, useState, useCallback } from 'react';
import { useSetupFaceScanMutation } from '@/features/auth/authApi';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Icon } from '@iconify/react';

interface FaceScanSetupProps {
  onComplete: () => void;
  onSkip: () => void;
}

const FaceScanSetup: React.FC<FaceScanSetupProps> = ({ onComplete, onSkip }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [setupFaceScan, { isLoading }] = useSetupFaceScanMutation();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Could not access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set a smaller size for the canvas to reduce image size
        const maxWidth = 320; // Reduced from 640
        const maxHeight = 240; // Reduced from 480
        const aspectRatio = video.videoWidth / video.videoHeight;
        
        let width = maxWidth;
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw the video frame to the canvas with the reduced dimensions
        context.drawImage(video, 0, 0, width, height);
        
        // Use JPEG with reduced quality instead of PNG for smaller file size
        const imageData = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleSetup = async () => {
    if (!capturedImage) {
      toast.error('Please capture your face first');
      return;
    }

    try {
      await setupFaceScan({ faceScanData: capturedImage }).unwrap();
      // Persist the exact template locally to align with backend's simple comparison
      localStorage.setItem('faceScanData', capturedImage);
      toast.success('Face scan setup successful!');
      onComplete();
    } catch (error) {
      console.error('Face scan setup failed:', error);
      toast.error('Failed to setup face scan. Please try again.');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Face Scan Setup</h2>
      <p className="text-gray-600 mb-6 text-center">
        Set up face scan for quick login in the future
      </p>

      <div className="relative mb-6 bg-gray-100 rounded-lg overflow-hidden">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-64 object-cover ${!isCapturing ? 'hidden' : ''}`}
            />
            {!isCapturing && (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-200">
                <Icon icon="mdi:face-recognition" className="w-16 h-16 text-gray-400 mb-2" />
                <p className="text-gray-500">Camera not started</p>
              </div>
            )}
          </>
        ) : (
          <img src={capturedImage} alt="Captured face" className="w-full h-64 object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-col space-y-3">
        {!isCapturing && !capturedImage && (
          <Button 
            onClick={startCamera} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Icon icon="mdi:camera" className="mr-2 h-4 w-4" />
            Start Camera
          </Button>
        )}

        {isCapturing && !capturedImage && (
          <Button 
            onClick={captureImage} 
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Icon icon="mdi:camera-iris" className="mr-2 h-4 w-4" />
            Capture
          </Button>
        )}

        {capturedImage && (
          <>
            <Button 
              onClick={retakePhoto} 
              variant="outline" 
              className="w-full"
            >
              <Icon icon="mdi:camera-retake" className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <Button 
              onClick={handleSetup} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon icon="mdi:loading" className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Icon icon="mdi:check" className="mr-2 h-4 w-4" />
                  Use this photo
                </>
              )}
            </Button>
          </>
        )}

        <Button 
          onClick={onSkip} 
          variant="ghost" 
          className="w-full text-gray-500"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default FaceScanSetup;