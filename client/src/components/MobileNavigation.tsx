import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Coins, TrendingUp, Settings } from 'lucide-react';

const MobileNavigation: React.FC = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path || (path !== '/dashboard' && location.startsWith(path));
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="text-lg" /> },
    { path: '/points-farming', label: 'Points', icon: <Coins className="text-lg" /> },
    { path: '/predictions', label: 'Predictions', icon: <TrendingUp className="text-lg" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="text-lg" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-card border-t border-gray-800 flex justify-around">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`flex flex-col items-center py-2 ${
            isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileNavigation;
