import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { backgroundTwo } from '@/assests';
import FaceScanSetup from '@/components/FaceScanSetup';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const FaceScanSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  // Get user data from location state if available (from registration)
  const userFromRegistration = location.state?.user;
  const tokenFromRegistration = location.state?.token;
  
  // Use either Redux state or location state
  const authUser = user || userFromRegistration;
  const authToken = token || tokenFromRegistration;
  
  useEffect(() => {
    // If no authentication data is available, redirect to login
    if (!authUser || !authToken) {
      toast.error('Authentication required for face scan setup');
      navigate('/login');
    }
  }, [authUser, authToken, navigate]);

  const handleComplete = () => {
    toast.success('Face scan setup completed successfully!');
    navigate('/login');
  };

  const handleSkip = () => {
    toast.success('You can set up face scan later in your profile settings');
    navigate('/login');
  };

  return (
    <section
      className="min-h-screen w-full font-inter flex flex-col md:flex-row items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundTwo})` }}
    >
      <div className="w-full max-w-lg p-6 md:p-8 bg-white/85 rounded-md shadow-md backdrop-blur-sm">
        {authUser && authToken ? (
          <FaceScanSetup onComplete={handleComplete} onSkip={handleSkip} />
        ) : (
          <div className="text-center p-8">
            <p className="text-lg">Authentication required for face scan setup</p>
          </div>
        )}
      </div>
      <Toaster />
    </section>
  );
};

export default FaceScanSetupPage;