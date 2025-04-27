import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  twitchId: text("twitch_id"),
  twitchUsername: text("twitch_username"),
  twitchToken: text("twitch_token"),
  twitchRefreshToken: text("twitch_refresh_token"),
  twitchTokenExpiry: timestamp("twitch_token_expiry"),
});

export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  channelId: text("channel_id").notNull(),
  channelName: text("channel_name").notNull(),
  autoFarming: boolean("auto_farming").default(true),
  autoWatchtime: boolean("auto_watchtime").default(true),
  autoPredictions: boolean("auto_predictions").default(true),
  totalPoints: integer("total_points").default(0),
  totalWatchtime: integer("total_watchtime").default(0), // in minutes
  predictionsWon: integer("predictions_won").default(0),
  predictionsLost: integer("predictions_lost").default(0),
  lastPointsUpdate: timestamp("last_points_update"),
  lastWatchtimeUpdate: timestamp("last_watchtime_update"),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  channelId: text("channel_id").notNull(),
  predictionId: text("prediction_id").notNull(),
  title: text("title").notNull(),
  outcome: text("outcome"),
  points: integer("points").notNull(),
  chosenOption: text("chosen_option").notNull(),
  result: text("result"), // "won", "lost", "pending"
  pointsWon: integer("points_won").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  channelId: text("channel_id"),
  channelName: text("channel_name"),
  type: text("type").notNull(), // "points", "prediction", "watchtime"
  description: text("description").notNull(),
  points: integer("points"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  riskLevel: text("risk_level").default("balanced"),
  maxPointsPerPrediction: integer("max_points_per_prediction").default(2500),
  useChatSentiment: boolean("use_chat_sentiment").default(true),
  useHistoricalOutcomes: boolean("use_historical_outcomes").default(true),
  useStreamerPerformance: boolean("use_streamer_performance").default(true),
  useGlobalPatterns: boolean("use_global_patterns").default(false),
  notificationsEnabled: boolean("notifications_enabled").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChannelSchema = createInsertSchema(channels).pick({
  userId: true,
  channelId: true,
  channelName: true,
  autoFarming: true,
  autoWatchtime: true,
  autoPredictions: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).pick({
  userId: true,
  channelId: true,
  predictionId: true,
  title: true,
  points: true,
  chosenOption: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  channelId: true,
  channelName: true,
  type: true,
  description: true,
  points: true,
  metadata: true,
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  riskLevel: true,
  maxPointsPerPrediction: true,
  useChatSentiment: true,
  useHistoricalOutcomes: true,
  useStreamerPerformance: true,
  useGlobalPatterns: true,
  notificationsEnabled: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;

export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictions.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// Auth schemas
export const twitchAuthSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export const channelStatsSchema = z.object({
  channelId: z.string(),
});

export const toggleSettingSchema = z.object({
  channelId: z.string(),
  setting: z.enum(["autoFarming", "autoWatchtime", "autoPredictions"]),
  value: z.boolean(),
});

export const updateSettingsSchema = insertSettingsSchema.omit({ userId: true });
