import { pgTable, text, serial, integer, boolean, jsonb, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  plan: text("plan").notNull().default("free"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  name: true,
  description: true,
  type: true,
  icon: true,
  requiredValue: true,
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

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
