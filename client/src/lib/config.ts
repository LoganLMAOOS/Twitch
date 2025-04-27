export const config = {
  // Twitch API config
  twitchClientId: import.meta.env.VITE_TWITCH_CLIENT_ID || '',
  
  // App config
  appName: 'TwitchFarm',
  apiEndpoint: '/api',
  
  // Dashboard settings
  defaultRiskLevel: 'balanced',
  defaultMaxPoints: 2500,
  
  // Points farming config
  defaultPointsInterval: 5 * 60 * 1000, // 5 minutes
  defaultWatchtimeInterval: 60 * 1000, // 1 minute
  
  // Prediction settings
  predictionFactors: [
    { id: 'chatSentiment', label: 'Chat sentiment analysis' },
    { id: 'historicalOutcomes', label: 'Historical outcomes' },
    { id: 'streamerPerformance', label: 'Streamer performance trends' },
    { id: 'globalPatterns', label: 'Global voting patterns' },
  ],
  
  riskLevelOptions: [
    { value: 'conservative', label: 'Conservative (lower risk)' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'aggressive', label: 'Aggressive (higher risk)' },
  ],
  
  // UI settings
  mobileBreakpoint: 768,
  
  // Activity types
  activityTypes: {
    POINTS_COLLECTED: 'points',
    PREDICTION_MADE: 'prediction',
    PREDICTION_WON: 'prediction_won',
    PREDICTION_LOST: 'prediction_lost',
    WATCHTIME_UPDATED: 'watchtime',
    CHANNEL_ADDED: 'channel',
    CHANNEL_REMOVED: 'channel',
  },
};

export default config;
