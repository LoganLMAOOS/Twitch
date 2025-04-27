import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoginQRCode from '@/components/LoginQRCode';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { initiateOAuth } from '@/lib/twitch';
import { Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useMobile from '@/hooks/use-mobile';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const isMobile = useMobile();

  const handleTwitchLogin = async () => {
    setIsLoading(true);
    try {
      const url = await initiateOAuth();
      setAuthUrl(url);
      window.location.href = url;
    } catch (error) {
      console.error('Failed to initiate Twitch OAuth:', error);
      toast({
        title: "Authentication failed",
        description: "Could not connect to Twitch. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      
      if (response.ok) {
        toast({
          title: "Login successful",
          description: "Welcome to TwitchFarm Dashboard!",
        });
        onLogin();
        navigate('/dashboard');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/register', { username, password });
      
      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. Welcome to TwitchFarm!",
        });
        onLogin();
        navigate('/dashboard');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Bot className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">TwitchFarm</h1>
        <p className="text-muted-foreground mt-2">Automate your Twitch points farming and predictions</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <Card className="bg-card shadow-md">
          <CardContent className="pt-6 pb-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-center">Login or Register</h2>
                <p className="text-sm text-muted-foreground text-center">
                  Create an account or login to start farming Twitch points
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleUsernameLogin}>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="Enter your username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    Login
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleRegister}
                    disabled={isLoading}
                  >
                    Register
                  </Button>
                </div>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-700"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                variant="default"
                className="w-full bg-[#9147FF] hover:bg-[#772CE8] flex items-center justify-center"
                onClick={handleTwitchLogin}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43Z"/>
                </svg>
                Connect with Twitch
              </Button>
            </div>
          </CardContent>
        </Card>

        {!isMobile && (
          <LoginQRCode authUrl={authUrl} />
        )}

        <p className="text-xs text-center text-muted-foreground">
          By connecting, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
