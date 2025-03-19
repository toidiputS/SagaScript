import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  tier: text("tier").default("apprentice").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
});

// Series model
export const series = pgTable("series", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  genre: text("genre"),
  booksPlanned: integer("books_planned").default(1),
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSeriesSchema = createInsertSchema(series).pick({
  userId: true,
  title: true,
  description: true,
  genre: true,
  booksPlanned: true,
});

// Book model
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  seriesId: integer("series_id").notNull().references(() => series.id),
  title: text("title").notNull(),
  position: integer("position").notNull(), // For ordering in the series
  wordCount: integer("word_count").default(0),
  status: text("status").default("draft").notNull(), // draft, revision, final
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastEdited: timestamp("last_edited").defaultNow().notNull(),
});

export const insertBookSchema = createInsertSchema(books).pick({
  seriesId: true,
  title: true,
  position: true,
  status: true,
});

// Character model
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  seriesId: integer("series_id").notNull().references(() => series.id),
  name: text("name").notNull(),
  role: text("role").default("supporting"), // protagonist, antagonist, supporting
  occupation: text("occupation"),
  description: text("description"),
  background: text("background"),
  attributes: jsonb("attributes").default({}), // Flexible attributes
  arcs: integer("arcs").default(0),
  bookAppearances: text("book_appearances").array(), // Which books they appear in
  completeness: integer("completeness").default(0), // 0-100%
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCharacterSchema = createInsertSchema(characters).pick({
  userId: true,
  seriesId: true,
  name: true,
  role: true,
  occupation: true,
  description: true,
  background: true,
  bookAppearances: true,
});

// Location model
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  seriesId: integer("series_id").notNull().references(() => series.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type"), // city, forest, building, etc.
  bookAppearances: text("book_appearances").array(),
  keyScenes: integer("key_scenes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  userId: true,
  seriesId: true,
  name: true,
  description: true,
  type: true,
  bookAppearances: true,
});

// Timeline event model
export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  seriesId: integer("series_id").notNull().references(() => series.id),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date"), // Could be a real date or a fictional one
  characters: integer("characters").array(), // Character IDs involved
  locations: integer("locations").array(), // Location IDs involved
  bookId: integer("book_id").references(() => books.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).pick({
  userId: true,
  seriesId: true,
  title: true,
  description: true,
  date: true,
  characters: true,
  locations: true,
  bookId: true,
});

// Writing session model
export const writingSessions = pgTable("writing_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bookId: integer("book_id").references(() => books.id),
  seriesId: integer("series_id").references(() => series.id),
  wordCount: integer("word_count").notNull(),
  duration: integer("duration"), // in minutes
  date: timestamp("date").defaultNow().notNull(),
});

export const insertWritingSessionSchema = createInsertSchema(writingSessions).pick({
  userId: true,
  bookId: true,
  seriesId: true,
  wordCount: true,
  duration: true,
});

// Achievement model
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // streak, word_count, character_creation, etc.
  value: integer("value").notNull(), // The value achieved
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  userId: true,
  type: true,
  value: true,
});

// Define export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Series = typeof series.$inferSelect;
export type InsertSeries = z.infer<typeof insertSeriesSchema>;

export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;

export type WritingSession = typeof writingSessions.$inferSelect;
export type InsertWritingSession = z.infer<typeof insertWritingSessionSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
