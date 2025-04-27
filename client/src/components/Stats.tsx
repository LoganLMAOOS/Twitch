import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatPoints, formatWatchtime, formatWinRate } from '@/lib/twitch';

interface StatsProps {
  stats: {
    totalPoints: number;
    pointsChange: number;
    totalWatchtime: number;
    watchtimeChange: number;
    winRate: number;
    winRateChange: number;
    activeChannels: number;
    totalChannels: number;
  };
  isLoading: boolean;
}

const Stats: React.FC<StatsProps> = ({ stats, isLoading }) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded-full animate-pulse"></div>
              </div>
              <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
              <div className="mt-2 h-3 w-16 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Total Points Farmed</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 text-yellow-400 fill-current">
              <path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2l0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5V176c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336V300.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4V336zm0-96V208c0-1.8-.1-3.5-.2-5.3c20 4.8 37.8 11.1 52.4 18.5c27.3 13.8 43.8 31.6 43.8 50.9v35.9c-12.5-10.3-27.6-18.7-43.9-25.5c-22-9.1-47.9-16.1-76.2-20.5c13.5-13.6 24.1-31.6 24.1-53.4zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5V432c0 44.2-86 80-192 80S0 476.2 0 432V396.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold">{formatPoints(stats.totalPoints)}</p>
          <p className={`text-xs ${stats.pointsChange >= 0 ? 'text-green-400' : 'text-red-400'} mt-2 flex items-center`}>
            {stats.pointsChange >= 0 ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            <span>{stats.pointsChange >= 0 ? '+' : ''}{formatPoints(stats.pointsChange)} today</span>
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Total Watchtime</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 text-blue-400 fill-current">
              <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold">{formatWatchtime(stats.totalWatchtime)}</p>
          <p className={`text-xs ${stats.watchtimeChange >= 0 ? 'text-green-400' : 'text-red-400'} mt-2 flex items-center`}>
            {stats.watchtimeChange >= 0 ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            <span>{stats.watchtimeChange >= 0 ? '+' : ''}{formatWatchtime(stats.watchtimeChange)} today</span>
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Predictions Win Rate</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-4 h-4 text-teal-400 fill-current">
              <path d="M184 48H328c4.4 0 8 3.6 8 8V96H176V56c0-4.4 3.6-8 8-8zm-56 8V96H64C28.7 96 0 124.7 0 160v96H192 448 640V160c0-35.3-28.7-64-64-64H512V56c0-30.9-25.1-56-56-56H184c-30.9 0-56 25.1-56 56zM640 288H448V416c0 35.3-28.7 64-64 64H256c-35.3 0-64-28.7-64-64V288H0V416c0 35.3 28.7 64 64 64H576c35.3 0 64-28.7 64-64V288zM256 320H384V416c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V320z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold">{formatWinRate(stats.winRate)}</p>
          <p className={`text-xs ${stats.winRateChange >= 0 ? 'text-green-400' : 'text-red-400'} mt-2 flex items-center`}>
            {stats.winRateChange >= 0 ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            <span>{stats.winRateChange >= 0 ? '+' : ''}{stats.winRateChange}% this week</span>
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Active Channels</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-4 h-4 text-purple-400 fill-current">
              <path d="M64 64V352H576V64H64zM0 64C0 28.7 28.7 0 64 0H576c35.3 0 64 28.7 64 64V352c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM128 448H512c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold">{stats.activeChannels}</p>
          <p className="text-xs text-muted-foreground mt-2">
            <span>of {stats.totalChannels} total channels</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stats;
