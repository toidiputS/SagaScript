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
  plan: true,
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

// =========== COLLABORATION FEATURES ===========

// Shared Projects (collaborative series)
export const collaborativeSeries = pgTable("collaborative_series", {
  id: serial("id").primaryKey(),
  seriesId: integer("series_id").notNull().references(() => series.id),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(false),
  collaborationSettings: jsonb("collaboration_settings").notNull().default({
    allowEditContent: false,
    allowAddCharacters: false,
    allowEditCharacters: false, 
    allowAddLocations: false,
    allowEditLocations: false,
    allowAddBooks: false,
    allowEditBooks: false,
    allowComments: true,
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCollaborativeSeriesSchema = createInsertSchema(collaborativeSeries).pick({
  seriesId: true,
  ownerId: true,
  name: true,
  description: true,
  isPublic: true,
  collaborationSettings: true,
});

// Collaborators (users who can access shared projects)
export const collaborators = pgTable("collaborators", {
  id: serial("id").primaryKey(),
  collaborativeSeriesId: integer("collaborative_series_id").notNull().references(() => collaborativeSeries.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("viewer"), // owner, editor, contributor, viewer
  permissions: jsonb("permissions").notNull().default({}),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCollaboratorSchema = createInsertSchema(collaborators).pick({
  collaborativeSeriesId: true,
  userId: true,
  role: true,
  permissions: true,
});

// Collaboration Invites
export const collaborationInvites = pgTable("collaboration_invites", {
  id: serial("id").primaryKey(),
  collaborativeSeriesId: integer("collaborative_series_id").notNull().references(() => collaborativeSeries.id),
  inviterId: integer("inviter_id").notNull().references(() => users.id),
  inviteeEmail: text("invitee_email").notNull(),
  inviteeId: integer("invitee_id").references(() => users.id),
  role: text("role").notNull().default("viewer"),
  status: text("status").notNull().default("pending"), // pending, accepted, declined, expired
  inviteCode: text("invite_code").notNull(),
  expiresAt: timestamp("expires_at"),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCollaborationInviteSchema = createInsertSchema(collaborationInvites).pick({
  collaborativeSeriesId: true,
  inviterId: true,
  inviteeEmail: true,
  inviteeId: true,
  role: true,
  status: true,
  inviteCode: true,
  expiresAt: true,
  message: true,
});

// Comments on various content
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  
  // Optional references to different content types
  // Only one of these should be set for any given comment
  bookId: integer("book_id").references(() => books.id),
  chapterId: integer("chapter_id").references(() => chapters.id),
  characterId: integer("character_id").references(() => characters.id),
  locationId: integer("location_id").references(() => locations.id),
  timelineEventId: integer("timeline_event_id").references(() => timelineEvents.id),
  
  // For nested comments/replies (using a text field to avoid circular references)
  parentCommentId: integer("parent_comment_id"),
  
  // Range selection for text-based comments (e.g., in chapter content)
  selectionStart: integer("selection_start"),
  selectionEnd: integer("selection_end"),
  
  status: text("status").notNull().default("active"), // active, resolved, deleted
  isEdited: boolean("is_edited").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  userId: true,
  content: true,
  bookId: true,
  chapterId: true,
  characterId: true,
  locationId: true,
  timelineEventId: true,
  parentCommentId: true,
  selectionStart: true,
  selectionEnd: true,
  status: true,
});

// Feedback requests
export const feedbackRequests = pgTable("feedback_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  
  // Optional references to different content types
  // Only one of these should be set for any given feedback request
  bookId: integer("book_id").references(() => books.id),
  chapterId: integer("chapter_id").references(() => chapters.id),
  
  feedbackType: text("feedback_type").notNull().default("general"), // general, plot, characters, style, etc.
  status: text("status").notNull().default("open"), // open, closed
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const insertFeedbackRequestSchema = createInsertSchema(feedbackRequests).pick({
  userId: true,
  title: true,
  description: true,
  bookId: true,
  chapterId: true,
  feedbackType: true,
  status: true,
  isAnonymous: true,
  isPublic: true,
});

// Feedback responses
export const feedbackResponses = pgTable("feedback_responses", {
  id: serial("id").primaryKey(),
  feedbackRequestId: integer("feedback_request_id").notNull().references(() => feedbackRequests.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  rating: integer("rating"), // Optional rating (e.g., 1-5)
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFeedbackResponseSchema = createInsertSchema(feedbackResponses).pick({
  feedbackRequestId: true,
  userId: true,
  content: true,
  rating: true,
  isAnonymous: true,
});

// Export types for collaboration features
export type CollaborativeSeries = typeof collaborativeSeries.$inferSelect;
export type InsertCollaborativeSeries = z.infer<typeof insertCollaborativeSeriesSchema>;

export type Collaborator = typeof collaborators.$inferSelect;
export type InsertCollaborator = z.infer<typeof insertCollaboratorSchema>;

export type CollaborationInvite = typeof collaborationInvites.$inferSelect;
export type InsertCollaborationInvite = z.infer<typeof insertCollaborationInviteSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type FeedbackRequest = typeof feedbackRequests.$inferSelect;
export type InsertFeedbackRequest = z.infer<typeof insertFeedbackRequestSchema>;

export type FeedbackResponse = typeof feedbackResponses.$inferSelect;
export type InsertFeedbackResponse = z.infer<typeof insertFeedbackResponseSchema>;

// =========== MICRO REWARD SYSTEM ===========

// Reward types
export const rewardTypes = pgTable("reward_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // daily, word-count, streak, completion, etc.
  icon: text("icon").notNull(),
  color: text("color").notNull().default("#4F46E5"), // Default to indigo
  points: integer("points").notNull().default(10),
  rarity: text("rarity").notNull().default("common"), // common, uncommon, rare, epic, legendary
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRewardTypeSchema = createInsertSchema(rewardTypes).pick({
  name: true,
  description: true,
  category: true,
  icon: true,
  color: true,
  points: true,
  rarity: true,
  isActive: true,
});

// Writing milestones
export const writingMilestones = pgTable("writing_milestones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  milestoneType: text("milestone_type").notNull(), // wordCount, streakDays, chaptersCompleted, booksCompleted, etc.
  targetValue: integer("target_value").notNull(),
  rewardTypeId: integer("reward_type_id").notNull().references(() => rewardTypes.id),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringPeriod: text("recurring_period"), // daily, weekly, monthly, etc. (if isRecurring is true)
  isGlobal: boolean("is_global").notNull().default(true), // false for user-defined custom milestones
  tier: text("tier").notNull().default("apprentice"), // Minimum subscription tier required
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWritingMilestoneSchema = createInsertSchema(writingMilestones).pick({
  name: true,
  description: true,
  milestoneType: true,
  targetValue: true, 
  rewardTypeId: true,
  isRecurring: true,
  recurringPeriod: true,
  isGlobal: true,
  tier: true,
});

// User rewards
export const userRewards = pgTable("user_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  rewardTypeId: integer("reward_type_id").notNull().references(() => rewardTypes.id),
  milestoneId: integer("milestone_id").references(() => writingMilestones.id),
  
  // Related content that earned the reward (optional)
  seriesId: integer("series_id").references(() => series.id),
  bookId: integer("book_id").references(() => books.id),
  chapterId: integer("chapter_id").references(() => chapters.id),
  
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
  isRedeemed: boolean("is_redeemed").notNull().default(false),
  redeemedAt: timestamp("redeemed_at"),
  pointsAwarded: integer("points_awarded").notNull().default(0),
  note: text("note"), // Optional context for the reward
});

export const insertUserRewardSchema = createInsertSchema(userRewards).pick({
  userId: true,
  rewardTypeId: true,
  milestoneId: true,
  seriesId: true,
  bookId: true,
  chapterId: true,
  earnedAt: true,
  isRedeemed: true,
  redeemedAt: true,
  pointsAwarded: true,
  note: true,
});

// Writing streaks
export const writingStreaks = pgTable("writing_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastWritingDay: date("last_writing_day"),
  streakStartDate: date("streak_start_date"),
  totalWritingDays: integer("total_writing_days").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWritingStreakSchema = createInsertSchema(writingStreaks).pick({
  userId: true,
  currentStreak: true,
  longestStreak: true,
  lastWritingDay: true,
  streakStartDate: true,
  totalWritingDays: true,
});

// Writing goals
export const writingGoals = pgTable("writing_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  goalType: text("goal_type").notNull(), // wordCount, chaptersCompleted, streakDays, etc.
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").notNull().default(0),
  deadline: timestamp("deadline"),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringPeriod: text("recurring_period"), // daily, weekly, monthly, etc.
  
  // Optional related content
  seriesId: integer("series_id").references(() => series.id),
  bookId: integer("book_id").references(() => books.id),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWritingGoalSchema = createInsertSchema(writingGoals).pick({
  userId: true,
  title: true,
  goalType: true,
  targetValue: true,
  currentValue: true,
  deadline: true,
  isCompleted: true,
  completedAt: true,
  isRecurring: true,
  recurringPeriod: true,
  seriesId: true,
  bookId: true,
});

// User points ledger (tracks point transactions)
export const pointLedger = pgTable("point_ledger", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  points: integer("points").notNull(),
  transactionType: text("transaction_type").notNull(), // earned, spent, expired, bonus
  description: text("description").notNull(),
  
  // References to related entities
  rewardId: integer("reward_id").references(() => userRewards.id),
  milestoneId: integer("milestone_id").references(() => writingMilestones.id),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPointLedgerSchema = createInsertSchema(pointLedger).pick({
  userId: true,
  points: true,
  transactionType: true,
  description: true,
  rewardId: true,
  milestoneId: true,
});

// Export types for micro rewards system
export type RewardType = typeof rewardTypes.$inferSelect;
export type InsertRewardType = z.infer<typeof insertRewardTypeSchema>;

export type WritingMilestone = typeof writingMilestones.$inferSelect;
export type InsertWritingMilestone = z.infer<typeof insertWritingMilestoneSchema>;

export type UserReward = typeof userRewards.$inferSelect;
export type InsertUserReward = z.infer<typeof insertUserRewardSchema>;

export type WritingStreak = typeof writingStreaks.$inferSelect;
export type InsertWritingStreak = z.infer<typeof insertWritingStreakSchema>;

export type WritingGoal = typeof writingGoals.$inferSelect;
export type InsertWritingGoal = z.infer<typeof insertWritingGoalSchema>;

export type PointLedgerEntry = typeof pointLedger.$inferSelect;
export type InsertPointLedgerEntry = z.infer<typeof insertPointLedgerSchema>;

// =========== MULTIMEDIA CONTENT ===========

// Mood boards (visual collections for inspiration)
export const moodBoards = pgTable("mood_boards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  seriesId: integer("series_id").references(() => series.id),
  bookId: integer("book_id").references(() => books.id),
  chapterId: integer("chapter_id").references(() => chapters.id),
  characterId: integer("character_id").references(() => characters.id),
  locationId: integer("location_id").references(() => locations.id),
  title: text("title").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMoodBoardSchema = createInsertSchema(moodBoards).pick({
  userId: true,
  seriesId: true,
  bookId: true,
  chapterId: true,
  characterId: true,
  locationId: true,
  title: true,
  description: true,
  isPublic: true,
});

export type MoodBoard = typeof moodBoards.$inferSelect;
export type InsertMoodBoard = z.infer<typeof insertMoodBoardSchema>;

// Mood board items (individual images in a mood board)
export const moodBoardItems = pgTable("mood_board_items", {
  id: serial("id").primaryKey(),
  moodBoardId: integer("mood_board_id").notNull().references(() => moodBoards.id),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  source: text("source"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMoodBoardItemSchema = createInsertSchema(moodBoardItems).pick({
  moodBoardId: true,
  imageUrl: true,
  caption: true,
  source: true,
  position: true,
});

export type MoodBoardItem = typeof moodBoardItems.$inferSelect;
export type InsertMoodBoardItem = z.infer<typeof insertMoodBoardItemSchema>;

// Voice memos (audio recordings for notes, ideas, etc.)
export const voiceMemos = pgTable("voice_memos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  seriesId: integer("series_id").references(() => series.id),
  bookId: integer("book_id").references(() => books.id),
  chapterId: integer("chapter_id").references(() => chapters.id),
  title: text("title").notNull(),
  audioUrl: text("audio_url").notNull(),
  duration: integer("duration").notNull(), // Duration in seconds
  transcription: text("transcription"), // Optional text transcription
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVoiceMemoSchema = createInsertSchema(voiceMemos).pick({
  userId: true,
  seriesId: true,
  bookId: true,
  chapterId: true,
  title: true,
  audioUrl: true,
  duration: true,
  transcription: true,
});

export type VoiceMemo = typeof voiceMemos.$inferSelect;
export type InsertVoiceMemo = z.infer<typeof insertVoiceMemoSchema>;
