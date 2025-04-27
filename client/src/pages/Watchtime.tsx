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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { getChannels, formatWatchtime } from '@/lib/twitch';
import { RefreshCw, Settings, Clock, Play, Pause, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChannelSelector from '@/components/ChannelSelector';
import ChannelSettingsDialog from '@/components/ChannelSettingsDialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Watchtime = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [channelSettingsOpen, setChannelSettingsOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [enableBackgroundWatching, setEnableBackgroundWatching] = useState(true);

  // Fetch channels
  const { 
    data: channels = [], 
    isLoading: isLoadingChannels,
    refetch: refetchChannels
  } = useQuery({
    queryKey: ['/api/channels'],
    queryFn: getChannels,
  });

  // Sample watchtime history data (in a real app, this would come from the API)
  const watchtimeHistory = [
    { name: 'xQc', minutes: 1394 },
    { name: 'pokimane', minutes: 1125 },
    { name: 'shroud', minutes: 1942 },
    { name: 'Myth', minutes: 876 },
    { name: 'Ninja', minutes: 654 },
    { name: 'LIRIK', minutes: 1232 },
    { name: 'TimTheTatman', minutes: 895 },
  ];

  // Total watchtime
  const totalWatchtime = channels.reduce((sum, channel) => sum + (channel.totalWatchtime || 0), 0);

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
        description: "Latest watchtime data has been loaded.",
      });
    } catch (error) {
      console.error('Failed to refresh channels:', error);
      toast({
        title: "Refresh failed",
        description: "Failed to update watchtime data. Please try again.",
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

  const toggleWatchStatus = (channelId: number) => {
    const updatedChannels = channels.map(channel => {
      if (channel.id === channelId) {
        const newStatus = !channel.autoWatchtime;
        
        // This would actually make an API call in a real implementation
        toast({
          title: `${newStatus ? 'Started' : 'Paused'} watching`,
          description: `${newStatus ? 'Started' : 'Paused'} watching channel ${channel.channelName}.`,
        });
        
        return { ...channel, autoWatchtime: newStatus };
      }
      return channel;
    });
    
    // Update local state
    queryClient.setQueryData(['/api/channels'], updatedChannels);
  };

  const handleBackgroundWatchingToggle = (checked: boolean) => {
    setEnableBackgroundWatching(checked);
    toast({
      title: `Background watching ${checked ? 'enabled' : 'disabled'}`,
      description: `Streams will ${checked ? 'continue' : 'pause'} watching when tab is inactive.`,
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

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Total Watchtime</h3>
              <Clock className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold">{formatWatchtime(totalWatchtime)}</p>
            <p className="text-xs text-green-400 mt-2 flex items-center">
              <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5 9-9"/>
              </svg>
              <span>Across {channels.length} channels</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Active Tracking</h3>
              <Play className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold">
              {channels.filter(channel => channel.autoWatchtime).length} channels
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <span>of {channels.length} total channels</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Top Channel</h3>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-purple-400">
                <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/>
                <polyline points="17 2 12 7 7 2"/>
              </svg>
            </div>
            <p className="text-2xl font-bold">
              {channels.length > 0 ? 
                channels.reduce((max, channel) => 
                  channel.totalWatchtime > max.totalWatchtime ? channel : max, channels[0]
                ).channelName : 'None'
              }
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <span>Most watched channel</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Daily Average</h3>
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold">
              {totalWatchtime > 0 ? formatWatchtime(Math.floor(totalWatchtime / 30)) : '0h 0m'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <span>Per day (last 30 days)</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 bg-card">
          <CardHeader className="border-b border-gray-800">
            <CardTitle>Watchtime by Channel</CardTitle>
            <CardDescription>Hours spent on each channel</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={watchtimeHistory}
                  margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    formatter={(value: any) => [formatWatchtime(value), 'Watchtime']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Bar dataKey="minutes">
                    {watchtimeHistory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 60%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="border-b border-gray-800">
            <CardTitle>Watchtime Settings</CardTitle>
            <CardDescription>Configure watchtime behavior</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="background-watching" className="flex-1">Enable background watching</Label>
                <Switch 
                  id="background-watching" 
                  checked={enableBackgroundWatching}
                  onCheckedChange={handleBackgroundWatchingToggle}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-online" className="flex-1">Auto-watch when channels go live</Label>
                <Switch id="auto-online" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mute-streams" className="flex-1">Mute all streams</Label>
                <Switch id="mute-streams" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="drop-priority" className="flex-1">Prioritize channels with drops</Label>
                <Switch id="drop-priority" defaultChecked />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Video Quality</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="bg-primary/80 text-primary-foreground">Low</Button>
                <Button variant="outline" size="sm">Medium</Button>
                <Button variant="outline" size="sm">High</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lower quality uses less resources
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card shadow-sm overflow-hidden">
        <CardHeader className="px-6 border-b border-gray-800 flex-row flex justify-between items-center">
          <div>
            <CardTitle>Active Streams</CardTitle>
            <CardDescription>Currently tracking watchtime on these channels</CardDescription>
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
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Total Watchtime</TableHead>
                <TableHead className="text-muted-foreground">Current Session</TableHead>
                <TableHead className="text-muted-foreground">Progress</TableHead>
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
                    No channels found. Add a channel to start tracking watchtime.
                  </TableCell>
                </TableRow>
              ) : (
                channels.map((channel) => {
                  // In a real app, this data would come from the API
                  const isOnline = Math.random() > 0.3;
                  const sessionTime = isOnline ? Math.floor(Math.random() * 120) : 0;
                  const progress = Math.floor(Math.random() * 100);
                  
                  return (
                    <TableRow key={channel.id}>
                      <TableCell className="py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full overflow-hidden mr-3 bg-muted flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                              <path d="M15 11h.01M11 11h.01M7 11h.01M3 5v14h18V5z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">{channel.channelName}</div>
                            <div className="text-xs text-muted-foreground">
                              {isOnline ? 'Online' : 'Offline'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${channel.autoWatchtime ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {channel.autoWatchtime ? 'Watching' : 'Paused'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatWatchtime(channel.totalWatchtime || 0)}
                      </TableCell>
                      <TableCell>
                        {isOnline ? `${sessionTime}m` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="w-full max-w-xs flex items-center gap-2">
                          <Progress value={progress} className="h-2" />
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleWatchStatus(channel.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {channel.autoWatchtime ? 
                              <Pause className="h-4 w-4" /> : 
                              <Play className="h-4 w-4" />
                            }
                          </Button>
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

export default Watchtime;
