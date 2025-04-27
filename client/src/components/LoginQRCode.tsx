import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { generateQRCode } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

interface LoginQRCodeProps {
  authUrl: string | null;
}

const LoginQRCode: React.FC<LoginQRCodeProps> = ({ authUrl }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);

  useEffect(() => {
    // If we have an auth URL, use it for the QR code
    if (authUrl) {
      setLoginUrl(authUrl);
      setQrCodeUrl(generateQRCode(authUrl, 200));
      return;
    }

    // Otherwise, generate a simple login URL for the QR code
    const generateSimpleLoginUrl = async () => {
      try {
        // In a real app, this would generate a temporary token that can be scanned
        // For demo purposes, we'll either use the auth URL or the current URL
        const baseUrl = window.location.origin;
        const mobileLoginUrl = `${baseUrl}/mobile-login?token=demo-token`;
        
        setLoginUrl(mobileLoginUrl);
        setQrCodeUrl(generateQRCode(mobileLoginUrl, 200));
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    };

    generateSimpleLoginUrl();
  }, [authUrl]);

  if (!qrCodeUrl) {
    return null;
  }

  return (
    <Card className="bg-card shadow-md">
      <CardContent className="pt-6 pb-6 text-center">
        <h3 className="text-lg font-medium mb-4">Mobile Login</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Scan this QR code with your phone camera to login instantly on mobile.
        </p>
        
        <div className="bg-white p-3 rounded-md w-48 h-48 mx-auto mb-4 flex items-center justify-center">
          <img src={qrCodeUrl} alt="Login QR Code" className="w-full h-full" />
        </div>
        
        <p className="text-sm text-muted-foreground">
          No need to enter passwords or tokens on mobile.
        </p>
      </CardContent>
    </Card>
  );
};

export default LoginQRCode;
