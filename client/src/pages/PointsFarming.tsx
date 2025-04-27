import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { getChannels, formatPoints, formatWatchtime } from '@/lib/twitch';
import { RefreshCw, Settings, Plus, TrendingUp, BarChart3, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChannelSelector from '@/components/ChannelSelector';
import ChannelSettingsDialog from '@/components/ChannelSettingsDialog';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PointsFarming = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [farmingSpeed, setFarmingSpeed] = useState(50);
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

  // Sample points history data
  const pointsHistory = [
    { date: 'Jan', points: 3400 },
    { date: 'Feb', points: 8700 },
    { date: 'Mar', points: 15200 },
    { date: 'Apr', points: 23000 },
    { date: 'May', points: 38500 },
    { date: 'Jun', points: 52000 },
    { date: 'Jul', points: 76500 },
    { date: 'Aug', points: 93000 },
    { date: 'Sep', points: 106500 },
    { date: 'Oct', points: 124500 },
  ];

  // Set the first channel as the current one when channels load
  useEffect(() => {
    if (channels.length > 0 && !currentChannelId) {
      setCurrentChannelId(channels[0].channelId);
    }
  }, [channels, currentChannelId]);

  // Find current channel object
  const currentChannel = channels.find(c => c.channelId === currentChannelId);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchChannels();
      toast({
        title: "Channels refreshed",
        description: "Latest channel data has been loaded.",
      });
    } catch (error) {
      console.error('Failed to refresh channels:', error);
      toast({
        title: "Refresh failed",
        description: "Failed to update channel data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleChannelChange = (channelId: string) => {
    setCurrentChannelId(channelId);
  };

  const handleChannelAdded = () => {
    refetchChannels();
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
  };

  const handleSpeedChange = (value: number[]) => {
    setFarmingSpeed(value[0]);
    toast({
      title: "Farming speed updated",
      description: `Points farming speed set to ${value[0]}%`,
    });
  };

  return (
    <div className="p-4 md:p-6">
      <ChannelSelector 
        channels={channels}
        currentChannel={currentChannelId}
        onChannelChange={handleChannelChange}
        onChannelAdded={handleChannelAdded}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 bg-card">
          <CardHeader className="border-b border-gray-800">
            <CardTitle>Points Growth</CardTitle>
            <CardDescription>Track your points accumulation over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={pointsHistory}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="points" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorPoints)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="border-b border-gray-800">
            <CardTitle>Farming Settings</CardTitle>
            <CardDescription>Configure farming behavior</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <Label className="block text-sm font-medium mb-2">Farming Speed</Label>
              <Slider
                value={[farmingSpeed]}
                min={10}
                max={100}
                step={10}
                onValueChange={handleSpeedChange}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Slower</span>
                <span>{farmingSpeed}%</span>
                <span>Faster</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Higher speed increases collection rate but may be more detectable
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-claim-bonus" className="flex-1">Auto-claim bonus points</Label>
                <Switch id="auto-claim-bonus" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-click-chests" className="flex-1">Auto-click point chests</Label>
                <Switch id="auto-click-chests" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="channel-raids" className="flex-1">Follow channel raids</Label>
                <Switch id="channel-raids" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card shadow-sm overflow-hidden">
        <CardHeader className="px-6 border-b border-gray-800 flex-row flex justify-between items-center">
          <div>
            <CardTitle>Channel Point Stats</CardTitle>
            <CardDescription>Points farming stats for each channel</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background bg-opacity-50">
              <TableRow>
                <TableHead className="text-muted-foreground">Channel</TableHead>
                <TableHead className="text-muted-foreground">Total Points</TableHead>
                <TableHead className="text-muted-foreground">Daily Average</TableHead>
                <TableHead className="text-muted-foreground">Farming Status</TableHead>
                <TableHead className="text-muted-foreground">Points Per Hour</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingChannels ? (
                // Loading skeleton
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <TableCell key={j} className="py-4">
                        <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : channels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No channels found. Add a channel to start farming points.
                  </TableCell>
                </TableRow>
              ) : (
                channels.map((channel) => {
                  const status = channel.autoFarming ? 'Active' : 'Paused';
                  const statusClass = status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                  
                  // Fake points per hour (in a real app, this would come from the API)
                  const pointsPerHour = Math.floor(Math.random() * 300) + 100;
                  const dailyAverage = Math.floor(Math.random() * 2000) + 500;
                  
                  return (
                    <TableRow key={channel.id}>
                      <TableCell className="py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full overflow-hidden mr-3 bg-muted flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                              <path d="M15 11h.01M11 11h.01M7 11h.01M3 5v14h18V5z"/>
                            </svg>
                          </div>
                          <div className="font-medium">{channel.channelName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatPoints(channel.totalPoints)}
                      </TableCell>
                      <TableCell>
                        {formatPoints(dailyAverage)} points
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                          {status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span>{pointsPerHour} points/hr</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenChannelSettings(channel)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <CardFooter className="flex justify-center py-4 border-t border-gray-800">
          <Button 
            variant="outline" 
            className="text-primary"
            onClick={() => {}}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Channel
          </Button>
        </CardFooter>
      </Card>

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

export default PointsFarming;
