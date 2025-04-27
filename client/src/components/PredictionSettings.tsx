import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { updateSettings } from '@/lib/twitch';
import { useToast } from '@/hooks/use-toast';
import config from '@/lib/config';

interface PredictionSettingsProps {
  initialSettings?: {
    riskLevel: string;
    maxPointsPerPrediction: number;
    useChatSentiment: boolean;
    useHistoricalOutcomes: boolean;
    useStreamerPerformance: boolean;
    useGlobalPatterns: boolean;
  };
  onSettingsUpdated?: () => void;
}

const PredictionSettings: React.FC<PredictionSettingsProps> = ({
  initialSettings,
  onSettingsUpdated
}) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    riskLevel: initialSettings?.riskLevel || 'balanced',
    maxPointsPerPrediction: initialSettings?.maxPointsPerPrediction || 2500,
    useChatSentiment: initialSettings?.useChatSentiment !== undefined ? initialSettings.useChatSentiment : true,
    useHistoricalOutcomes: initialSettings?.useHistoricalOutcomes !== undefined ? initialSettings.useHistoricalOutcomes : true,
    useStreamerPerformance: initialSettings?.useStreamerPerformance !== undefined ? initialSettings.useStreamerPerformance : true,
    useGlobalPatterns: initialSettings?.useGlobalPatterns !== undefined ? initialSettings.useGlobalPatterns : false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings({
        riskLevel: initialSettings.riskLevel || 'balanced',
        maxPointsPerPrediction: initialSettings.maxPointsPerPrediction || 2500,
        useChatSentiment: initialSettings.useChatSentiment !== undefined ? initialSettings.useChatSentiment : true,
        useHistoricalOutcomes: initialSettings.useHistoricalOutcomes !== undefined ? initialSettings.useHistoricalOutcomes : true,
        useStreamerPerformance: initialSettings.useStreamerPerformance !== undefined ? initialSettings.useStreamerPerformance : true,
        useGlobalPatterns: initialSettings.useGlobalPatterns !== undefined ? initialSettings.useGlobalPatterns : false,
      });
    }
  }, [initialSettings]);

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    
    try {
      await updateSettings(settings);
      
      toast({
        title: "Settings saved",
        description: "Your prediction settings have been updated successfully.",
      });
      
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Failed to save settings",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card shadow-sm overflow-hidden">
      <CardHeader className="px-6 border-b border-gray-800">
        <CardTitle>Prediction Settings</CardTitle>
        <CardDescription>Configure AI prediction strategy</CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 py-4 space-y-5">
        <div>
          <Label className="block text-sm font-medium mb-2">Risk Level</Label>
          <Select 
            value={settings.riskLevel} 
            onValueChange={(value) => setSettings({...settings, riskLevel: value})}
          >
            <SelectTrigger className="w-full bg-background border-gray-700">
              <SelectValue placeholder="Select risk level" />
            </SelectTrigger>
            <SelectContent>
              {config.riskLevelOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="block text-sm font-medium mb-2">Maximum Points Per Prediction</Label>
          <Slider
            value={[settings.maxPointsPerPrediction]}
            min={100}
            max={10000}
            step={100}
            onValueChange={(value) => setSettings({...settings, maxPointsPerPrediction: value[0]})}
            className="my-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>100</span>
            <span>{settings.maxPointsPerPrediction.toLocaleString()}</span>
            <span>10,000</span>
          </div>
        </div>
        
        <div>
          <Label className="block text-sm font-medium mb-2">Analysis Factors</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="factor1" 
                checked={settings.useChatSentiment}
                onCheckedChange={(checked) => 
                  setSettings({...settings, useChatSentiment: checked === true})
                }
              />
              <label htmlFor="factor1" className="text-sm">Chat sentiment analysis</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="factor2" 
                checked={settings.useHistoricalOutcomes}
                onCheckedChange={(checked) => 
                  setSettings({...settings, useHistoricalOutcomes: checked === true})
                }
              />
              <label htmlFor="factor2" className="text-sm">Historical outcomes</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="factor3" 
                checked={settings.useStreamerPerformance}
                onCheckedChange={(checked) => 
                  setSettings({...settings, useStreamerPerformance: checked === true})
                }
              />
              <label htmlFor="factor3" className="text-sm">Streamer performance trends</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="factor4" 
                checked={settings.useGlobalPatterns}
                onCheckedChange={(checked) => 
                  setSettings({...settings, useGlobalPatterns: checked === true})
                }
              />
              <label htmlFor="factor4" className="text-sm">Global voting patterns</label>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-3 bg-background bg-opacity-50 flex justify-end">
        <Button 
          variant="default" 
          className="bg-primary hover:bg-primary/90"
          onClick={handleSaveSettings}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PredictionSettings;
