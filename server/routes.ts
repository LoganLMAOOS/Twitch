import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { 
  insertUserSchema, insertChannelSchema, insertPredictionSchema, 
  insertActivitySchema, updateSettingsSchema, twitchAuthSchema,
  channelStatsSchema, toggleSettingSchema
} from "@shared/schema";
import { ZodError } from "zod";
import fetch from "node-fetch";

// Utility function to validate Twitch token
async function validateTwitchToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        'Authorization': `OAuth ${token}`
      }
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error validating Twitch token:", error);
    return false;
  }
}

// Middleware for checking authentication
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware for handling Zod validation errors
const handleZodError = (error: unknown, res: Response) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: error.errors 
    });
  }
  
  console.error("Unexpected error:", error);
  return res.status(500).json({ message: "Internal server error" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const MemoryStoreSession = MemoryStore(session);
  
  app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    secret: process.env.SESSION_SECRET || 'twitchfarm-secret',
    saveUninitialized: false,
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure Passport Local Strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      
      if (user.password !== password) {
        return done(null, false, { message: "Incorrect password" });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      // Create default settings for the user
      await storage.createSettings({
        userId: newUser.id,
        riskLevel: "balanced",
        maxPointsPerPrediction: 2500,
        useChatSentiment: true,
        useHistoricalOutcomes: true,
        useStreamerPerformance: true,
        useGlobalPatterns: false,
        notificationsEnabled: false
      });
      
      // Login after registration
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during login after registration" });
        }
        return res.status(201).json({ id: newUser.id, username: newUser.username });
      });
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    const user = req.user as any;
    res.json({ id: user.id, username: user.username });
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({ 
        isAuthenticated: true, 
        user: { id: user.id, username: user.username, twitchUsername: user.twitchUsername } 
      });
    }
    res.json({ isAuthenticated: false });
  });
  
  // Twitch OAuth Routes
  app.get('/api/auth/twitch', isAuthenticated, (req, res) => {
    const clientId = process.env.TWITCH_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ message: "Missing Twitch client ID configuration" });
    }
    
    // Get origin host from request for redirect
    const redirectUri = req.headers.origin 
      ? `${req.headers.origin}/api/auth/twitch/callback` 
      : `http://${req.get('host')}/api/auth/twitch/callback`;
    
    const scopes = [
      'user:read:email',
      'channel:read:predictions',
      'channel:manage:predictions',
      'channel:read:subscriptions',
      'user:read:follows'
    ].join(' ');
    
    const state = Math.random().toString(36).substring(2, 15);
    req.session.twitchOAuthState = state;
    
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${state}`;
    
    res.json({ authUrl });
  });
  
  app.get('/api/auth/twitch/callback', isAuthenticated, async (req, res) => {
    try {
      const { code, state } = twitchAuthSchema.parse(req.query);
      
      // Verify state
      if (state !== req.session.twitchOAuthState) {
        return res.status(400).json({ message: "Invalid state parameter" });
      }
      
      // Clear state from session
      delete req.session.twitchOAuthState;
      
      const clientId = process.env.TWITCH_CLIENT_ID;
      const clientSecret = process.env.TWITCH_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return res.status(500).json({ message: "Missing Twitch API credentials" });
      }
      
      // Get redirect URI
      const redirectUri = req.headers.origin 
        ? `${req.headers.origin}/api/auth/twitch/callback` 
        : `http://${req.get('host')}/api/auth/twitch/callback`;
      
      // Exchange code for token
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        })
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        return res.status(400).json({ message: "Failed to get access token", error: errorData });
      }
      
      const tokenData = await tokenResponse.json();
      
      // Get user info from Twitch
      const userResponse = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Client-Id': clientId
        }
      });
      
      if (!userResponse.ok) {
        return res.status(400).json({ message: "Failed to get user info from Twitch" });
      }
      
      const userData = await userResponse.json();
      const twitchUser = userData.data[0];
      
      // Update user with Twitch info
      const user = req.user as any;
      await storage.updateUserTwitchData(user.id, {
        twitchId: twitchUser.id,
        twitchUsername: twitchUser.login,
        twitchToken: tokenData.access_token,
        twitchRefreshToken: tokenData.refresh_token,
        twitchTokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000)
      });
      
      // Redirect to dashboard
      res.redirect('/dashboard');
      
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  
  // Channel Routes
  app.get('/api/channels', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const channels = await storage.getChannels(user.id);
    res.json(channels);
  });
  
  app.post('/api/channels', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const channelData = insertChannelSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      // Check if channel already exists for this user
      const existingChannel = await storage.getChannelByUserAndChannelId(
        user.id, 
        channelData.channelId
      );
      
      if (existingChannel) {
        return res.status(400).json({ message: "Channel already exists for this user" });
      }
      
      const newChannel = await storage.createChannel(channelData);
      
      // Create activity for adding channel
      await storage.createActivity({
        userId: user.id,
        channelId: channelData.channelId,
        channelName: channelData.channelName,
        type: "channel",
        description: `Added channel ${channelData.channelName}`,
        points: null,
        metadata: null
      });
      
      res.status(201).json(newChannel);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  
  app.get('/api/channels/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const channelId = parseInt(req.params.id);
    
    if (isNaN(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID" });
    }
    
    const channel = await storage.getChannel(channelId);
    
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    
    if (channel.userId !== user.id) {
      return res.status(403).json({ message: "You don't have access to this channel" });
    }
    
    res.json(channel);
  });
  
  app.put('/api/channels/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const channelId = parseInt(req.params.id);
    
    if (isNaN(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID" });
    }
    
    const channel = await storage.getChannel(channelId);
    
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    
    if (channel.userId !== user.id) {
      return res.status(403).json({ message: "You don't have access to this channel" });
    }
    
    try {
      const updatedChannel = await storage.updateChannel(channelId, req.body);
      res.json(updatedChannel);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  
  app.delete('/api/channels/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const channelId = parseInt(req.params.id);
    
    if (isNaN(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID" });
    }
    
    const channel = await storage.getChannel(channelId);
    
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    
    if (channel.userId !== user.id) {
      return res.status(403).json({ message: "You don't have access to this channel" });
    }
    
    await storage.deleteChannel(channelId);
    
    // Create activity for removing channel
    await storage.createActivity({
      userId: user.id,
      channelId: channel.channelId,
      channelName: channel.channelName,
      type: "channel",
      description: `Removed channel ${channel.channelName}`,
      points: null,
      metadata: null
    });
    
    res.json({ message: "Channel deleted successfully" });
  });
  
  // Channel Stats
  app.get('/api/channels/stats/:channelId', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { channelId } = channelStatsSchema.parse(req.params);
      
      const channel = await storage.getChannelByUserAndChannelId(user.id, channelId);
      
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      // Get predictions for win rate calculation
      const predictions = await storage.getPredictionsByChannel(user.id, channelId);
      
      const totalPredictions = predictions.length;
      const wonPredictions = predictions.filter(p => p.result === 'won').length;
      const winRate = totalPredictions > 0 ? (wonPredictions / totalPredictions) * 100 : 0;
      
      res.json({
        totalPoints: channel.totalPoints,
        totalWatchtime: channel.totalWatchtime,
        predictionsWon: channel.predictionsWon,
        predictionsLost: channel.predictionsLost,
        winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal place
        lastPointsUpdate: channel.lastPointsUpdate,
        lastWatchtimeUpdate: channel.lastWatchtimeUpdate
      });
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  
  // Toggle channel settings
  app.post('/api/channels/toggle-setting', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { channelId, setting, value } = toggleSettingSchema.parse(req.body);
      
      const channel = await storage.getChannelByUserAndChannelId(user.id, channelId);
      
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      const updatedChannel = await storage.updateChannel(channel.id, {
        [setting]: value
      });
      
      res.json(updatedChannel);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  
  // Predictions Routes
  app.get('/api/predictions', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const predictions = await storage.getPredictions(user.id, limit);
    res.json(predictions);
  });
  
  app.get('/api/predictions/channel/:channelId', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const channelId = req.params.channelId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const predictions = await storage.getPredictionsByChannel(user.id, channelId, limit);
    res.json(predictions);
  });
  
  app.post('/api/predictions', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const predictionData = insertPredictionSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const newPrediction = await storage.createPrediction(predictionData);
      
      // Create activity for making prediction
      await storage.createActivity({
        userId: user.id,
        channelId: predictionData.channelId,
        channelName: null, // This would be filled in a real scenario
        type: "prediction",
        description: `Bet ${predictionData.points} points on "${predictionData.chosenOption}" for "${predictionData.title}"`,
        points: -predictionData.points,
        metadata: null
      });
      
      res.status(201).json(newPrediction);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  
  // Activity Routes
  app.get('/api/activities', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const activities = await storage.getActivities(user.id, limit);
    res.json(activities);
  });
  
  // Settings Routes
  app.get('/api/settings', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const settings = await storage.getSettings(user.id);
    
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }
    
    res.json(settings);
  });
  
  app.put('/api/settings', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const settingsData = updateSettingsSchema.parse(req.body);
      
      let settings = await storage.getSettings(user.id);
      
      if (!settings) {
        // Create settings if they don't exist
        settings = await storage.createSettings({
          userId: user.id,
          ...settingsData
        });
      } else {
        // Update existing settings
        settings = await storage.updateSettings(user.id, settingsData);
      }
      
      res.json(settings);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  
  // Dashboard summary
  app.get('/api/dashboard/summary', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    
    // Get user's channels
    const channels = await storage.getChannels(user.id);
    
    // Calculate totals
    const totalPoints = channels.reduce((sum, channel) => sum + channel.totalPoints, 0);
    const totalWatchtime = channels.reduce((sum, channel) => sum + channel.totalWatchtime, 0);
    const activeChannels = channels.filter(channel => 
      channel.autoFarming || channel.autoWatchtime || channel.autoPredictions
    ).length;
    
    // Get predictions for win rate calculation
    const predictions = await storage.getPredictions(user.id);
    const completedPredictions = predictions.filter(p => p.result !== 'pending');
    const wonPredictions = predictions.filter(p => p.result === 'won');
    
    const winRate = completedPredictions.length > 0 
      ? (wonPredictions.length / completedPredictions.length) * 100 
      : 0;
    
    // Calculate daily changes (this would use more complex logic in a real app)
    // For demo purposes, we'll use simple calculations
    const pointsChange = Math.floor(totalPoints * 0.02); // 2% daily change
    const watchtimeChange = Math.floor(totalWatchtime * 0.04); // 4% daily change
    const winRateChange = 2; // 2% change
    
    res.json({
      totalPoints,
      pointsChange,
      totalWatchtime,
      watchtimeChange,
      winRate: Math.round(winRate),
      winRateChange,
      activeChannels,
      totalChannels: channels.length
    });
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}
