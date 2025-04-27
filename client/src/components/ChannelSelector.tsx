import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addChannel } from '@/lib/twitch';
import useMobile from '@/hooks/use-mobile';

interface ChannelSelectorProps {
  channels: { id: number; channelId: string; channelName: string }[];
  currentChannel: string | null;
  onChannelChange: (channelId: string) => void;
  onChannelAdded: () => void;
}

const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  channels,
  currentChannel,
  onChannelChange,
  onChannelAdded
}) => {
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isMobile = useMobile();

  const handleAddChannel = async () => {
    if (!newChannelName.trim()) {
      toast({
        title: "Channel name is required",
        description: "Please enter a valid Twitch channel name.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // For simplicity, we're using the channel name as the ID
      // In a real app, you'd want to validate this against the Twitch API
      await addChannel(newChannelName.toLowerCase(), newChannelName);
      
      toast({
        title: "Channel added",
        description: `Successfully added ${newChannelName} to your channels.`,
      });
      
      setNewChannelName('');
      setIsAddChannelOpen(false);
      onChannelAdded();
    } catch (error) {
      console.error('Failed to add channel:', error);
      toast({
        title: "Failed to add channel",
        description: "There was an error adding the channel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
      <h1 className="text-2xl font-bold mb-4 md:mb-0">Dashboard</h1>
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="relative">
          <Select 
            value={currentChannel || undefined} 
            onValueChange={onChannelChange}
          >
            <SelectTrigger className="w-full sm:w-[200px] bg-card border-gray-700">
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              {channels.map(channel => (
                <SelectItem key={channel.channelId} value={channel.channelId}>
                  {channel.channelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="default" 
          onClick={() => setIsAddChannelOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Channel
        </Button>
      </div>

      <Dialog open={isAddChannelOpen} onOpenChange={setIsAddChannelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Twitch Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Channel Name</label>
              <Input 
                placeholder="Enter Twitch channel name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddChannelOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddChannel} 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Adding...' : 'Add Channel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChannelSelector;
