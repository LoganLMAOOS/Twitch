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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getSettings, updateSettings } from '@/lib/twitch';
import { Sparkles, User, Bell, Shield, LogOut, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import PredictionSettings from '@/components/PredictionSettings';
import config from '@/lib/config';

const Settings = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState('account');
  const [userSettings, setUserSettings] = useState({
    username: '',
    email: '',
    twitchConnected: false,
    notifications: {
      predictions: true,
      points: true,
      channels: true,
      email: false,
      browser: true,
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
    },
    appearance: {
      theme: 'dark',
      compactMode: false,
      animationsEnabled: true,
      fontSize: 'medium',
    }
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

  // Fetch user info
  const { 
    data: authStatus,
    isLoading: isLoadingAuth
  } = useQuery({
    queryKey: ['/api/auth/status'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/auth/status');
      return res.json();
    },
  });

  useEffect(() => {
    if (authStatus?.user) {
      setUserSettings(prevSettings => ({
        ...prevSettings,
        username: authStatus.user.username,
        twitchConnected: !!authStatus.user.twitchUsername,
      }));
    }
  }, [authStatus]);

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/auth/logout');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/');
      window.location.reload(); // Refresh to show login page
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectTwitch = async () => {
    try {
      const response = await apiRequest('GET', '/api/auth/twitch');
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Failed to initiate Twitch OAuth:', error);
      toast({
        title: "Connection failed",
        description: "Could not connect to Twitch. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, this would save all settings to the API
      toast({
        title: "Settings saved",
        description: "Your account settings have been updated successfully.",
      });
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

  const handleSettingsUpdated = () => {
    refetchSettings();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card col-span-1 md:row-span-2">
          <CardContent className="p-0">
            <Tabs defaultValue="account" orientation="vertical" onValueChange={setCurrentTab}>
              <TabsList className="w-full flex flex-col h-auto rounded-none border-r border-gray-800">
                <TabsTrigger 
                  value="account" 
                  className="justify-start px-6 py-3 rounded-none border-b border-gray-800 data-[state=active]:bg-primary/10"
                >
                  <User className="h-4 w-4 mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="justify-start px-6 py-3 rounded-none border-b border-gray-800 data-[state=active]:bg-primary/10"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="justify-start px-6 py-3 rounded-none border-b border-gray-800 data-[state=active]:bg-primary/10"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger 
                  value="predictions" 
                  className="justify-start px-6 py-3 rounded-none border-b border-gray-800 data-[state=active]:bg-primary/10"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Predictions
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center py-4 border-t border-gray-800">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Log Out
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-card col-span-1 md:col-span-3">
          <CardHeader className="border-b border-gray-800">
            <CardTitle>
              {currentTab === 'account' && 'Account Settings'}
              {currentTab === 'notifications' && 'Notification Preferences'}
              {currentTab === 'security' && 'Security Settings'}
              {currentTab === 'predictions' && 'Prediction Settings'}
            </CardTitle>
            <CardDescription>
              {currentTab === 'account' && 'Manage your account information and connections'}
              {currentTab === 'notifications' && 'Control when and how you receive notifications'}
              {currentTab === 'security' && 'Manage your account security options'}
              {currentTab === 'predictions' && 'Configure your automated prediction strategy'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            {currentTab === 'account' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={userSettings.username} 
                    onChange={(e) => setUserSettings({...userSettings, username: e.target.value})}
                    className="bg-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={userSettings.email} 
                    onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                    placeholder="Enter your email address"
                    className="bg-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Twitch Connection</Label>
                  <div className="flex items-center justify-between p-3 bg-background rounded-md">
                    <div>
                      <h4 className="font-medium flex items-center">
                        <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43Z"/>
                        </svg>
                        Twitch Account
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {userSettings.twitchConnected ? 
                          "Your Twitch account is connected" : 
                          "Connect your Twitch account to start farming"
                        }
                      </p>
                    </div>
                    <div>
                      {userSettings.twitchConnected ? (
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                          {user?.twitchUsername} Connected
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          className="border-primary text-primary"
                          onClick={handleConnectTwitch}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="p-3 bg-background rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Free Account</h4>
                        <p className="text-sm text-muted-foreground">
                          Basic features with limited channels
                        </p>
                      </div>
                      <Button variant="default" className="bg-primary hover:bg-primary/90">
                        Upgrade
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentTab === 'notifications' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Notification Types
                  </h3>
                  
                  <div className="flex items-center justify-between p-3 bg-background rounded-md">
                    <Label htmlFor="notify-predictions" className="flex-1">
                      <div className="font-medium">Prediction Results</div>
                      <div className="text-sm text-muted-foreground">Get notified when predictions complete</div>
                    </Label>
                    <Switch 
                      id="notify-predictions" 
                      checked={userSettings.notifications.predictions}
                      onCheckedChange={(checked) => 
                        setUserSettings({
                          ...userSettings, 
                          notifications: {...userSettings.notifications, predictions: checked}
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-background rounded-md">
                    <Label htmlFor="notify-points" className="flex-1">
                      <div className="font-medium">Points Milestones</div>
                      <div className="text-sm text-muted-foreground">Get notified on significant point gains</div>
                    </Label>
                    <Switch 
                      id="notify-points" 
                      checked={userSettings.notifications.points}
                      onCheckedChange={(checked) => 
                        setUserSettings({
                          ...userSettings, 
                          notifications: {...userSettings.notifications, points: checked}
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-background rounded-md">
                    <Label htmlFor="notify-channels" className="flex-1">
                      <div className="font-medium">Channel Status</div>
                      <div className="text-sm text-muted-foreground">Get notified when channels go live</div>
                    </Label>
                    <Switch 
                      id="notify-channels" 
                      checked={userSettings.notifications.channels}
                      onCheckedChange={(checked) => 
                        setUserSettings({
                          ...userSettings, 
                          notifications: {...userSettings.notifications, channels: checked}
                        })
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Notification Methods
                  </h3>
                  
                  <div className="flex items-center justify-between p-3 bg-background rounded-md">
                    <Label htmlFor="notify-email" className="flex-1">
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive notifications via email</div>
                    </Label>
                    <Switch 
                      id="notify-email" 
                      checked={userSettings.notifications.email}
                      onCheckedChange={(checked) => 
                        setUserSettings({
                          ...userSettings, 
                          notifications: {...userSettings.notifications, email: checked}
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-background rounded-md">
                    <Label htmlFor="notify-browser" className="flex-1">
                      <div className="font-medium">Browser Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive notifications in browser</div>
                    </Label>
                    <Switch 
                      id="notify-browser" 
                      checked={userSettings.notifications.browser}
                      onCheckedChange={(checked) => 
                        setUserSettings({
                          ...userSettings, 
                          notifications: {...userSettings.notifications, browser: checked}
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discord-webhook">Discord Webhook URL</Label>
                    <Input
                      id="discord-webhook"
                      type="url" 
                      placeholder="https://discord.com/api/webhooks/..."
                      value={settings?.discordWebhookUrl || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const newSettings = settings ? { ...settings, discordWebhookUrl: value } : { discordWebhookUrl: value };
                        updateSettings(newSettings);
                      }}
                      className="bg-background"
                    />
                    <p className="text-sm text-muted-foreground">Enter your Discord webhook URL to receive notifications in your Discord server</p>
                  </div>
                </div>
              </div>
            )}
            
            {currentTab === 'security' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" className="bg-background" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" className="bg-background" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" className="bg-background" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-background rounded-md">
                  <Label htmlFor="two-factor" className="flex-1">
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                  </Label>
                  <Switch 
                    id="two-factor" 
                    checked={userSettings.security.twoFactor}
                    onCheckedChange={(checked) => 
                      setUserSettings({
                        ...userSettings, 
                        security: {...userSettings.security, twoFactor: checked}
                      })
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Slider
                    value={[userSettings.security.sessionTimeout]}
                    min={15}
                    max={120}
                    step={15}
                    onValueChange={(value) => 
                      setUserSettings({
                        ...userSettings, 
                        security: {...userSettings.security, sessionTimeout: value[0]}
                      })
                    }
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>15 min</span>
                    <span>{userSettings.security.sessionTimeout} min</span>
                    <span>120 min</span>
                  </div>
                </div>
              </div>
            )}
            
            {currentTab === 'predictions' && (
              <PredictionSettings 
                initialSettings={settings}
                onSettingsUpdated={handleSettingsUpdated}
              />
            )}
          </CardContent>
          
          {currentTab !== 'predictions' && (
            <CardFooter className="flex justify-end py-4 border-t border-gray-800">
              <Button 
                variant="default" 
                className="bg-primary hover:bg-primary/90"
                onClick={handleSaveSettings}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Settings;
