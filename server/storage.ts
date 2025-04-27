import { 
  users, type User, type InsertUser, 
  channels, type Channel, type InsertChannel,
  predictions, type Prediction, type InsertPrediction,
  activities, type Activity, type InsertActivity,
  settings, type Settings, type InsertSettings
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByTwitchId(twitchId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTwitchData(userId: number, twitchData: Partial<User>): Promise<User | undefined>;
  
  // Channel methods
  getChannels(userId: number): Promise<Channel[]>;
  getChannel(id: number): Promise<Channel | undefined>;
  getChannelByUserAndChannelId(userId: number, channelId: string): Promise<Channel | undefined>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  updateChannel(id: number, channelData: Partial<Channel>): Promise<Channel | undefined>;
  deleteChannel(id: number): Promise<boolean>;
  
  // Prediction methods
  getPredictions(userId: number, limit?: number): Promise<Prediction[]>;
  getPredictionsByChannel(userId: number, channelId: string, limit?: number): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  updatePrediction(id: number, predictionData: Partial<Prediction>): Promise<Prediction | undefined>;
  
  // Activity methods
  getActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Settings methods
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, settingsData: Partial<Settings>): Promise<Settings | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private channels: Map<number, Channel>;
  private predictions: Map<number, Prediction>;
  private activities: Map<number, Activity>;
  private settings: Map<number, Settings>;
  
  private currentUserId: number;
  private currentChannelId: number;
  private currentPredictionId: number;
  private currentActivityId: number;
  private currentSettingsId: number;

  constructor() {
    this.users = new Map();
    this.channels = new Map();
    this.predictions = new Map();
    this.activities = new Map();
    this.settings = new Map();
    
    this.currentUserId = 1;
    this.currentChannelId = 1;
    this.currentPredictionId = 1;
    this.currentActivityId = 1;
    this.currentSettingsId = 1;
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByTwitchId(twitchId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.twitchId === twitchId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserTwitchData(userId: number, twitchData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...twitchData };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Channel Methods
  async getChannels(userId: number): Promise<Channel[]> {
    return Array.from(this.channels.values()).filter(
      (channel) => channel.userId === userId
    );
  }
  
  async getChannel(id: number): Promise<Channel | undefined> {
    return this.channels.get(id);
  }
  
  async getChannelByUserAndChannelId(userId: number, channelId: string): Promise<Channel | undefined> {
    return Array.from(this.channels.values()).find(
      (channel) => channel.userId === userId && channel.channelId === channelId
    );
  }
  
  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const id = this.currentChannelId++;
    const now = new Date();
    const channel: Channel = { 
      ...insertChannel, 
      id, 
      totalPoints: 0,
      totalWatchtime: 0,
      predictionsWon: 0,
      predictionsLost: 0,
      lastPointsUpdate: now,
      lastWatchtimeUpdate: now
    };
    this.channels.set(id, channel);
    return channel;
  }
  
  async updateChannel(id: number, channelData: Partial<Channel>): Promise<Channel | undefined> {
    const channel = await this.getChannel(id);
    if (!channel) return undefined;
    
    const updatedChannel = { ...channel, ...channelData };
    this.channels.set(id, updatedChannel);
    return updatedChannel;
  }
  
  async deleteChannel(id: number): Promise<boolean> {
    return this.channels.delete(id);
  }
  
  // Prediction Methods
  async getPredictions(userId: number, limit?: number): Promise<Prediction[]> {
    const predictions = Array.from(this.predictions.values())
      .filter(prediction => prediction.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return limit ? predictions.slice(0, limit) : predictions;
  }
  
  async getPredictionsByChannel(userId: number, channelId: string, limit?: number): Promise<Prediction[]> {
    const predictions = Array.from(this.predictions.values())
      .filter(prediction => prediction.userId === userId && prediction.channelId === channelId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return limit ? predictions.slice(0, limit) : predictions;
  }
  
  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = this.currentPredictionId++;
    const now = new Date();
    const prediction: Prediction = { 
      ...insertPrediction, 
      id, 
      result: 'pending',
      pointsWon: 0,
      outcome: null,
      createdAt: now
    };
    this.predictions.set(id, prediction);
    return prediction;
  }
  
  async updatePrediction(id: number, predictionData: Partial<Prediction>): Promise<Prediction | undefined> {
    const prediction = this.predictions.get(id);
    if (!prediction) return undefined;
    
    const updatedPrediction = { ...prediction, ...predictionData };
    this.predictions.set(id, updatedPrediction);
    return updatedPrediction;
  }
  
  // Activity Methods
  async getActivities(userId: number, limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const now = new Date();
    const activity: Activity = { 
      ...insertActivity, 
      id,
      createdAt: now
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Settings Methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId
    );
  }
  
  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.currentSettingsId++;
    const settings: Settings = { ...insertSettings, id };
    this.settings.set(id, settings);
    return settings;
  }
  
  async updateSettings(userId: number, settingsData: Partial<Settings>): Promise<Settings | undefined> {
    const settings = Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId
    );
    
    if (!settings) return undefined;
    
    const updatedSettings = { ...settings, ...settingsData };
    this.settings.set(settings.id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
