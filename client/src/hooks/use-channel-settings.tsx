import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { toggleChannelSetting } from '@/lib/twitch';

interface ChannelSettings {
  id: number;
  channelId: string;
  autoFarming: boolean;
  autoWatchtime: boolean;
  autoPredictions: boolean;
}

interface UseChannelSettingsProps {
  onSettingsChanged: () => void;
}

export function useChannelSettings({ onSettingsChanged }: UseChannelSettingsProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateChannelSetting = async (
    channel: ChannelSettings,
    setting: 'autoFarming' | 'autoWatchtime' | 'autoPredictions',
    value: boolean
  ) => {
    setIsSubmitting(true);
    
    try {
      await toggleChannelSetting(channel.channelId, setting, value);
      
      toast({
        title: `${value ? 'Enabled' : 'Disabled'} ${getFriendlySettingName(setting)}`,
        description: `Successfully ${value ? 'enabled' : 'disabled'} ${getFriendlySettingName(setting).toLowerCase()} for ${channel.channelId}.`,
      });
      
      onSettingsChanged();
    } catch (error) {
      console.error(`Failed to update channel setting:`, error);
      
      toast({
        title: `Failed to update setting`,
        description: "There was an error updating the channel setting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    updateChannelSetting,
    isSubmitting
  };
}

// Helper function to get a friendly name for the setting
function getFriendlySettingName(setting: string): string {
  switch (setting) {
    case 'autoFarming':
      return 'Points Auto-Farming';
    case 'autoWatchtime':
      return 'Watchtime Tracking';
    case 'autoPredictions':
      return 'Auto-Predictions';
    default:
      return setting;
  }
}

export default useChannelSettings;
