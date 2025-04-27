import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toggleChannelSetting } from '@/lib/twitch';
import { useToast } from '@/hooks/use-toast';

interface AutomationControl {
  id: string;
  title: string;
  description: string;
  setting: 'autoFarming' | 'autoWatchtime' | 'autoPredictions' | 'notificationsEnabled';
  enabled: boolean;
}

interface AutomationControlsProps {
  channelId: string | null;
  initialSettings?: {
    autoFarming: boolean;
    autoWatchtime: boolean;
    autoPredictions: boolean;
    notificationsEnabled?: boolean;
  };
  onSettingsChange?: (setting: string, value: boolean) => void;
}

const AutomationControls: React.FC<AutomationControlsProps> = ({ 
  channelId, 
  initialSettings,
  onSettingsChange
}) => {
  const { toast } = useToast();
  const [controls, setControls] = useState<AutomationControl[]>([
    {
      id: 'points',
      title: 'Points Auto-Farming',
      description: 'Automatically collect channel points',
      setting: 'autoFarming',
      enabled: initialSettings?.autoFarming ?? true,
    },
    {
      id: 'watchtime',
      title: 'Watchtime Tracking',
      description: 'Keep streams open for watchtime and drops',
      setting: 'autoWatchtime',
      enabled: initialSettings?.autoWatchtime ?? true,
    },
    {
      id: 'predictions',
      title: 'Auto-Predictions',
      description: 'Make intelligent predictions automatically',
      setting: 'autoPredictions',
      enabled: initialSettings?.autoPredictions ?? true,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Get notified of prediction results',
      setting: 'notificationsEnabled',
      enabled: initialSettings?.notificationsEnabled ?? false,
    },
  ]);

  useEffect(() => {
    // Update controls if initialSettings change
    if (initialSettings) {
      setControls(prevControls => 
        prevControls.map(control => ({
          ...control,
          enabled: initialSettings[control.setting] ?? control.enabled
        }))
      );
    }
  }, [initialSettings]);

  const handleToggle = async (index: number) => {
    if (!channelId && controls[index].setting !== 'notificationsEnabled') {
      toast({
        title: "No channel selected",
        description: "Please select a channel first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newControls = [...controls];
      newControls[index].enabled = !newControls[index].enabled;
      setControls(newControls);

      if (controls[index].setting !== 'notificationsEnabled') {
        // Update channel setting on server
        await toggleChannelSetting(
          channelId!,
          controls[index].setting as 'autoFarming' | 'autoWatchtime' | 'autoPredictions',
          newControls[index].enabled
        );
      }

      // Notify parent component
      if (onSettingsChange) {
        onSettingsChange(controls[index].setting, newControls[index].enabled);
      }

      toast({
        title: `${newControls[index].enabled ? 'Enabled' : 'Disabled'} ${newControls[index].title}`,
        description: `Successfully ${newControls[index].enabled ? 'enabled' : 'disabled'} ${newControls[index].title.toLowerCase()}.`,
      });
    } catch (error) {
      console.error(`Failed to toggle ${controls[index].title}:`, error);
      
      // Revert the toggle
      const revertedControls = [...controls];
      revertedControls[index].enabled = !revertedControls[index].enabled;
      setControls(revertedControls);
      
      toast({
        title: `Failed to ${controls[index].enabled ? 'disable' : 'enable'} ${controls[index].title}`,
        description: "There was an error updating the setting. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="lg:col-span-2 bg-card shadow-sm overflow-hidden">
      <CardHeader className="px-6 border-b border-gray-800">
        <CardTitle>Automation Controls</CardTitle>
        <CardDescription>Configure your automation settings</CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 py-4">
        <div className="space-y-4">
          {controls.map((control, index) => (
            <div key={control.id} className="flex justify-between items-center p-3 bg-background bg-opacity-50 rounded-md">
              <div>
                <h4 className="font-medium">{control.title}</h4>
                <p className="text-sm text-muted-foreground">{control.description}</p>
              </div>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={control.enabled}
                  onChange={() => handleToggle(index)}
                  id={`toggle-${control.id}`}
                />
                <span className="toggle-slider"></span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationControls;
