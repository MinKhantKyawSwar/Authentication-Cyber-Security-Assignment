import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useFaceScanLoginMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setCredentials } from '@/features/auth/authSlice';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

interface FaceScanLoginProps {
  email: string;
  onCancel: () => void;
}

const FaceScanLogin: React.FC<FaceScanLoginProps> = ({ email, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [faceScanLogin, { isLoading }] = useFaceScanLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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

  // New: login using saved face template in localStorage
  const loginWithStoredTemplate = useCallback(async () => {
    const storedTemplate = localStorage.getItem('faceScanData');
    if (!storedTemplate) {
      toast.error('No saved face scan template on this device.');
      return;
    }
    try {
      const result = await faceScanLogin({ email, faceScanData: storedTemplate }).unwrap();
      dispatch(
        setCredentials({
          user: result.user,
          token: result.accessToken,
        })
      );
      localStorage.setItem(
        'auth',
        JSON.stringify({ user: result.user, token: result.accessToken })
      );
      toast.success('Face scan login successful!');
      navigate('/');
    } catch (error) {
      console.error('Face scan login failed:', error);
      const message = error?.data?.message || 'Face scan authentication failed';
      toast.error(`${message}. Please try again or use password.`);
    }
  }, [email, faceScanLogin, dispatch, navigate]);

  const captureAndLogin = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        const maxWidth = 320;
        const maxHeight = 240;
        const aspectRatio = video.videoWidth / video.videoHeight;
        
        let width = maxWidth;
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        context.drawImage(video, 0, 0, width, height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        stopCamera();
        
        try {
          const result = await faceScanLogin({ 
            email, 
            faceScanData: imageData 
          }).unwrap();
          
          dispatch(
            setCredentials({
              user: result.user,
              token: result.accessToken,
            })
          );
          
          localStorage.setItem(
            'auth',
            JSON.stringify({
              user: result.user,
              token: result.accessToken,
            })
          );
          
          toast.success('Face scan login successful!');
          navigate('/');
        } catch (error) {
          console.error('Face scan login failed:', error);
          const message = error?.data?.message || 'Face scan authentication failed';
          toast.error(`${message}. Please try again or use password.`);
        }
      }
    }
  }, [email, faceScanLogin, stopCamera, dispatch, navigate]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-center">Face Scan Login</h3>
      
      <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-48 object-cover ${!isCapturing ? 'hidden' : ''}`}
        />
        {!isCapturing && (
          <div className="flex flex-col items-center justify-center h-48 bg-gray-200">
            <Icon icon="mdi:face-recognition" className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">Click to start camera</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-col space-y-2">
        {/* Quick login using saved template (if available) */}
        {localStorage.getItem('faceScanData') && (
          <Button 
            onClick={loginWithStoredTemplate} 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            <Icon icon="mdi:face-recognition" className="mr-2 h-4 w-4" />
            Quick Login (Saved Face)
          </Button>
        )}

        {!isCapturing ? (
          <Button 
            onClick={startCamera} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Icon icon="mdi:camera" className="mr-2 h-4 w-4" />
            Start Face Scan
          </Button>
        ) : (
          <Button 
            onClick={captureAndLogin} 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icon icon="mdi:loading" className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Icon icon="mdi:login" className="mr-2 h-4 w-4" />
                Login with Face
              </>
            )}
          </Button>
        )}
        
        <Button 
          onClick={onCancel} 
          variant="outline" 
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default FaceScanLogin;