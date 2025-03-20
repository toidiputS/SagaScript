import { pgTable, text, serial, integer, boolean, jsonb, timestamp, uniqueIndex, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  plan: text("plan").notNull().default("apprentice"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
});

// Series
export const series = pgTable("series", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  totalBooks: integer("total_books").notNull().default(1),
  currentBook: integer("current_book").notNull().default(1),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSeriesSchema = createInsertSchema(series).pick({
  userId: true,
  title: true,
  description: true,
  totalBooks: true,
  currentBook: true,
  coverImage: true,
});

// Books
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  seriesId: integer("series_id").notNull().references(() => series.id),
  title: text("title").notNull(),
  description: text("description"),
  position: integer("position").notNull().default(1),
  wordCount: integer("word_count").notNull().default(0),
  status: text("status").notNull().default("in_progress"),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBookSchema = createInsertSchema(books).pick({
  seriesId: true,
  title: true,
  description: true,
  position: true,
  wordCount: true,
  status: true,
  coverImage: true,
});

// Chapters
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => books.id),
  title: text("title").notNull(),
  content: text("content"),
  position: integer("position").notNull().default(1),
  wordCount: integer("word_count").notNull().default(0),
  status: text("status").notNull().default("in_progress"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertChapterSchema = createInsertSchema(chapters).pick({
  bookId: true,
  title: true,
  content: true,
  position: true,
  wordCount: true,
  status: true,
});

// Characters
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  seriesId: integer("series_id").notNull().references(() => series.id),
  name: text("name").notNull(),
  role: text("role"),
  age: text("age"),
  occupation: text("occupation"),
  status: text("status"),
  description: text("description"),
  appearance: text("appearance"),
  personality: text("personality"),
  goals: text("goals"),
  backstory: text("backstory"),
  bookAppearances: jsonb("book_appearances").notNull().default([]),
  isProtagonist: boolean("is_protagonist").notNull().default(false),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCharacterSchema = createInsertSchema(characters).pick({
  seriesId: true,
  name: true,
  role: true,
  age: true,
  occupation: true,
  status: true,
  description: true,
  appearance: true,
  personality: true,
  goals: true,
  backstory: true,
  bookAppearances: true,
  isProtagonist: true,
  avatar: true,
});

// Character Relationships
export const characterRelationships = pgTable("character_relationships", {
  id: serial("id").primaryKey(),
  sourceCharacterId: integer("source_character_id").notNull().references(() => characters.id),
  targetCharacterId: integer("target_character_id").notNull().references(() => characters.id),
  relationshipType: text("relationship_type").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCharacterRelationshipSchema = createInsertSchema(characterRelationships).pick({
  sourceCharacterId: true,
  targetCharacterId: true,
  relationshipType: true,
  description: true,
});

// Locations
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  seriesId: integer("series_id").notNull().references(() => series.id),
  name: text("name").notNull(),
  locationType: text("location_type"),
  description: text("description"),
  importance: text("importance").default("secondary"),
  mapCoordinates: jsonb("map_coordinates"),
  bookAppearances: jsonb("book_appearances").notNull().default([]),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  seriesId: true,
  name: true,
  locationType: true,
  description: true,
  importance: true,
  mapCoordinates: true,
  bookAppearances: true,
  image: true,
});

// Writing Stats
export const writingStats = pgTable("writing_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  wordsWritten: integer("words_written").notNull().default(0),
  minutesActive: integer("minutes_active").notNull().default(0),
  bookId: integer("book_id").references(() => books.id),
  chapterId: integer("chapter_id").references(() => chapters.id),
});

export const insertWritingStatSchema = createInsertSchema(writingStats).pick({
  userId: true,
  date: true,
  wordsWritten: true,
  minutesActive: true,
  bookId: true,
  chapterId: true,
});

// Achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  icon: text("icon").notNull(),
  requiredValue: integer("required_value").notNull(),
  category: text("category").notNull().default("general"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  name: true,
  description: true,
  type: true,
  icon: true,
  requiredValue: true,
  category: true,
});

// User Achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementId: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Series = typeof series.$inferSelect;
export type InsertSeries = z.infer<typeof insertSeriesSchema>;

export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type CharacterRelationship = typeof characterRelationships.$inferSelect;
export type InsertCharacterRelationship = z.infer<typeof insertCharacterRelationshipSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type WritingStat = typeof writingStats.$inferSelect;
export type InsertWritingStat = z.infer<typeof insertWritingStatSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

// Subscription Plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in cents
  billingInterval: text("billing_interval").notNull(), // monthly, yearly
  features: jsonb("features").notNull().default([]),
  limits: jsonb("limits").notNull().default({}), // JSON containing limits for various features
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).pick({
  name: true,
  description: true,
  price: true,
  billingInterval: true,
  features: true,
  limits: true,
});

// User Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: text("status").notNull().default("active"), // active, canceled, past_due
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  paymentMethod: text("payment_method"),
  paymentProviderCustomerId: text("payment_provider_customer_id"),
  paymentProviderSubscriptionId: text("payment_provider_subscription_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  planId: true,
  status: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
  cancelAtPeriodEnd: true,
  paymentMethod: true,
  paymentProviderCustomerId: true,
  paymentProviderSubscriptionId: true,
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Timeline Events
export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  seriesId: integer("series_id").notNull().references(() => series.id),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull().default("plot"), // plot, character, world
  date: text("date"), // Text to allow flexible date formats like "Year 1242" or "Day 3"
  bookId: integer("book_id").references(() => books.id),
  chapterId: integer("chapter_id").references(() => chapters.id),
  characterIds: jsonb("character_ids").notNull().default([]), // Array of character IDs involved
  locationId: integer("location_id").references(() => locations.id),
  importance: text("importance").notNull().default("medium"), // major, medium, minor
  color: text("color"), // For visual distinction
  position: integer("position").notNull().default(0), // For manual ordering
  isPlotPoint: boolean("is_plot_point").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).pick({
  seriesId: true,
  title: true,
  description: true,
  eventType: true,
  date: true,
  bookId: true,
  chapterId: true,
  characterIds: true,
  locationId: true,
  importance: true,
  color: true,
  position: true,
  isPlotPoint: true,
});

export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
