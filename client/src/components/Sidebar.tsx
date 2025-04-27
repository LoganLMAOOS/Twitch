import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Coins, 
  TrendingUp, 
  Clock, 
  Settings,
  LogOut,
  Bot
} from 'lucide-react';

interface SidebarProps {
  user: {
    id: number;
    username: string;
    twitchUsername?: string;
  } | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const [location] = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { path: '/points-farming', label: 'Points Farming', icon: <Coins className="w-5 h-5 mr-3" /> },
    { path: '/predictions', label: 'Predictions', icon: <TrendingUp className="w-5 h-5 mr-3" /> },
    { path: '/watchtime', label: 'Watchtime', icon: <Clock className="w-5 h-5 mr-3" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5 mr-3" /> }
  ];

  const isActive = (path: string) => {
    return location === path || (path !== '/dashboard' && location.startsWith(path));
  };

  return (
    <aside className="bg-card border-r border-gray-800 h-full overflow-y-auto">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white flex items-center mb-8">
          <Bot className="h-6 w-6 text-primary mr-2" />
          TwitchFarm
        </h1>
        
        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-3 py-2 text-foreground rounded-md ${
                isActive(item.path)
                  ? 'bg-primary bg-opacity-20'
                  : 'hover:bg-primary hover:bg-opacity-10'
              }`}
            >
              <span className={isActive(item.path) ? 'text-primary' : 'text-muted-foreground'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        
        {/* User Profile */}
        {user && (
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center px-3 py-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">
                  {user.twitchUsername || user.username}
                </p>
                <button 
                  onClick={onLogout}
                  className="text-xs text-muted-foreground hover:text-white flex items-center mt-1"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
