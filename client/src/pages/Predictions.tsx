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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getChannels, getPredictions, getSettings, formatPoints } from '@/lib/twitch';
import { RefreshCw, Settings, Check, X, Clock, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChannelSelector from '@/components/ChannelSelector';
import PredictionSettings from '@/components/PredictionSettings';
import { formatRelativeTime } from '@/lib/utils';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const Predictions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  
  // Fetch channels
  const { 
    data: channels = [], 
    isLoading: isLoadingChannels,
    refetch: refetchChannels
  } = useQuery({
    queryKey: ['/api/channels'],
    queryFn: getChannels,
  });

  // Fetch predictions
  const { 
    data: predictions = [], 
    isLoading: isLoadingPredictions,
    refetch: refetchPredictions
  } = useQuery({
    queryKey: ['/api/predictions'],
    queryFn: () => getPredictions(20),
  });

  // Fetch user settings
  const { 
    data: settings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings
  } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: getSettings,
  });

  // Set the first channel as the current one when channels load
  useEffect(() => {
    if (channels.length > 0 && !currentChannelId) {
      setCurrentChannelId(channels[0].channelId);
    }
  }, [channels, currentChannelId]);

  // Find current channel object
  const currentChannel = channels.find(c => c.channelId === currentChannelId);

  // Calculate prediction stats
  const totalPredictions = predictions.length;
  const wonPredictions = predictions.filter(p => p.result === 'won').length;
  const lostPredictions = predictions.filter(p => p.result === 'lost').length;
  const pendingPredictions = predictions.filter(p => p.result === 'pending' || !p.result).length;
  const winRate = totalPredictions > 0 ? (wonPredictions / totalPredictions) * 100 : 0;
  
  // Total points won/lost
  const totalPointsWon = predictions
    .filter(p => p.result === 'won')
    .reduce((sum, p) => sum + (p.pointsWon || 0), 0);
  
  const totalPointsLost = predictions
    .filter(p => p.result === 'lost')
    .reduce((sum, p) => sum + p.points, 0);
  
  const netPointsGain = totalPointsWon - totalPointsLost;

  // Pie chart data
  const predictionStats = [
    { name: 'Won', value: wonPredictions, color: '#22c55e' }, // green
    { name: 'Lost', value: lostPredictions, color: '#ef4444' }, // red
    { name: 'Pending', value: pendingPredictions, color: '#3b82f6' }, // blue
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPredictions(),
        refetchChannels(),
        refetchSettings()
      ]);
      toast({
        title: "Predictions refreshed",
        description: "Latest prediction data has been loaded.",
      });
    } catch (error) {
      console.error('Failed to refresh predictions:', error);
      toast({
        title: "Refresh failed",
        description: "Failed to update prediction data. Please try again.",
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

  const handleSettingsUpdated = () => {
    refetchSettings();
  };

  const getResultBadge = (result: string) => {
    switch(result) {
      case 'won':
        return <Badge className="bg-green-600">Won</Badge>;
      case 'lost':
        return <Badge className="bg-red-600">Lost</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-blue-600">Pending</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6">
      <ChannelSelector 
        channels={channels}
        currentChannel={currentChannelId}
        onChannelChange={handleChannelChange}
        onChannelAdded={handleChannelAdded}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Total Predictions</h3>
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold">{totalPredictions}</p>
            <p className="text-xs text-muted-foreground mt-2">
              <span>Across all channels</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Win Rate</h3>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold">{winRate.toFixed(1)}%</p>
            <p className="text-xs text-green-400 mt-2 flex items-center">
              <Check className="w-3 h-3 mr-1" />
              <span>{wonPredictions} wins / {lostPredictions} losses</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Points Won</h3>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 text-yellow-400 fill-current">
                <path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2l0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5V176c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336V300.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4V336zm0-96V208c0-1.8-.1-3.5-.2-5.3c20 4.8 37.8 11.1 52.4 18.5c27.3 13.8 43.8 31.6 43.8 50.9v35.9c-12.5-10.3-27.6-18.7-43.9-25.5c-22-9.1-47.9-16.1-76.2-20.5c13.5-13.6 24.1-31.6 24.1-53.4zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5V432c0 44.2-86 80-192 80S0 476.2 0 432V396.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z"/>
              </svg>
            </div>
            <p className="text-2xl font-bold">{formatPoints(totalPointsWon)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              <span>Total points from winning</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Net Profit</h3>
              {netPointsGain >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
            </div>
            <p className="text-2xl font-bold">{formatPoints(netPointsGain)}</p>
            <p className={`text-xs ${netPointsGain >= 0 ? 'text-green-400' : 'text-red-400'} mt-2`}>
              <span>{netPointsGain >= 0 ? 'Profit' : 'Loss'} from all predictions</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 bg-card">
          <CardHeader className="border-b border-gray-800">
            <CardTitle>Prediction History</CardTitle>
            <CardDescription>Recent predictions across all channels</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background bg-opacity-50">
                <TableRow>
                  <TableHead className="text-muted-foreground">Channel</TableHead>
                  <TableHead className="text-muted-foreground">Prediction</TableHead>
                  <TableHead className="text-muted-foreground">Bet</TableHead>
                  <TableHead className="text-muted-foreground">Choice</TableHead>
                  <TableHead className="text-muted-foreground">Result</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPredictions ? (
                  // Loading skeleton
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      {Array(6).fill(0).map((_, j) => (
                        <TableCell key={j} className="py-4">
                          <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : predictions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No predictions found. Start automating predictions to see history.
                    </TableCell>
                  </TableRow>
                ) : (
                  predictions.slice(0, 10).map((prediction) => {
                    const channelName = channels.find(c => c.channelId === prediction.channelId)?.channelName || prediction.channelId;
                    
                    return (
                      <TableRow key={prediction.id}>
                        <TableCell className="py-4">
                          {channelName}
                        </TableCell>
                        <TableCell className="py-4 max-w-[200px] truncate">
                          {prediction.title}
                        </TableCell>
                        <TableCell>
                          {formatPoints(prediction.points)}
                        </TableCell>
                        <TableCell>
                          {prediction.chosenOption}
                        </TableCell>
                        <TableCell>
                          {getResultBadge(prediction.result || 'pending')}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatRelativeTime(prediction.createdAt)}
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
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Predictions
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-card">
          <CardHeader className="border-b border-gray-800">
            <CardTitle>Prediction Stats</CardTitle>
            <CardDescription>Overview of your prediction performance</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={predictionStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {predictionStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [value, 'Predictions']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card shadow-sm overflow-hidden">
        <CardHeader className="px-6 border-b border-gray-800">
          <CardTitle>Prediction Settings</CardTitle>
          <CardDescription>Configure your automated prediction strategy</CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <PredictionSettings 
            initialSettings={settings}
            onSettingsUpdated={handleSettingsUpdated}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Predictions;
