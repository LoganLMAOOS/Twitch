import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Settings, 
  Trash2,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  removeChannel, 
  formatPoints, 
  formatWatchtime,
  formatWinRate
} from '@/lib/twitch';
import { getPlaceholderAvatar, getStatusColor } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface Channel {
  id: number;
  channelId: string;
  channelName: string;
  autoFarming: boolean;
  autoWatchtime: boolean;
  autoPredictions: boolean;
  totalPoints: number;
  totalWatchtime: number;
  predictionsWon: number;
  predictionsLost: number;
  lastPointsUpdate: string;
  lastWatchtimeUpdate: string;
  isOnline?: boolean;
  viewers?: number;
}

interface ActiveChannelsProps {
  channels: Channel[];
  isLoading: boolean;
  onRefresh: () => void;
  onChannelRemoved: () => void;
  onChannelSettings: (channel: Channel) => void;
}

const ActiveChannels: React.FC<ActiveChannelsProps> = ({
  channels,
  isLoading,
  onRefresh,
  onChannelRemoved,
  onChannelSettings
}) => {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleDeleteClick = (channel: Channel) => {
    setChannelToDelete(channel);
    setDeleteDialogOpen(true);
  };

  const handleDeleteChannel = async () => {
    if (!channelToDelete) return;
    
    try {
      await removeChannel(channelToDelete.id);
      toast({
        title: "Channel removed",
        description: `Successfully removed ${channelToDelete.channelName} from your channels.`,
      });
      onChannelRemoved();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to remove channel:', error);
      toast({
        title: "Failed to remove channel",
        description: "There was an error removing the channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="mt-8 bg-card shadow-sm overflow-hidden">
        <CardHeader className="px-6 border-b border-gray-800 flex-row flex justify-between items-center">
          <div>
            <CardTitle>Active Channels</CardTitle>
            <CardDescription>Currently farming points on these channels</CardDescription>
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
                <TableHead className="text-muted-foreground">Points</TableHead>
                <TableHead className="text-muted-foreground">Watchtime</TableHead>
                <TableHead className="text-muted-foreground">Predictions</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
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
                  const status = channel.autoFarming ? 'Farming Active' : 'Paused';
                  const statusClass = getStatusColor(status);
                  const winRate = formatWinRate(
                    calculateWinRate(channel.predictionsWon, channel.predictionsLost)
                  );
                  
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
                              {channel.isOnline ? 
                                `Online • ${channel.viewers?.toLocaleString() || 'Unknown'} viewers` : 
                                'Offline • Last online 2h ago'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                          {status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatPoints(channel.totalPoints)}</div>
                        <div className="text-xs text-green-400">+450 today</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatWatchtime(channel.totalWatchtime)}</div>
                        <div className="text-xs text-green-400">+2h 10m today</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{channel.predictionsWon} won / {channel.predictionsLost} lost</div>
                        <div className="text-xs text-teal-400">{winRate} win rate</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onChannelSettings(channel)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(channel)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Channel</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {channelToDelete?.channelName}? This will stop all point farming and tracking for this channel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteChannel}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper function for calculating win rate
function calculateWinRate(won: number, lost: number): number {
  const total = won + lost;
  if (total === 0) return 0;
  return (won / total) * 100;
}

export default ActiveChannels;
