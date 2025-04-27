import { apiRequest } from "./queryClient";

export interface TwitchChannel {
  id: string;
  displayName: string;
  username: string;
  profileImageUrl: string;
  isLive: boolean;
  viewers?: number;
}

export interface TwitchPrediction {
  id: string;
  title: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELED' | 'LOCKED';
  outcomes: {
    id: string;
    title: string;
    color: string;
    totalPoints: number;
    totalUsers: number;
  }[];
  createdAt: string;
  lockTime?: string;
}

export interface TwitchUser {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
  viewCount: number;
  createdAt: string;
}

export interface ChannelStats {
  totalPoints: number;
  pointsChange: number;
  totalWatchtime: number;
  watchtimeChange: number;
  winRate: number;
  winRateChange: number;
  activeChannels: number;
  totalChannels: number;
}

export async function initiateOAuth(): Promise<string> {
  try {
    const response = await apiRequest('GET', '/api/auth/twitch');
    const data = await response.json();
    return data.authUrl;
  } catch (error) {
    console.error('Error initiating OAuth:', error);
    throw new Error('Failed to initiate Twitch authentication');
  }
}

export async function getChannels(): Promise<TwitchChannel[]> {
  try {
    const response = await apiRequest('GET', '/api/channels');
    return await response.json();
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw new Error('Failed to fetch channel data');
  }
}

export async function getDashboardSummary(): Promise<ChannelStats> {
  try {
    const response = await apiRequest('GET', '/api/dashboard/summary');
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw new Error('Failed to fetch dashboard summary');
  }
}

export async function addChannel(channelId: string, channelName: string): Promise<any> {
  try {
    const response = await apiRequest('POST', '/api/channels', {
      channelId,
      channelName,
      autoFarming: true,
      autoWatchtime: true,
      autoPredictions: true
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding channel:', error);
    throw new Error('Failed to add channel');
  }
}

export async function removeChannel(id: number): Promise<void> {
  try {
    await apiRequest('DELETE', `/api/channels/${id}`);
  } catch (error) {
    console.error('Error removing channel:', error);
    throw new Error('Failed to remove channel');
  }
}

export async function toggleChannelSetting(
  channelId: string, 
  setting: 'autoFarming' | 'autoWatchtime' | 'autoPredictions', 
  value: boolean
): Promise<any> {
  try {
    const response = await apiRequest('POST', '/api/channels/toggle-setting', {
      channelId,
      setting,
      value
    });
    return await response.json();
  } catch (error) {
    console.error('Error toggling channel setting:', error);
    throw new Error('Failed to update channel setting');
  }
}

export async function getPredictions(limit?: number): Promise<any[]> {
  try {
    const url = limit ? `/api/predictions?limit=${limit}` : '/api/predictions';
    const response = await apiRequest('GET', url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching predictions:', error);
    throw new Error('Failed to fetch predictions');
  }
}

export async function getChannelPredictions(channelId: string, limit?: number): Promise<any[]> {
  try {
    const url = limit 
      ? `/api/predictions/channel/${channelId}?limit=${limit}` 
      : `/api/predictions/channel/${channelId}`;
    const response = await apiRequest('GET', url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching channel predictions:', error);
    throw new Error('Failed to fetch channel predictions');
  }
}

export async function getActivityFeed(limit?: number): Promise<any[]> {
  try {
    const url = limit ? `/api/activities?limit=${limit}` : '/api/activities';
    const response = await apiRequest('GET', url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    throw new Error('Failed to fetch activity feed');
  }
}

export async function getSettings(): Promise<any> {
  try {
    const response = await apiRequest('GET', '/api/settings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw new Error('Failed to fetch settings');
  }
}

export async function updateSettings(settings: any): Promise<any> {
  try {
    const response = await apiRequest('PUT', '/api/settings', settings);
    return await response.json();
  } catch (error) {
    console.error('Error updating settings:', error);
    throw new Error('Failed to update settings');
  }
}

// Format watchtime into human readable format (hours and minutes)
export function formatWatchtime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

// Format points with commas for thousands
export function formatPoints(points: number): string {
  return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format win rate percentage
export function formatWinRate(winRate: number): string {
  return `${Math.round(winRate)}%`;
}
