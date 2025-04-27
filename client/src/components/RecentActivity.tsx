import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActivityIcon, formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getActivityFeed } from '@/lib/twitch';

interface Activity {
  id: number;
  type: string;
  description: string;
  createdAt: string;
  channelName?: string;
  points?: number;
}

interface RecentActivityProps {
  activities: Activity[];
  isLoading: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, isLoading }) => {
  const { toast } = useToast();
  const [loadingMore, setLoadingMore] = useState(false);
  const [allActivities, setAllActivities] = useState<Activity[]>(activities);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    
    try {
      // Get more activities
      const moreActivities = await getActivityFeed(20); // Load more
      setAllActivities(moreActivities);
      
      toast({
        title: "Activities loaded",
        description: "Successfully loaded more activities.",
      });
    } catch (error) {
      console.error('Failed to load more activities:', error);
      toast({
        title: "Failed to load activities",
        description: "There was an error loading more activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  // Prepare activities for display
  const displayActivities = allActivities.length > 0 ? allActivities : activities;

  return (
    <Card className="mt-8 bg-card shadow-sm overflow-hidden">
      <CardHeader className="px-6 border-b border-gray-800">
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest farming and prediction activities</CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 py-4">
        <div className="flow-root">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-48 bg-muted rounded animate-pulse"></div>
                    <div className="h-2 w-16 bg-muted rounded animate-pulse mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayActivities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No activities yet. Start farming points to see activity here.
            </div>
          ) : (
            <ul className="-mb-8">
              {displayActivities.map((activity, index) => {
                const isLast = index === displayActivities.length - 1;
                const { icon, bgColor, textColor } = getActivityIcon(activity.type);
                
                return (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {!isLast && (
                        <span 
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-700" 
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center ring-8 ring-card`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 ${textColor}`}>
                              {icon === 'coins' && <><circle cx="8" cy="8" r="7" /><circle cx="16" cy="16" r="7" /></>}
                              {icon === 'chart-line' && <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></>}
                              {icon === 'robot' && <><rect width="18" height="10" x="3" y="11" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" x2="8" y1="16" y2="16" /><line x1="16" x2="16" y1="16" y2="16" /></>}
                              {icon === 'times' && <><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></>}
                              {icon === 'clock' && <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>}
                              {icon === 'tv' && <><rect width="20" height="15" x="2" y="7" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" /></>}
                            </svg>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm font-medium">
                              {activity.type === 'points' && 'Points Collected'}
                              {activity.type === 'prediction' && 'Prediction Made'}
                              {activity.type === 'prediction_won' && 'Prediction Won'}
                              {activity.type === 'prediction_lost' && 'Prediction Lost'}
                              {activity.type === 'watchtime' && 'Watchtime Tracked'}
                              {activity.type === 'channel' && 'Channel Updated'}
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {activity.description}
                              {activity.channelName && ` from ${activity.channelName}'s stream`}
                            </p>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span>{formatRelativeTime(activity.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        {!isLoading && displayActivities.length > 0 && (
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              size="sm"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="text-primary hover:text-primary/90"
            >
              {loadingMore ? 'Loading...' : 'View more activity'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
