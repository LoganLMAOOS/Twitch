import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useChannelSettings } from '@/hooks/use-channel-settings';
import { Coins, Clock, TrendingUp } from 'lucide-react';

interface ChannelSettingsDialogProps {
  open: boolean;
  channel: {
    id: number;
    channelId: string;
    channelName: string;
    autoFarming: boolean;
    autoWatchtime: boolean;
    autoPredictions: boolean;
  };
  onOpenChange: (open: boolean) => void;
  onSettingsChanged: () => void;
}

const ChannelSettingsDialog: React.FC<ChannelSettingsDialogProps> = ({
  open,
  channel,
  onOpenChange,
  onSettingsChanged
}) => {
  const [settings, setSettings] = useState({
    autoFarming: channel.autoFarming,
    autoWatchtime: channel.autoWatchtime,
    autoPredictions: channel.autoPredictions,
    maxPointsPerPrediction: 2500,
    minPointBalance: 1000,
    farmingPriority: 50
  });
  
  const { updateChannelSetting, isSubmitting } = useChannelSettings({
    onSettingsChanged
  });

  const handleToggleSetting = async (setting: 'autoFarming' | 'autoWatchtime' | 'autoPredictions') => {
    const newValue = !settings[setting];
    setSettings({ ...settings, [setting]: newValue });
    await updateChannelSetting(channel, setting, newValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Channel Settings</DialogTitle>
          <DialogDescription>
            Configure settings for {channel.channelName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between p-3 bg-background bg-opacity-50 rounded-md">
            <div className="flex items-start gap-3">
              <Coins className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <Label htmlFor="auto-farming" className="font-medium">Points Auto-Farming</Label>
                <p className="text-sm text-muted-foreground">Automatically collect channel points</p>
              </div>
            </div>
            <div className="toggle-switch">
              <input 
                type="checkbox" 
                id="auto-farming"
                checked={settings.autoFarming}
                onChange={() => handleToggleSetting('autoFarming')}
                disabled={isSubmitting}
              />
              <span className="toggle-slider"></span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-background bg-opacity-50 rounded-md">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <Label htmlFor="auto-watchtime" className="font-medium">Watchtime Tracking</Label>
                <p className="text-sm text-muted-foreground">Keep streams open for watchtime and drops</p>
              </div>
            </div>
            <div className="toggle-switch">
              <input 
                type="checkbox" 
                id="auto-watchtime"
                checked={settings.autoWatchtime}
                onChange={() => handleToggleSetting('autoWatchtime')}
                disabled={isSubmitting}
              />
              <span className="toggle-slider"></span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-background bg-opacity-50 rounded-md">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <Label htmlFor="auto-predictions" className="font-medium">Auto-Predictions</Label>
                <p className="text-sm text-muted-foreground">Make intelligent predictions automatically</p>
              </div>
            </div>
            <div className="toggle-switch">
              <input 
                type="checkbox" 
                id="auto-predictions"
                checked={settings.autoPredictions}
                onChange={() => handleToggleSetting('autoPredictions')}
                disabled={isSubmitting}
              />
              <span className="toggle-slider"></span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <Label className="block text-sm font-medium mb-2">Max Points Per Prediction</Label>
              <Slider
                value={[settings.maxPointsPerPrediction]}
                min={100}
                max={10000}
                step={100}
                onValueChange={(value) => setSettings({...settings, maxPointsPerPrediction: value[0]})}
                className="my-4"
                disabled={!settings.autoPredictions}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>100</span>
                <span>{settings.maxPointsPerPrediction.toLocaleString()}</span>
                <span>10,000</span>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">Minimum Point Balance</Label>
              <Slider
                value={[settings.minPointBalance]}
                min={0}
                max={5000}
                step={100}
                onValueChange={(value) => setSettings({...settings, minPointBalance: value[0]})}
                className="my-4"
                disabled={!settings.autoFarming}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>{settings.minPointBalance.toLocaleString()}</span>
                <span>5,000</span>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">Farming Priority</Label>
              <Slider
                value={[settings.farmingPriority]}
                min={0}
                max={100}
                step={10}
                onValueChange={(value) => setSettings({...settings, farmingPriority: value[0]})}
                className="my-4"
                disabled={!settings.autoFarming}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low</span>
                <span>{settings.farmingPriority}%</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelSettingsDialog;
