import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import { Menu, User } from 'lucide-react';
import useMobile from '@/hooks/use-mobile';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Close sidebar when changing location on mobile
    setSidebarOpen(false);
  }, [useLocation()[0]]);

  useEffect(() => {
    // Get user info
    const fetchUserInfo = async () => {
      try {
        const res = await apiRequest('GET', '/api/auth/status');
        const data = await res.json();
        if (data.isAuthenticated && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/');
      window.location.reload(); // Refresh to show login page
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Mobile Header */}
      <header className="md:hidden bg-card border-b border-gray-800 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-3 text-foreground focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-white flex items-center">
            <span className="text-primary mr-2">
              <i className="fas fa-robot"></i>
            </span>
            TwitchFarm
          </h1>
        </div>
        <div className="flex items-center">
          <div className="relative">
            <button className="flex items-center text-sm focus:outline-none">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                {user?.username?.charAt(0)?.toUpperCase() || <User size={16} />}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar - visible on desktop, conditionally visible on mobile */}
      <div 
        className={`${
          isMobile ? 'fixed inset-0 z-50 transition-opacity duration-300 ease-in-out' : 'hidden'
        } ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
        <div className={`absolute top-0 left-0 bottom-0 w-64 z-10 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <Sidebar user={user} onLogout={handleLogout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block md:w-64 min-h-screen">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default Layout;
