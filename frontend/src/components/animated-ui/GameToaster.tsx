import { Toaster } from 'react-hot-toast';

export const GameToaster = () => (
  <Toaster
    position="bottom-right"
    reverseOrder={false}
    toastOptions={{
      style: {
        background: '#1B1B1E',
        color: '#fff',
        border: '1px solid #B366FF',
        borderRadius: '12px',
        padding: '12px 16px',
        fontWeight: 500,
        fontSize: '0.9rem',
        boxShadow: '0 0 12px rgba(179, 102, 255, 0.6)',
      },
      success: {
        style: {
          border: '1px solid #00FFB3',
          boxShadow: '0 0 12px rgba(0, 255, 179, 0.6)',
        },
        iconTheme: {
          primary: '#00FFB3',
          secondary: '#1B1B1E',
        },
      },
      error: {
        style: {
          border: '1px solid #FF4D6D',
          boxShadow: '0 0 12px rgba(255, 77, 109, 0.6)',
        },
        iconTheme: {
          primary: '#FF4D6D',
          secondary: '#1B1B1E',
        },
      },
    }}
  />
);
