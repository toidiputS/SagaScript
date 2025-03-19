import {
  users, type User, type InsertUser,
  series, type Series, type InsertSeries,
  books, type Book, type InsertBook,
  characters, type Character, type InsertCharacter,
  locations, type Location, type InsertLocation,
  timelineEvents, type TimelineEvent, type InsertTimelineEvent,
  writingSessions, type WritingSession, type InsertWritingSession,
  achievements, type Achievement, type InsertAchievement
} from "@shared/schema";
import { createHash } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Series operations
  getSeries(id: number): Promise<Series | undefined>;
  getAllSeriesByUser(userId: number): Promise<Series[]>;
  createSeries(series: InsertSeries): Promise<Series>;
  updateSeries(id: number, series: Partial<Series>): Promise<Series | undefined>;
  deleteSeries(id: number): Promise<boolean>;
  
  // Book operations
  getBook(id: number): Promise<Book | undefined>;
  getBooksBySeriesId(seriesId: number): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<Book>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  
  // Character operations
  getCharacter(id: number): Promise<Character | undefined>;
  getCharactersBySeriesId(seriesId: number): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: Partial<Character>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;
  
  // Location operations
  getLocation(id: number): Promise<Location | undefined>;
  getLocationsBySeriesId(seriesId: number): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<Location>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  
  // Timeline event operations
  getTimelineEvent(id: number): Promise<TimelineEvent | undefined>;
  getTimelineEventsBySeriesId(seriesId: number): Promise<TimelineEvent[]>;
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;
  updateTimelineEvent(id: number, event: Partial<TimelineEvent>): Promise<TimelineEvent | undefined>;
  deleteTimelineEvent(id: number): Promise<boolean>;
  
  // Writing session operations
  getWritingSession(id: number): Promise<WritingSession | undefined>;
  getWritingSessionsByUserId(userId: number): Promise<WritingSession[]>;
  getWritingSessionsByBookId(bookId: number): Promise<WritingSession[]>;
  getWritingSessionsBySeriesId(seriesId: number): Promise<WritingSession[]>;
  createWritingSession(session: InsertWritingSession): Promise<WritingSession>;
  
  // Achievement operations
  getAchievementsByUserId(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // Stats operations
  getUserStats(userId: number): Promise<{
    totalWordCount: number;
    charactersCreated: number;
    achievementsCount: number;
    currentStreak: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private series: Map<number, Series>;
  private books: Map<number, Book>;
  private characters: Map<number, Character>;
  private locations: Map<number, Location>;
  private timelineEvents: Map<number, TimelineEvent>;
  private writingSessions: Map<number, WritingSession>;
  private achievements: Map<number, Achievement>;
  
  private userIdCounter: number;
  private seriesIdCounter: number;
  private bookIdCounter: number;
  private characterIdCounter: number;
  private locationIdCounter: number;
  private timelineEventIdCounter: number;
  private writingSessionIdCounter: number;
  private achievementIdCounter: number;

  constructor() {
    this.users = new Map();
    this.series = new Map();
    this.books = new Map();
    this.characters = new Map();
    this.locations = new Map();
    this.timelineEvents = new Map();
    this.writingSessions = new Map();
    this.achievements = new Map();
    
    this.userIdCounter = 1;
    this.seriesIdCounter = 1;
    this.bookIdCounter = 1;
    this.characterIdCounter = 1;
    this.locationIdCounter = 1;
    this.timelineEventIdCounter = 1;
    this.writingSessionIdCounter = 1;
    this.achievementIdCounter = 1;
  }

  // Helper method to hash passwords
  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(data: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const hashedPassword = this.hashPassword(data.password);
    const now = new Date();
    
    const user: User = {
      id,
      username: data.username,
      password: hashedPassword,
      email: data.email,
      displayName: data.displayName || data.username,
      avatar: null,
      tier: "apprentice",
      createdAt: now,
    };
    
    this.users.set(id, user);
    return user;
  }

  // Series operations
  async getSeries(id: number): Promise<Series | undefined> {
    return this.series.get(id);
  }

  async getAllSeriesByUser(userId: number): Promise<Series[]> {
    return Array.from(this.series.values()).filter(
      (series) => series.userId === userId,
    );
  }

  async createSeries(data: InsertSeries): Promise<Series> {
    const id = this.seriesIdCounter++;
    const now = new Date();
    
    const newSeries: Series = {
      id,
      userId: data.userId,
      title: data.title,
      description: data.description || null,
      genre: data.genre || null,
      booksPlanned: data.booksPlanned || 1,
      progress: 0,
      createdAt: now,
    };
    
    this.series.set(id, newSeries);
    return newSeries;
  }

  async updateSeries(id: number, data: Partial<Series>): Promise<Series | undefined> {
    const existing = this.series.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...data };
    this.series.set(id, updated);
    return updated;
  }

  async deleteSeries(id: number): Promise<boolean> {
    // Delete all related books, characters, locations, timeline events
    const relatedBooks = Array.from(this.books.values()).filter(book => book.seriesId === id);
    for (const book of relatedBooks) {
      await this.deleteBook(book.id);
    }
    
    Array.from(this.characters.values())
      .filter(char => char.seriesId === id)
      .forEach(char => this.characters.delete(char.id));
      
    Array.from(this.locations.values())
      .filter(loc => loc.seriesId === id)
      .forEach(loc => this.locations.delete(loc.id));
      
    Array.from(this.timelineEvents.values())
      .filter(event => event.seriesId === id)
      .forEach(event => this.timelineEvents.delete(event.id));
    
    return this.series.delete(id);
  }

  // Book operations
  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBooksBySeriesId(seriesId: number): Promise<Book[]> {
    return Array.from(this.books.values())
      .filter(book => book.seriesId === seriesId)
      .sort((a, b) => a.position - b.position);
  }

  async createBook(data: InsertBook): Promise<Book> {
    const id = this.bookIdCounter++;
    const now = new Date();
    
    const newBook: Book = {
      id,
      seriesId: data.seriesId,
      title: data.title,
      position: data.position,
      wordCount: 0,
      status: data.status || "draft",
      progress: 0,
      createdAt: now,
      lastEdited: now,
    };
    
    this.books.set(id, newBook);
    
    // Update series progress
    this.updateSeriesProgress(data.seriesId);
    
    return newBook;
  }

  async updateBook(id: number, data: Partial<Book>): Promise<Book | undefined> {
    const existing = this.books.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...data,
      lastEdited: new Date() 
    };
    
    this.books.set(id, updated);
    
    // Update series progress if needed
    if (data.progress !== undefined) {
      this.updateSeriesProgress(existing.seriesId);
    }
    
    return updated;
  }

  async deleteBook(id: number): Promise<boolean> {
    const book = this.books.get(id);
    if (!book) return false;
    
    const seriesId = book.seriesId;
    const result = this.books.delete(id);
    
    // Update positions of other books in the series
    const seriesBooks = await this.getBooksBySeriesId(seriesId);
    let position = 1;
    for (const book of seriesBooks) {
      if (book.position !== position) {
        await this.updateBook(book.id, { position });
      }
      position++;
    }
    
    // Update series progress
    this.updateSeriesProgress(seriesId);
    
    return result;
  }

  // Helper to update series progress based on books
  private async updateSeriesProgress(seriesId: number): Promise<void> {
    const seriesBooks = await this.getBooksBySeriesId(seriesId);
    const series = await this.getSeries(seriesId);
    
    if (!series) return;
    
    if (seriesBooks.length === 0) {
      await this.updateSeries(seriesId, { progress: 0 });
      return;
    }
    
    const totalProgress = seriesBooks.reduce((sum, book) => sum + (book.progress ?? 0), 0);
    const avgProgress = Math.round(totalProgress / seriesBooks.length);
    
    await this.updateSeries(seriesId, { progress: avgProgress });
  }

  // Character operations
  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async getCharactersBySeriesId(seriesId: number): Promise<Character[]> {
    return Array.from(this.characters.values()).filter(
      (character) => character.seriesId === seriesId,
    );
  }

  async createCharacter(data: InsertCharacter): Promise<Character> {
    const id = this.characterIdCounter++;
    const now = new Date();
    
    const newCharacter: Character = {
      id,
      userId: data.userId,
      seriesId: data.seriesId,
      name: data.name,
      role: data.role || "supporting",
      occupation: data.occupation || null,
      description: data.description || null,
      background: data.background || null,
      attributes: {},
      arcs: 0,
      bookAppearances: data.bookAppearances || [],
      completeness: 0,
      createdAt: now,
    };
    
    this.characters.set(id, newCharacter);
    return newCharacter;
  }

  async updateCharacter(id: number, data: Partial<Character>): Promise<Character | undefined> {
    const existing = this.characters.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...data };
    this.characters.set(id, updated);
    return updated;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    return this.characters.delete(id);
  }

  // Location operations
  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getLocationsBySeriesId(seriesId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.seriesId === seriesId,
    );
  }

  async createLocation(data: InsertLocation): Promise<Location> {
    const id = this.locationIdCounter++;
    const now = new Date();
    
    const newLocation: Location = {
      id,
      userId: data.userId,
      seriesId: data.seriesId,
      name: data.name,
      description: data.description || null,
      type: data.type || null,
      bookAppearances: data.bookAppearances || [],
      keyScenes: 0,
      createdAt: now,
    };
    
    this.locations.set(id, newLocation);
    return newLocation;
  }

  async updateLocation(id: number, data: Partial<Location>): Promise<Location | undefined> {
    const existing = this.locations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...data };
    this.locations.set(id, updated);
    return updated;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }

  // Timeline event operations
  async getTimelineEvent(id: number): Promise<TimelineEvent | undefined> {
    return this.timelineEvents.get(id);
  }

  async getTimelineEventsBySeriesId(seriesId: number): Promise<TimelineEvent[]> {
    return Array.from(this.timelineEvents.values()).filter(
      (event) => event.seriesId === seriesId,
    );
  }

  async createTimelineEvent(data: InsertTimelineEvent): Promise<TimelineEvent> {
    const id = this.timelineEventIdCounter++;
    const now = new Date();
    
    const newEvent: TimelineEvent = {
      id,
      userId: data.userId,
      seriesId: data.seriesId,
      title: data.title,
      description: data.description || null,
      date: data.date || null,
      characters: data.characters || [],
      locations: data.locations || [],
      bookId: data.bookId || null,
      createdAt: now,
    };
    
    this.timelineEvents.set(id, newEvent);
    return newEvent;
  }

  async updateTimelineEvent(id: number, data: Partial<TimelineEvent>): Promise<TimelineEvent | undefined> {
    const existing = this.timelineEvents.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...data };
    this.timelineEvents.set(id, updated);
    return updated;
  }

  async deleteTimelineEvent(id: number): Promise<boolean> {
    return this.timelineEvents.delete(id);
  }

  // Writing session operations
  async getWritingSession(id: number): Promise<WritingSession | undefined> {
    return this.writingSessions.get(id);
  }

  async getWritingSessionsByUserId(userId: number): Promise<WritingSession[]> {
    return Array.from(this.writingSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getWritingSessionsByBookId(bookId: number): Promise<WritingSession[]> {
    return Array.from(this.writingSessions.values())
      .filter(session => session.bookId === bookId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getWritingSessionsBySeriesId(seriesId: number): Promise<WritingSession[]> {
    return Array.from(this.writingSessions.values())
      .filter(session => session.seriesId === seriesId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async createWritingSession(data: InsertWritingSession): Promise<WritingSession> {
    const id = this.writingSessionIdCounter++;
    const now = new Date();
    
    const newSession: WritingSession = {
      id,
      userId: data.userId,
      bookId: data.bookId || null,
      seriesId: data.seriesId || null,
      wordCount: data.wordCount,
      duration: data.duration || null,
      date: now,
    };
    
    this.writingSessions.set(id, newSession);
    
    // Update book word count if bookId is provided
    if (data.bookId) {
      const book = await this.getBook(data.bookId);
      if (book) {
        const updatedWordCount = (book.wordCount ?? 0) + data.wordCount;
        // Calculate progress based on word count (assuming 80,000 words is 100%)
        const targetWordCount = 80000;
        const progress = Math.min(Math.floor((updatedWordCount / targetWordCount) * 100), 100);
        
        await this.updateBook(book.id, { 
          wordCount: updatedWordCount,
          progress
        });
      }
    }
    
    // Check and update streak achievement
    await this.updateWritingStreak(data.userId);
    
    return newSession;
  }

  // Achievement operations
  async getAchievementsByUserId(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.userId === userId)
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  }

  async createAchievement(data: InsertAchievement): Promise<Achievement> {
    const id = this.achievementIdCounter++;
    const now = new Date();
    
    const newAchievement: Achievement = {
      id,
      userId: data.userId,
      type: data.type,
      value: data.value,
      unlockedAt: now,
    };
    
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  // Helper to update writing streak
  private async updateWritingStreak(userId: number): Promise<void> {
    const sessions = await this.getWritingSessionsByUserId(userId);
    if (sessions.length === 0) return;
    
    // Sort sessions by date
    sessions.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate streak
    let currentStreak = 1;
    let maxStreak = 1;
    
    for (let i = 1; i < sessions.length; i++) {
      const prevDate = new Date(sessions[i-1].date);
      const currDate = new Date(sessions[i].date);
      
      // Set hours to 0 to compare just the dates
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      
      // Calculate difference in days
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    
    // Check if streak achievement exists
    const streakAchievements = (await this.getAchievementsByUserId(userId))
      .filter(a => a.type === 'streak');
    
    const highestStreakAchievement = streakAchievements.reduce(
      (max, achievement) => Math.max(max, achievement.value), 
      0
    );
    
    // Check for streak milestones (7, 30, 60, 90, 180, 365 days)
    const streakMilestones = [7, 30, 60, 90, 180, 365];
    
    for (const milestone of streakMilestones) {
      if (currentStreak >= milestone && highestStreakAchievement < milestone) {
        await this.createAchievement({
          userId,
          type: 'streak',
          value: milestone
        });
      }
    }
  }

  // Stats operations
  async getUserStats(userId: number): Promise<{
    totalWordCount: number;
    charactersCreated: number;
    achievementsCount: number;
    currentStreak: number;
  }> {
    // Calculate total word count from all writing sessions
    const sessions = await this.getWritingSessionsByUserId(userId);
    const totalWordCount = sessions.reduce((sum, session) => sum + session.wordCount, 0);
    
    // Count characters created
    const characters = Array.from(this.characters.values())
      .filter(character => character.userId === userId);
    const charactersCreated = characters.length;
    
    // Count achievements
    const achievements = await this.getAchievementsByUserId(userId);
    const achievementsCount = achievements.length;
    
    // Calculate current streak
    let currentStreak = 0;
    if (sessions.length > 0) {
      // Sort sessions by date
      sessions.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const latestSession = new Date(sessions[0].date);
      latestSession.setHours(0, 0, 0, 0);
      
      // Check if latest session is from today or yesterday
      const diffTime = Math.abs(today.getTime() - latestSession.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        // User has written today or yesterday, streak is active
        // Count backwards to find streak length
        currentStreak = 1;
        let previousDate = latestSession;
        
        for (let i = 1; i < sessions.length; i++) {
          const sessionDate = new Date(sessions[i].date);
          sessionDate.setHours(0, 0, 0, 0);
          
          const dayDiff = Math.floor(
            (previousDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (dayDiff === 1) {
            currentStreak++;
            previousDate = sessionDate;
          } else {
            break;
          }
        }
      }
    }
    
    return {
      totalWordCount,
      charactersCreated,
      achievementsCount,
      currentStreak
    };
  }
}

export const storage = new MemStorage();
