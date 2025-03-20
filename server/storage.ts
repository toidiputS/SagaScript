import {
  type User,
  type InsertUser,
  type Series,
  type InsertSeries,
  type Book,
  type InsertBook,
  type Chapter,
  type InsertChapter,
  type Character,
  type InsertCharacter,
  type CharacterRelationship,
  type InsertCharacterRelationship,
  type Location,
  type InsertLocation,
  type WritingStat,
  type InsertWritingStat,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Subscription,
  type InsertSubscription
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Series methods
  getSeries(id: number): Promise<Series | undefined>;
  getAllSeriesByUser(userId: number): Promise<Series[]>;
  createSeries(series: InsertSeries): Promise<Series>;
  updateSeries(id: number, series: Partial<Series>): Promise<Series | undefined>;
  deleteSeries(id: number): Promise<boolean>;
  
  // Book methods
  getBook(id: number): Promise<Book | undefined>;
  getBooksBySeries(seriesId: number): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<Book>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  updateBookPositions(books: { id: number, position: number }[]): Promise<boolean>;
  
  // Chapter methods
  getChapter(id: number): Promise<Chapter | undefined>;
  getChaptersByBook(bookId: number): Promise<Chapter[]>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: number, chapter: Partial<Chapter>): Promise<Chapter | undefined>;
  deleteChapter(id: number): Promise<boolean>;
  updateChapterPositions(chapters: { id: number, position: number }[]): Promise<boolean>;
  
  // Character methods
  getCharacter(id: number): Promise<Character | undefined>;
  getCharactersBySeries(seriesId: number): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: Partial<Character>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;
  
  // Character Relationship methods
  getCharacterRelationship(id: number): Promise<CharacterRelationship | undefined>;
  getCharacterRelationshipsByCharacter(characterId: number): Promise<CharacterRelationship[]>;
  getCharacterRelationshipsBySeries(seriesId: number): Promise<CharacterRelationship[]>;
  createCharacterRelationship(relationship: InsertCharacterRelationship): Promise<CharacterRelationship>;
  updateCharacterRelationship(id: number, relationship: Partial<CharacterRelationship>): Promise<CharacterRelationship | undefined>;
  deleteCharacterRelationship(id: number): Promise<boolean>;
  
  // Location methods
  getLocation(id: number): Promise<Location | undefined>;
  getLocationsBySeries(seriesId: number): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<Location>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  
  // Writing Stats methods
  getWritingStatsByUser(userId: number, period?: 'day' | 'week' | 'month' | 'year'): Promise<WritingStat[]>;
  createWritingStat(stat: InsertWritingStat): Promise<WritingStat>;
  
  // Achievement methods
  getAchievements(): Promise<Achievement[]>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // User Achievement methods
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  checkAndAwardAchievements(userId: number): Promise<UserAchievement[]>;
  
  // Subscription Plan methods
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;
  
  // User Subscription methods
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  createUserSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateUserSubscription(id: number, subscription: Partial<Subscription>): Promise<Subscription | undefined>;
  cancelUserSubscription(id: number): Promise<Subscription | undefined>;
  updateUserPlan(userId: number, planName: string): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private series: Map<number, Series>;
  private books: Map<number, Book>;
  private chapters: Map<number, Chapter>;
  private characters: Map<number, Character>;
  private characterRelationships: Map<number, CharacterRelationship>;
  private locations: Map<number, Location>;
  private writingStats: Map<number, WritingStat>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;
  private subscriptions: Map<number, Subscription>;
  
  private currentIds: {
    user: number;
    series: number;
    book: number;
    chapter: number;
    character: number;
    characterRelationship: number;
    location: number;
    writingStat: number;
    achievement: number;
    userAchievement: number;
  };

  constructor() {
    this.users = new Map();
    this.series = new Map();
    this.books = new Map();
    this.chapters = new Map();
    this.characters = new Map();
    this.characterRelationships = new Map();
    this.locations = new Map();
    this.writingStats = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    
    this.currentIds = {
      user: 1,
      series: 1,
      book: 1,
      chapter: 1,
      character: 1,
      characterRelationship: 1,
      location: 1,
      writingStat: 1,
      achievement: 1,
      userAchievement: 1
    };
    
    // Initialize sample achievements
    this.initializeAchievements();
  }

  // Initialize predefined achievements
  private initializeAchievements() {
    const achievements: InsertAchievement[] = [
      {
        name: "7-Day Streak",
        description: "Write every day for a week",
        type: "streak",
        icon: "ri-fire-line",
        requiredValue: 7
      },
      {
        name: "Chapter Master",
        description: "Complete 10 chapters",
        type: "chapters",
        icon: "ri-book-mark-line",
        requiredValue: 10
      },
      {
        name: "Character Creator",
        description: "Develop 5 detailed characters",
        type: "characters",
        icon: "ri-user-star-line",
        requiredValue: 5
      },
      {
        name: "World Builder",
        description: "Create 10 unique locations",
        type: "locations",
        icon: "ri-earth-line",
        requiredValue: 10
      },
      {
        name: "Word Count Champion",
        description: "Write 50,000 words",
        type: "words",
        icon: "ri-quill-pen-line",
        requiredValue: 50000
      }
    ];
    
    achievements.forEach(achievement => {
      this.createAchievement(achievement);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const timestamp = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      plan: 'free',
      createdAt: timestamp 
    };
    this.users.set(id, user);
    return user;
  }

  // Series methods
  async getSeries(id: number): Promise<Series | undefined> {
    return this.series.get(id);
  }

  async getAllSeriesByUser(userId: number): Promise<Series[]> {
    return Array.from(this.series.values()).filter(
      (series) => series.userId === userId
    );
  }

  async createSeries(insertSeries: InsertSeries): Promise<Series> {
    const id = this.currentIds.series++;
    const timestamp = new Date();
    const series: Series = {
      ...insertSeries,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.series.set(id, series);
    return series;
  }

  async updateSeries(id: number, updates: Partial<Series>): Promise<Series | undefined> {
    const existingSeries = this.series.get(id);
    if (!existingSeries) return undefined;
    
    const updatedSeries: Series = {
      ...existingSeries,
      ...updates,
      updatedAt: new Date()
    };
    
    this.series.set(id, updatedSeries);
    return updatedSeries;
  }

  async deleteSeries(id: number): Promise<boolean> {
    return this.series.delete(id);
  }

  // Book methods
  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBooksBySeries(seriesId: number): Promise<Book[]> {
    return Array.from(this.books.values())
      .filter(book => book.seriesId === seriesId)
      .sort((a, b) => a.position - b.position);
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.currentIds.book++;
    const timestamp = new Date();
    const book: Book = {
      ...insertBook,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: number, updates: Partial<Book>): Promise<Book | undefined> {
    const existingBook = this.books.get(id);
    if (!existingBook) return undefined;
    
    const updatedBook: Book = {
      ...existingBook,
      ...updates,
      updatedAt: new Date()
    };
    
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }

  async updateBookPositions(books: { id: number, position: number }[]): Promise<boolean> {
    for (const { id, position } of books) {
      const book = this.books.get(id);
      if (book) {
        this.books.set(id, { ...book, position, updatedAt: new Date() });
      }
    }
    return true;
  }

  // Chapter methods
  async getChapter(id: number): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }

  async getChaptersByBook(bookId: number): Promise<Chapter[]> {
    return Array.from(this.chapters.values())
      .filter(chapter => chapter.bookId === bookId)
      .sort((a, b) => a.position - b.position);
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const id = this.currentIds.chapter++;
    const timestamp = new Date();
    const chapter: Chapter = {
      ...insertChapter,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.chapters.set(id, chapter);
    return chapter;
  }

  async updateChapter(id: number, updates: Partial<Chapter>): Promise<Chapter | undefined> {
    const existingChapter = this.chapters.get(id);
    if (!existingChapter) return undefined;
    
    const updatedChapter: Chapter = {
      ...existingChapter,
      ...updates,
      updatedAt: new Date()
    };
    
    this.chapters.set(id, updatedChapter);
    return updatedChapter;
  }

  async deleteChapter(id: number): Promise<boolean> {
    return this.chapters.delete(id);
  }

  async updateChapterPositions(chapters: { id: number, position: number }[]): Promise<boolean> {
    for (const { id, position } of chapters) {
      const chapter = this.chapters.get(id);
      if (chapter) {
        this.chapters.set(id, { ...chapter, position, updatedAt: new Date() });
      }
    }
    return true;
  }

  // Character methods
  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async getCharactersBySeries(seriesId: number): Promise<Character[]> {
    return Array.from(this.characters.values())
      .filter(character => character.seriesId === seriesId);
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = this.currentIds.character++;
    const timestamp = new Date();
    const character: Character = {
      ...insertCharacter,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.characters.set(id, character);
    return character;
  }

  async updateCharacter(id: number, updates: Partial<Character>): Promise<Character | undefined> {
    const existingCharacter = this.characters.get(id);
    if (!existingCharacter) return undefined;
    
    const updatedCharacter: Character = {
      ...existingCharacter,
      ...updates,
      updatedAt: new Date()
    };
    
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    return this.characters.delete(id);
  }

  // Character Relationship methods
  async getCharacterRelationship(id: number): Promise<CharacterRelationship | undefined> {
    return this.characterRelationships.get(id);
  }

  async getCharacterRelationshipsByCharacter(characterId: number): Promise<CharacterRelationship[]> {
    return Array.from(this.characterRelationships.values())
      .filter(rel => rel.sourceCharacterId === characterId || rel.targetCharacterId === characterId);
  }

  async getCharacterRelationshipsBySeries(seriesId: number): Promise<CharacterRelationship[]> {
    // First get all characters in the series
    const seriesCharacters = await this.getCharactersBySeries(seriesId);
    const characterIds = seriesCharacters.map(char => char.id);
    
    // Then filter relationships where both source and target are in this series
    return Array.from(this.characterRelationships.values())
      .filter(rel => 
        characterIds.includes(rel.sourceCharacterId) && 
        characterIds.includes(rel.targetCharacterId)
      );
  }

  async createCharacterRelationship(insertRelationship: InsertCharacterRelationship): Promise<CharacterRelationship> {
    const id = this.currentIds.characterRelationship++;
    const timestamp = new Date();
    const relationship: CharacterRelationship = {
      ...insertRelationship,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.characterRelationships.set(id, relationship);
    return relationship;
  }

  async updateCharacterRelationship(id: number, updates: Partial<CharacterRelationship>): Promise<CharacterRelationship | undefined> {
    const existingRelationship = this.characterRelationships.get(id);
    if (!existingRelationship) return undefined;
    
    const updatedRelationship: CharacterRelationship = {
      ...existingRelationship,
      ...updates,
      updatedAt: new Date()
    };
    
    this.characterRelationships.set(id, updatedRelationship);
    return updatedRelationship;
  }

  async deleteCharacterRelationship(id: number): Promise<boolean> {
    return this.characterRelationships.delete(id);
  }

  // Location methods
  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getLocationsBySeries(seriesId: number): Promise<Location[]> {
    return Array.from(this.locations.values())
      .filter(location => location.seriesId === seriesId);
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentIds.location++;
    const timestamp = new Date();
    const location: Location = {
      ...insertLocation,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(id: number, updates: Partial<Location>): Promise<Location | undefined> {
    const existingLocation = this.locations.get(id);
    if (!existingLocation) return undefined;
    
    const updatedLocation: Location = {
      ...existingLocation,
      ...updates,
      updatedAt: new Date()
    };
    
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }

  // Writing Stats methods
  async getWritingStatsByUser(userId: number, period?: 'day' | 'week' | 'month' | 'year'): Promise<WritingStat[]> {
    const stats = Array.from(this.writingStats.values())
      .filter(stat => stat.userId === userId);
    
    if (!period) return stats;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (period) {
      case 'day':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return stats.filter(stat => new Date(stat.date) >= cutoffDate);
  }

  async createWritingStat(insertStat: InsertWritingStat): Promise<WritingStat> {
    const id = this.currentIds.writingStat++;
    const stat: WritingStat = {
      ...insertStat,
      id
    };
    this.writingStats.set(id, stat);
    
    // Check for achievements after adding stats
    await this.checkAndAwardAchievements(insertStat.userId);
    
    return stat;
  }

  // Achievement methods
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentIds.achievement++;
    const timestamp = new Date();
    const achievement: Achievement = {
      ...insertAchievement,
      id,
      createdAt: timestamp,
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  // User Achievement methods
  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const userAchievements = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId);
      
    // Join with achievement data
    return userAchievements.map(ua => {
      const achievement = this.achievements.get(ua.achievementId);
      if (!achievement) {
        throw new Error(`Achievement not found: ${ua.achievementId}`);
      }
      return {
        ...ua,
        achievement
      };
    });
  }

  async createUserAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    // Check if user already has this achievement
    const existing = Array.from(this.userAchievements.values()).find(
      ua => ua.userId === insertUserAchievement.userId && ua.achievementId === insertUserAchievement.achievementId
    );
    
    if (existing) {
      return existing;
    }
    
    const id = this.currentIds.userAchievement++;
    const timestamp = new Date();
    const userAchievement: UserAchievement = {
      ...insertUserAchievement,
      id,
      earnedAt: timestamp
    };
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
  }

  async checkAndAwardAchievements(userId: number): Promise<UserAchievement[]> {
    const newAchievements: UserAchievement[] = [];
    const achievements = await this.getAchievements();
    
    // Get current user stats
    const writingStats = await this.getWritingStatsByUser(userId);
    const characters = (await this.getAllSeriesByUser(userId))
      .flatMap(async series => await this.getCharactersBySeries(series.id));
    const locations = (await this.getAllSeriesByUser(userId))
      .flatMap(async series => await this.getLocationsBySeries(series.id));
    const chapters = (await this.getAllSeriesByUser(userId))
      .flatMap(async series => {
        const books = await this.getBooksBySeries(series.id);
        return books.flatMap(async book => await this.getChaptersByBook(book.id));
      });
    
    // Total words written
    const totalWords = writingStats.reduce((sum, stat) => sum + stat.wordsWritten, 0);
    
    // Check for streak (simplified - just check consecutive days)
    const dates = writingStats
      .map(stat => new Date(stat.date).toISOString().split('T')[0])
      .sort();
    
    let currentStreak = 1;
    let maxStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i-1]);
      const currDate = new Date(dates[i]);
      
      // Check if dates are consecutive
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    
    // Award achievements based on criteria
    for (const achievement of achievements) {
      // Skip if user already has this achievement
      const alreadyAwarded = (await this.getUserAchievements(userId))
        .some(ua => ua.achievementId === achievement.id);
      
      if (alreadyAwarded) continue;
      
      let isEarned = false;
      
      switch (achievement.type) {
        case 'streak':
          isEarned = maxStreak >= achievement.requiredValue;
          break;
        case 'words':
          isEarned = totalWords >= achievement.requiredValue;
          break;
        case 'characters':
          isEarned = (await Promise.all(characters)).flat().length >= achievement.requiredValue;
          break;
        case 'chapters':
          isEarned = (await Promise.all(chapters)).flat().length >= achievement.requiredValue;
          break;
        case 'locations':
          isEarned = (await Promise.all(locations)).flat().length >= achievement.requiredValue;
          break;
      }
      
      if (isEarned) {
        const newAchievement = await this.createUserAchievement({
          userId,
          achievementId: achievement.id
        });
        newAchievements.push(newAchievement);
      }
    }
    
    return newAchievements;
  }
}

export const storage = new MemStorage();
