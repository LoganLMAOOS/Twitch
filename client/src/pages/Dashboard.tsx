import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ChannelSelector from '@/components/ChannelSelector';
import Stats from '@/components/Stats';
import AutomationControls from '@/components/AutomationControls';
import PredictionSettings from '@/components/PredictionSettings';
import ActiveChannels from '@/components/ActiveChannels';
import RecentActivity from '@/components/RecentActivity';
import { useToast } from '@/hooks/use-toast';
import { 
  getChannels, 
  getDashboardSummary, 
  getSettings,
  getActivityFeed,
  type ChannelStats
} from '@/lib/twitch';
import ChannelSettingsDialog from '@/components/ChannelSettingsDialog';

const Dashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [channelSettingsOpen, setChannelSettingsOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);

  // Fetch channels
  const { 
    data: channels = [], 
    isLoading: isLoadingChannels,
    refetch: refetchChannels
  } = useQuery({
    queryKey: ['/api/channels'],
    queryFn: getChannels,
  });

  // Fetch dashboard summary statistics
  const { 
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['/api/dashboard/summary'],
    queryFn: getDashboardSummary,
  });

  // Fetch user settings
  const { 
    data: settings,
    isLoading: isLoadingSettings
  } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: getSettings,
  });

  // Fetch recent activities
  const { 
    data: activities = [],
    isLoading: isLoadingActivities
  } = useQuery({
    queryKey: ['/api/activities'],
    queryFn: () => getActivityFeed(5), // Limit to 5 recent activities
  });

  // Default stats while loading
  const defaultStats: ChannelStats = {
    totalPoints: 0,
    pointsChange: 0,
    totalWatchtime: 0,
    watchtimeChange: 0,
    winRate: 0,
    winRateChange: 0,
    activeChannels: 0,
    totalChannels: 0
  };

  // Set the first channel as the current one when channels load
  useEffect(() => {
    if (channels.length > 0 && !currentChannelId) {
      setCurrentChannelId(channels[0].channelId);
    }
  }, [channels, currentChannelId]);

  // Find current channel object
  const currentChannel = channels.find(c => c.channelId === currentChannelId);

  const handleRefreshData = async () => {
    try {
      await Promise.all([
        refetchChannels(),
        refetchStats(),
        queryClient.invalidateQueries({ queryKey: ['/api/activities'] }),
      ]);
      toast({
        title: "Data refreshed",
        description: "Dashboard data has been updated.",
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({
        title: "Refresh failed",
        description: "Failed to update dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChannelChange = (channelId: string) => {
    setCurrentChannelId(channelId);
  };

  const handleChannelAdded = () => {
    refetchChannels();
    refetchStats();
  };

  const handleChannelRemoved = () => {
    refetchChannels();
    refetchStats();
    // If the current channel was removed, reset to null
    if (currentChannelId && !channels.some(c => c.channelId === currentChannelId)) {
      setCurrentChannelId(null);
    }
  };

  const handleOpenChannelSettings = (channel: any) => {
    setSelectedChannel(channel);
    setChannelSettingsOpen(true);
  };

  const handleCloseChannelSettings = () => {
    setChannelSettingsOpen(false);
    setSelectedChannel(null);
  };

  const handleSettingsChanged = () => {
    refetchChannels();
    queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
  };

  return (
    <div className="p-4 md:p-6">
      <ChannelSelector 
        channels={channels}
        currentChannel={currentChannelId}
        onChannelChange={handleChannelChange}
        onChannelAdded={handleChannelAdded}
      />
      
      <Stats 
        stats={stats || defaultStats}
        isLoading={isLoadingStats}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AutomationControls 
          channelId={currentChannelId}
          initialSettings={currentChannel}
          onSettingsChange={handleSettingsChanged}
        />
        
        <PredictionSettings 
          initialSettings={settings}
          onSettingsUpdated={handleSettingsChanged}
        />
      </div>
      
      <ActiveChannels 
        channels={channels}
        isLoading={isLoadingChannels}
        onRefresh={handleRefreshData}
        onChannelRemoved={handleChannelRemoved}
        onChannelSettings={handleOpenChannelSettings}
      />
      
      <RecentActivity 
        activities={activities}
        isLoading={isLoadingActivities}
      />

      {channelSettingsOpen && selectedChannel && (
        <ChannelSettingsDialog
          open={channelSettingsOpen}
          channel={selectedChannel}
          onOpenChange={handleCloseChannelSettings}
          onSettingsChanged={handleSettingsChanged}
        />
      )}
    </div>
  );
};

export default Dashboard;
