import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format relative time (e.g., "5 minutes ago")
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  return past.toLocaleDateString();
}

// Generate placeholder avatar URLs for testing
export function getPlaceholderAvatar(seed: string): string {
  // Use a consistent seed to get the same avatar for the same channel
  const hash = seed.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const avatarId = Math.abs(hash) % 1000;
  return `https://api.dicebear.com/7.x/avatars/svg?seed=${avatarId}`;
}

// Calculate win rate percentage
export function calculateWinRate(won: number, lost: number): number {
  const total = won + lost;
  if (total === 0) return 0;
  return Math.round((won / total) * 100);
}

// Generate a QR code URL using QR Server API
export function generateQRCode(url: string, size: number = 150): string {
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=${size}x${size}`;
}

// Format numbers with commas for thousands
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get a color for a status badge
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'farming active':
    case 'online':
      return 'bg-green-100 text-green-800';
    case 'waiting':
    case 'offline':
      return 'bg-gray-100 text-gray-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
}

// Get icon class for activity type
export function getActivityIcon(type: string): { icon: string; bgColor: string; textColor: string } {
  switch (type.toLowerCase()) {
    case 'points':
      return { icon: 'coins', bgColor: 'bg-yellow-500 bg-opacity-20', textColor: 'text-yellow-500' };
    case 'prediction':
      return { icon: 'robot', bgColor: 'bg-blue-500 bg-opacity-20', textColor: 'text-blue-500' };
    case 'prediction_won':
      return { icon: 'chart-line', bgColor: 'bg-green-500 bg-opacity-20', textColor: 'text-green-500' };
    case 'prediction_lost':
      return { icon: 'times', bgColor: 'bg-red-500 bg-opacity-20', textColor: 'text-red-500' };
    case 'watchtime':
      return { icon: 'clock', bgColor: 'bg-blue-400 bg-opacity-20', textColor: 'text-blue-400' };
    case 'channel':
      return { icon: 'tv', bgColor: 'bg-purple-400 bg-opacity-20', textColor: 'text-purple-400' };
    default:
      return { icon: 'info-circle', bgColor: 'bg-gray-500 bg-opacity-20', textColor: 'text-gray-500' };
  }
}

// Create random ID for keys
export function createId(): string {
  return Math.random().toString(36).substring(2, 15);
}
