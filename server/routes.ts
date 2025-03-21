import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth } from "./auth";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY environment variable. Stripe integration will be disabled.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;
import { 
  insertUserSchema, 
  insertSeriesSchema,
  insertBookSchema,
  insertChapterSchema,
  insertCharacterSchema,
  insertCharacterRelationshipSchema,
  insertLocationSchema,
  insertWritingStatSchema,
  insertTimelineEventSchema,
  insertRewardTypeSchema,
  insertWritingMilestoneSchema,
  insertUserRewardSchema,
  insertWritingStreakSchema,
  insertWritingGoalSchema,
  insertPointLedgerSchema,
  type Subscription,
  type RewardType,
  type WritingMilestone,
  type UserReward,
  type WritingStreak,
  type WritingGoal,
  type PointLedgerEntry,
} from "@shared/schema";
import { 
  generateWritingSuggestions, 
  generateSingleSuggestion, 
  analyzeWriting,
  type SuggestionType
} from "./services/openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup authentication using Passport
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    console.log("[Auth Middleware] User authenticated:", req.isAuthenticated());
    if (req.isAuthenticated()) {
      console.log("[Auth Middleware] User ID:", req.user?.id);
      return next();
    }
    console.log("[Auth Middleware] Authentication failed - no valid session");
    return res.status(401).json({ message: "Unauthorized - Please log in" });
  };

  // Authentication routes are now handled in auth.ts
  // We still keep the /api/me endpoint for backward compatibility
  app.get("/api/me", (req, res) => {
    console.log("[API /api/me] Authentication check:", req.isAuthenticated());
    
    if (!req.isAuthenticated()) {
      console.log("[API /api/me] User not authenticated");
      return res.status(401).json({ message: "Not authenticated - Please log in" });
    }
    
    console.log("[API /api/me] User authenticated, ID:", req.user?.id);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    console.log("[API /api/me] Returning user data");
    res.status(200).json(userWithoutPassword);
  });

  // Series routes
  app.get("/api/series", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const allSeries = await storage.getAllSeriesByUser(userId);
      res.status(200).json(allSeries);
    } catch (error) {
      res.status(500).json({ message: "Error fetching series" });
    }
  });

  app.get("/api/series/:id", isAuthenticated, async (req, res) => {
    try {
      const seriesId = parseInt(req.params.id);
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      // Check ownership
      if (series.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.status(200).json(series);
    } catch (error) {
      res.status(500).json({ message: "Error fetching series" });
    }
  });

  app.post("/api/series", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const seriesData = insertSeriesSchema.parse({
        ...req.body,
        userId
      });
      
      const newSeries = await storage.createSeries(seriesData);
      res.status(201).json(newSeries);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error creating series" });
    }
  });

  app.put("/api/series/:id", isAuthenticated, async (req, res) => {
    try {
      const seriesId = parseInt(req.params.id);
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      // Check ownership
      if (series.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedSeries = await storage.updateSeries(seriesId, req.body);
      res.status(200).json(updatedSeries);
    } catch (error) {
      res.status(500).json({ message: "Error updating series" });
    }
  });

  app.delete("/api/series/:id", isAuthenticated, async (req, res) => {
    try {
      const seriesId = parseInt(req.params.id);
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      // Check ownership
      if (series.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteSeries(seriesId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting series" });
    }
  });

  // Book routes
  app.get("/api/series/:seriesId/books", isAuthenticated, async (req, res) => {
    try {
      const seriesId = parseInt(req.params.seriesId);
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      // Check ownership
      if (series.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const books = await storage.getBooksBySeries(seriesId);
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ message: "Error fetching books" });
    }
  });

  app.post("/api/books", isAuthenticated, async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      
      // Check series ownership
      const series = await storage.getSeries(bookData.seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const newBook = await storage.createBook(bookData);
      res.status(201).json(newBook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error creating book" });
    }
  });

  app.put("/api/books/:id", isAuthenticated, async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Check series ownership
      const series = await storage.getSeries(book.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedBook = await storage.updateBook(bookId, req.body);
      res.status(200).json(updatedBook);
    } catch (error) {
      res.status(500).json({ message: "Error updating book" });
    }
  });

  app.delete("/api/books/:id", isAuthenticated, async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Check series ownership
      const series = await storage.getSeries(book.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteBook(bookId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting book" });
    }
  });

  app.post("/api/books/reorder", isAuthenticated, async (req, res) => {
    try {
      const { books } = req.body;
      
      if (!Array.isArray(books) || books.length === 0) {
        return res.status(400).json({ message: "Invalid books data" });
      }
      
      // Check ownership of the first book's series (assuming all books belong to same series)
      const firstBook = await storage.getBook(books[0].id);
      if (!firstBook) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      const series = await storage.getSeries(firstBook.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.updateBookPositions(books);
      res.status(200).json({ message: "Books reordered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error reordering books" });
    }
  });

  // Chapter routes
  app.get("/api/books/:bookId/chapters", isAuthenticated, async (req, res) => {
    try {
      const bookId = parseInt(req.params.bookId);
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Check series ownership
      const series = await storage.getSeries(book.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const chapters = await storage.getChaptersByBook(bookId);
      res.status(200).json(chapters);
    } catch (error) {
      res.status(500).json({ message: "Error fetching chapters" });
    }
  });

  app.post("/api/chapters", isAuthenticated, async (req, res) => {
    try {
      const chapterData = insertChapterSchema.parse(req.body);
      
      // Check book ownership
      const book = await storage.getBook(chapterData.bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      const series = await storage.getSeries(book.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const newChapter = await storage.createChapter(chapterData);
      
      // Update book word count
      const existingCount = book.wordCount || 0;
      await storage.updateBook(book.id, { 
        wordCount: existingCount + (chapterData.wordCount || 0) 
      });
      
      res.status(201).json(newChapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error creating chapter" });
    }
  });

  app.put("/api/chapters/:id", isAuthenticated, async (req, res) => {
    try {
      const chapterId = parseInt(req.params.id);
      const chapter = await storage.getChapter(chapterId);
      
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      // Check book ownership
      const book = await storage.getBook(chapter.bookId);
      const series = await storage.getSeries(book!.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // If word count is changing, update the book's total
      if (typeof req.body.wordCount === 'number' && req.body.wordCount !== chapter.wordCount) {
        const wordCountDiff = req.body.wordCount - chapter.wordCount;
        await storage.updateBook(chapter.bookId, { 
          wordCount: (book!.wordCount || 0) + wordCountDiff 
        });
      }
      
      const updatedChapter = await storage.updateChapter(chapterId, req.body);
      res.status(200).json(updatedChapter);
    } catch (error) {
      res.status(500).json({ message: "Error updating chapter" });
    }
  });

  app.delete("/api/chapters/:id", isAuthenticated, async (req, res) => {
    try {
      const chapterId = parseInt(req.params.id);
      const chapter = await storage.getChapter(chapterId);
      
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      // Check book ownership
      const book = await storage.getBook(chapter.bookId);
      const series = await storage.getSeries(book!.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Update book word count
      await storage.updateBook(chapter.bookId, { 
        wordCount: Math.max(0, (book!.wordCount || 0) - (chapter.wordCount || 0))
      });
      
      await storage.deleteChapter(chapterId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting chapter" });
    }
  });

  app.post("/api/chapters/reorder", isAuthenticated, async (req, res) => {
    try {
      const { chapters } = req.body;
      
      if (!Array.isArray(chapters) || chapters.length === 0) {
        return res.status(400).json({ message: "Invalid chapters data" });
      }
      
      // Check ownership of the first chapter's book (assuming all chapters belong to same book)
      const firstChapter = await storage.getChapter(chapters[0].id);
      if (!firstChapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      const book = await storage.getBook(firstChapter.bookId);
      const series = await storage.getSeries(book!.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.updateChapterPositions(chapters);
      res.status(200).json({ message: "Chapters reordered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error reordering chapters" });
    }
  });

  // Character routes
  app.get("/api/series/:seriesId/characters", isAuthenticated, async (req, res) => {
    try {
      const seriesId = parseInt(req.params.seriesId);
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      // Check ownership
      if (series.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const characters = await storage.getCharactersBySeries(seriesId);
      res.status(200).json(characters);
    } catch (error) {
      res.status(500).json({ message: "Error fetching characters" });
    }
  });

  app.post("/api/characters", isAuthenticated, async (req, res) => {
    try {
      const characterData = insertCharacterSchema.parse(req.body);
      
      // Check series ownership
      const series = await storage.getSeries(characterData.seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const newCharacter = await storage.createCharacter(characterData);
      
      // Check achievements after adding a character
      await storage.checkAndAwardAchievements(req.user!.id!);
      
      res.status(201).json(newCharacter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error creating character" });
    }
  });

  app.put("/api/characters/:id", isAuthenticated, async (req, res) => {
    try {
      const characterId = parseInt(req.params.id);
      const character = await storage.getCharacter(characterId);
      
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      // Check series ownership
      const series = await storage.getSeries(character.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedCharacter = await storage.updateCharacter(characterId, req.body);
      res.status(200).json(updatedCharacter);
    } catch (error) {
      res.status(500).json({ message: "Error updating character" });
    }
  });

  app.delete("/api/characters/:id", isAuthenticated, async (req, res) => {
    try {
      const characterId = parseInt(req.params.id);
      const character = await storage.getCharacter(characterId);
      
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      // Check series ownership
      const series = await storage.getSeries(character.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteCharacter(characterId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting character" });
    }
  });

  // Character Relationship routes
  app.get("/api/series/:seriesId/character-relationships", isAuthenticated, async (req, res) => {
    try {
      const seriesId = parseInt(req.params.seriesId);
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      // Check ownership
      if (series.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const relationships = await storage.getCharacterRelationshipsBySeries(seriesId);
      res.status(200).json(relationships);
    } catch (error) {
      res.status(500).json({ message: "Error fetching character relationships" });
    }
  });

  app.post("/api/character-relationships", isAuthenticated, async (req, res) => {
    try {
      const relationshipData = insertCharacterRelationshipSchema.parse(req.body);
      
      // Check character ownership
      const sourceChar = await storage.getCharacter(relationshipData.sourceCharacterId);
      if (!sourceChar) {
        return res.status(404).json({ message: "Source character not found" });
      }
      
      const targetChar = await storage.getCharacter(relationshipData.targetCharacterId);
      if (!targetChar) {
        return res.status(404).json({ message: "Target character not found" });
      }
      
      // Characters should belong to the same series
      if (sourceChar.seriesId !== targetChar.seriesId) {
        return res.status(400).json({ message: "Characters must belong to the same series" });
      }
      
      // Check series ownership
      const series = await storage.getSeries(sourceChar.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const newRelationship = await storage.createCharacterRelationship(relationshipData);
      res.status(201).json(newRelationship);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error creating character relationship" });
    }
  });

  app.put("/api/character-relationships/:id", isAuthenticated, async (req, res) => {
    try {
      const relationshipId = parseInt(req.params.id);
      const relationship = await storage.getCharacterRelationship(relationshipId);
      
      if (!relationship) {
        return res.status(404).json({ message: "Relationship not found" });
      }
      
      // Check character ownership
      const sourceChar = await storage.getCharacter(relationship.sourceCharacterId);
      const series = await storage.getSeries(sourceChar!.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedRelationship = await storage.updateCharacterRelationship(relationshipId, req.body);
      res.status(200).json(updatedRelationship);
    } catch (error) {
      res.status(500).json({ message: "Error updating character relationship" });
    }
  });

  app.delete("/api/character-relationships/:id", isAuthenticated, async (req, res) => {
    try {
      const relationshipId = parseInt(req.params.id);
      const relationship = await storage.getCharacterRelationship(relationshipId);
      
      if (!relationship) {
        return res.status(404).json({ message: "Relationship not found" });
      }
      
      // Check character ownership
      const sourceChar = await storage.getCharacter(relationship.sourceCharacterId);
      const series = await storage.getSeries(sourceChar!.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteCharacterRelationship(relationshipId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting character relationship" });
    }
  });

  // Location routes
  app.get("/api/series/:seriesId/locations", isAuthenticated, async (req, res) => {
    try {
      const seriesId = parseInt(req.params.seriesId);
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      // Check ownership
      if (series.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const locations = await storage.getLocationsBySeries(seriesId);
      res.status(200).json(locations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching locations" });
    }
  });

  app.post("/api/locations", isAuthenticated, async (req, res) => {
    try {
      const locationData = insertLocationSchema.parse(req.body);
      
      // Check series ownership
      const series = await storage.getSeries(locationData.seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const newLocation = await storage.createLocation(locationData);
      
      // Check achievements after adding a location
      await storage.checkAndAwardAchievements(req.user!.id!);
      
      res.status(201).json(newLocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error creating location" });
    }
  });

  app.put("/api/locations/:id", isAuthenticated, async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      // Check series ownership
      const series = await storage.getSeries(location.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedLocation = await storage.updateLocation(locationId, req.body);
      res.status(200).json(updatedLocation);
    } catch (error) {
      res.status(500).json({ message: "Error updating location" });
    }
  });

  app.delete("/api/locations/:id", isAuthenticated, async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      // Check series ownership
      const series = await storage.getSeries(location.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteLocation(locationId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting location" });
    }
  });

  // Writing Stats routes
  app.get("/api/writing-stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id!;
      const period = req.query.period as 'day' | 'week' | 'month' | 'year' | undefined;
      
      const stats = await storage.getWritingStatsByUser(userId, period);
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching writing stats" });
    }
  });

  app.post("/api/writing-stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id!;
      const statData = insertWritingStatSchema.parse({
        ...req.body,
        userId
      });
      
      // If book is specified, check ownership
      if (statData.bookId) {
        const book = await storage.getBook(statData.bookId);
        if (!book) {
          return res.status(404).json({ message: "Book not found" });
        }
        
        const series = await storage.getSeries(book.seriesId);
        if (series?.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      // If chapter is specified, check ownership
      if (statData.chapterId) {
        const chapter = await storage.getChapter(statData.chapterId);
        if (!chapter) {
          return res.status(404).json({ message: "Chapter not found" });
        }
        
        const book = await storage.getBook(chapter.bookId);
        const series = await storage.getSeries(book!.seriesId);
        if (series?.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const newStat = await storage.createWritingStat(statData);
      res.status(201).json(newStat);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error creating writing stat" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", isAuthenticated, async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.status(200).json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Error fetching achievements" });
    }
  });

  app.get("/api/user-achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id!;
      const userAchievements = await storage.getUserAchievements(userId);
      res.status(200).json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user achievements" });
    }
  });

  app.post("/api/check-achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id!;
      const newAchievements = await storage.checkAndAwardAchievements(userId);
      res.status(200).json(newAchievements);
    } catch (error) {
      res.status(500).json({ message: "Error checking achievements" });
    }
  });

  // Helper function to check if Stripe is available
  const checkStripe = (res: Response) => {
    if (!stripe) {
      res.status(503).json({ 
        message: "Payment processing is unavailable. Please try again later.",
        reason: "Missing Stripe configuration"
      });
      return false;
    }
    return true;
  };

  // Subscription Plan routes
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.status(200).json(plans);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subscription plans" });
    }
  });

  // User subscription management
  app.get("/api/subscriptions/current", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id!;
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription) {
        return res.status(404).json({ message: "No active subscription found" });
      }
      
      // Get plan details
      const plan = await storage.getSubscriptionPlan(subscription.planId);
      
      res.status(200).json({
        subscription,
        plan
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching subscription" });
    }
  });

  app.post("/api/subscriptions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id!;
      const { planName } = req.body;
      
      if (!planName) {
        return res.status(400).json({ message: "Plan name is required" });
      }
      
      // Find the plan by name
      const plans = await storage.getSubscriptionPlans();
      const plan = plans.find(p => p.name === planName);
      
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      // Check if Stripe integration is available
      if (!checkStripe(res)) {
        return;
      }
      
      // Get user info for creating Stripe customer
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create a Stripe checkout session
      try {
        // Set price based on the plan
        const priceInCents = Math.round(plan.price * 100); // Convert to cents
        
        // Create a checkout session
        const session = await stripe!.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Saga Scribe ${plan.name.charAt(0).toUpperCase() + plan.name.slice(1)} Subscription`,
                  description: plan.description,
                },
                unit_amount: priceInCents,
                recurring: {
                  interval: plan.billingInterval === 'monthly' ? 'month' : 'year',
                },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${req.headers.origin}/dashboard?subscription=success`,
          cancel_url: `${req.headers.origin}/subscription?canceled=true`,
          customer_email: user.email || undefined,
          metadata: {
            userId: userId.toString(),
            planId: plan.id.toString(),
            planName: plan.name,
          },
        });
        
        // Return the checkout session ID
        res.status(200).json({ 
          sessionId: session.id,
          url: session.url
        });
        
      } catch (stripeError: any) {
        console.error('Stripe error:', stripeError);
        return res.status(400).json({ 
          message: "Error creating checkout session", 
          error: stripeError.message 
        });
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Error updating subscription" });
    }
  });

  app.post("/api/subscriptions/cancel", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id!;
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription) {
        return res.status(404).json({ message: "No active subscription found" });
      }
      
      // Check if Stripe integration is available
      if (!checkStripe(res)) {
        return;
      }
      
      if (subscription.paymentProviderSubscriptionId) {
        try {
          // Cancel the subscription in Stripe
          await stripe!.subscriptions.update(subscription.paymentProviderSubscriptionId, {
            cancel_at_period_end: true
          });
        } catch (stripeError: any) {
          console.error('Stripe error during cancellation:', stripeError);
        }
      }
      
      // Cancel subscription at period end
      const updated = await storage.cancelUserSubscription(subscription.id);
      
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error canceling subscription" });
    }
  });
  
  // Stripe payment route for one-time payments
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const { amount, items } = req.body;
      
      if (!amount || !items) {
        return res.status(400).json({ message: "Amount and items are required" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId: req.user!.id!.toString(),
          items: JSON.stringify(items)
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Webhook endpoint to handle Stripe events
  app.post("/api/webhooks/stripe", async (req, res) => {
    if (!checkStripe(res)) {
      return;
    }
    
    // Get the signature from the headers
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return res.status(400).json({ message: "Missing Stripe signature" });
    }
    
    try {
      // Construct event
      const event = stripe!.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
      
      // Handle based on event type
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          
          // Extract metadata
          const userId = Number(session.metadata?.userId);
          const planName = session.metadata?.planName;
          
          if (!userId || !planName) {
            return res.status(400).json({ message: "Missing metadata in session" });
          }
          
          // Get the user
          const user = await storage.getUser(userId);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
          
          // Get subscription from Stripe
          const subscriptionId = session.subscription as string;
          const subscription = await stripe!.subscriptions.retrieve(subscriptionId);
          
          // Get the plan from the subscription's metadata
          const plans = await storage.getSubscriptionPlans();
          const plan = plans.find(p => p.name === planName);
          
          if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
          }
          
          // Extract customer ID
          const customerId = session.customer as string;
          
          // Update user in database with Stripe info
          await storage.updateUserStripeInfo(userId, {
            customerId,
            subscriptionId
          });
          
          // Create or update the subscription in our database
          const now = new Date();
          const endDate = new Date();
          endDate.setSeconds(endDate.getSeconds() + subscription.current_period_end);
          
          await storage.createUserSubscription({
            userId,
            planId: plan.id,
            status: subscription.status,
            currentPeriodStart: now,
            currentPeriodEnd: endDate,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            paymentMethod: 'stripe',
            paymentProviderCustomerId: customerId,
            paymentProviderSubscriptionId: subscriptionId,
          });
          
          // Update user's plan
          await storage.updateUserPlan(userId, planName);
          
          break;
        }
        
        case 'customer.subscription.updated': {
          const stripeSubscription = event.data.object as Stripe.Subscription;
          
          // Find subscription in our database
          const allSubscriptions = await storage.getAllSubscriptions();
          const subscription = allSubscriptions.find(
            (s: Subscription) => s.paymentProviderSubscriptionId === stripeSubscription.id
          );
          
          if (subscription) {
            // Update subscription status
            await storage.updateUserSubscription(subscription.id, {
              status: stripeSubscription.status,
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            });
          }
          
          break;
        }
        
        case 'customer.subscription.deleted': {
          const stripeSubscription = event.data.object as Stripe.Subscription;
          
          // Find subscription in our database
          const allSubscriptions = await storage.getAllSubscriptions();
          const subscription = allSubscriptions.find(
            (s: Subscription) => s.paymentProviderSubscriptionId === stripeSubscription.id
          );
          
          if (subscription) {
            // Update subscription status
            await storage.updateUserSubscription(subscription.id, {
              status: 'canceled',
              cancelAtPeriodEnd: false,
            });
            
            // If this is the user's current subscription, downgrade them to free tier
            const user = await storage.getUser(subscription.userId);
            if (user && user.stripeSubscriptionId === stripeSubscription.id) {
              await storage.updateUserPlan(subscription.userId, 'apprentice');
            }
          }
          
          break;
        }
      }
      
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Stripe webhook error:', error);
      return res.status(400).json({ message: error.message });
    }
  });

  // Timeline Event routes
  app.get("/api/series/:seriesId/timeline", isAuthenticated, async (req, res) => {
    try {
      const seriesId = parseInt(req.params.seriesId);
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      // Check ownership
      if (series.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const timelineEvents = await storage.getTimelineEventsBySeries(seriesId);
      res.status(200).json(timelineEvents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching timeline events" });
    }
  });

  app.get("/api/books/:bookId/timeline", isAuthenticated, async (req, res) => {
    try {
      const bookId = parseInt(req.params.bookId);
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Check series ownership
      const series = await storage.getSeries(book.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const timelineEvents = await storage.getTimelineEventsByBook(bookId);
      res.status(200).json(timelineEvents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching timeline events" });
    }
  });

  app.get("/api/characters/:characterId/timeline", isAuthenticated, async (req, res) => {
    try {
      const characterId = parseInt(req.params.characterId);
      const character = await storage.getCharacter(characterId);
      
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      // Check series ownership
      const series = await storage.getSeries(character.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const timelineEvents = await storage.getTimelineEventsByCharacter(characterId);
      res.status(200).json(timelineEvents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching timeline events" });
    }
  });

  app.post("/api/timeline-events", isAuthenticated, async (req, res) => {
    try {
      const eventData = insertTimelineEventSchema.parse(req.body);
      
      // Check series ownership
      const series = await storage.getSeries(eventData.seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const newEvent = await storage.createTimelineEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error creating timeline event" });
    }
  });

  app.put("/api/timeline-events/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getTimelineEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Timeline event not found" });
      }
      
      // Check series ownership
      const series = await storage.getSeries(event.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedEvent = await storage.updateTimelineEvent(eventId, req.body);
      res.status(200).json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Error updating timeline event" });
    }
  });

  app.delete("/api/timeline-events/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getTimelineEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Timeline event not found" });
      }
      
      // Check series ownership
      const series = await storage.getSeries(event.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTimelineEvent(eventId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting timeline event" });
    }
  });

  app.post("/api/timeline-events/reorder", isAuthenticated, async (req, res) => {
    try {
      const { events } = req.body;
      
      if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ message: "Invalid events data" });
      }
      
      // Check ownership of the first event's series (assuming all events belong to same series)
      const firstEvent = await storage.getTimelineEvent(events[0].id);
      if (!firstEvent) {
        return res.status(404).json({ message: "Timeline event not found" });
      }
      
      const series = await storage.getSeries(firstEvent.seriesId);
      if (series?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.updateTimelineEventPositions(events);
      res.status(200).json({ message: "Timeline events reordered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error reordering timeline events" });
    }
  });

  // AI Writing Suggestions routes
  app.get("/api/ai/suggestions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id!;
      const user = await storage.getUser(userId);
      
      // Check if user has AI suggestions access based on plan
      if (user?.plan === 'free' || user?.plan === 'apprentice') {
        return res.status(403).json({ 
          message: "AI suggestions require an upgraded plan",
          requiredPlan: 'wordsmith' 
        });
      }
      
      // Get request parameters with defaults
      const seriesId = req.query.seriesId ? parseInt(req.query.seriesId as string) : undefined;
      const bookId = req.query.bookId ? parseInt(req.query.bookId as string) : undefined;
      const types = req.query.types 
        ? (req.query.types as string).split(',') as SuggestionType[]
        : ['plotIdea', 'characterDevelopment', 'dialogue', 'consistency', 'worldBuilding'];
      const count = req.query.count ? parseInt(req.query.count as string) : 3;
      
      // Validate seriesId if provided
      if (seriesId) {
        const series = await storage.getSeries(seriesId);
        if (!series) {
          return res.status(404).json({ message: "Series not found" });
        }
        
        // Check ownership
        if (series.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      // Validate bookId if provided
      if (bookId) {
        const book = await storage.getBook(bookId);
        if (!book) {
          return res.status(404).json({ message: "Book not found" });
        }
        
        // Check ownership via series
        const series = await storage.getSeries(book.seriesId);
        if (series?.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      // Prepare context for AI service
      const context: any = {};
      
      if (seriesId) {
        context.series = await storage.getSeries(seriesId);
        context.characters = await storage.getCharactersBySeries(seriesId);
        context.locations = await storage.getLocationsBySeries(seriesId);
        context.books = await storage.getBooksBySeries(seriesId);
        
        // Get current book if bookId is provided, otherwise use series.currentBook
        if (bookId) {
          context.currentBook = await storage.getBook(bookId);
        } else if (context.series?.currentBook) {
          const currentBookByPosition = context.books.find(
            (b: any) => b.position === context.series.currentBook
          );
          if (currentBookByPosition) {
            context.currentBook = currentBookByPosition;
          }
        }
        
        // Get current chapter if a current book is determined
        if (context.currentBook) {
          const chapters = await storage.getChaptersByBook(context.currentBook.id);
          if (chapters.length > 0) {
            context.recentChapters = chapters.slice(0, 3);
            
            // Try to find the current chapter based on book.currentChapter
            // The book schema might not have currentChapter property explicitly defined
            if ('currentChapter' in context.currentBook && context.currentBook.currentChapter) {
              const currentChapterByPosition = chapters.find(
                (c: any) => c.position === (context.currentBook as any).currentChapter
              );
              if (currentChapterByPosition) {
                context.currentChapter = currentChapterByPosition;
              }
            }
          }
        }
      }
      
      // Generate suggestions with AI
      const validTypes = types.filter((type): type is SuggestionType => 
        ['plotIdea', 'characterDevelopment', 'dialogue', 'consistency', 'worldBuilding', 'sceneDescription', 'conflict'].includes(type)
      );
      const suggestions = await generateWritingSuggestions(context, validTypes, count);
      
      res.status(200).json(suggestions);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      res.status(500).json({ message: "Error generating AI suggestions" });
    }
  });

  app.post("/api/ai/analyze", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id!;
      const user = await storage.getUser(userId);
      
      // Check if user has writing analysis access based on plan
      if (user?.plan === 'free' || user?.plan === 'apprentice') {
        return res.status(403).json({ 
          message: "Writing analysis requires an upgraded plan",
          requiredPlan: 'wordsmith' 
        });
      }
      
      const { content, chapterId } = req.body;
      
      if (!content && !chapterId) {
        return res.status(400).json({ message: "Either content or chapterId is required" });
      }
      
      let textToAnalyze = content;
      
      // If chapterId is provided, get chapter content
      if (chapterId) {
        const chapter = await storage.getChapter(parseInt(chapterId));
        if (!chapter) {
          return res.status(404).json({ message: "Chapter not found" });
        }
        
        // Check ownership via book and series
        const book = await storage.getBook(chapter.bookId);
        if (!book) {
          return res.status(404).json({ message: "Book not found" });
        }
        
        const series = await storage.getSeries(book.seriesId);
        if (series?.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        textToAnalyze = chapter.content || "";
      }
      
      if (!textToAnalyze || textToAnalyze.length < 100) {
        return res.status(400).json({ message: "Insufficient content for analysis (minimum 100 characters)" });
      }
      
      // Analyze writing with AI
      const analysis = await analyzeWriting(textToAnalyze);
      
      res.status(200).json({ analysis });
    } catch (error) {
      console.error("Error analyzing writing:", error);
      res.status(500).json({ message: "Error analyzing writing" });
    }
  });

  app.post("/api/ai/suggestion", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id!;
      const user = await storage.getUser(userId);
      
      // Check if user has AI suggestions access based on plan
      if (user?.plan === 'free' || user?.plan === 'apprentice') {
        return res.status(403).json({ 
          message: "AI suggestions require an upgraded plan",
          requiredPlan: 'wordsmith' 
        });
      }
      
      const { type, seriesId, bookId } = req.body;
      
      if (!type || !seriesId) {
        return res.status(400).json({ message: "Type and seriesId are required" });
      }
      
      // Validate seriesId
      const series = await storage.getSeries(parseInt(seriesId));
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      // Check ownership
      if (series.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Prepare context
      const context: any = {
        series,
        characters: await storage.getCharactersBySeries(series.id),
        locations: await storage.getLocationsBySeries(series.id),
        books: await storage.getBooksBySeries(series.id),
      };
      
      // Get current book
      if (bookId) {
        const book = await storage.getBook(parseInt(bookId));
        if (book) {
          context.currentBook = book;
          
          // Get chapters for the book
          const chapters = await storage.getChaptersByBook(book.id);
          if (chapters.length > 0) {
            context.recentChapters = chapters.slice(0, 3);
            
            // Try to find the current chapter
            // The book schema might not have currentChapter property explicitly defined
            if ('currentChapter' in book && book.currentChapter) {
              const currentChapterByPosition = chapters.find(
                c => c.position === (book as any).currentChapter
              );
              if (currentChapterByPosition) {
                context.currentChapter = currentChapterByPosition;
              }
            }
          }
        }
      }
      
      // Generate a single suggestion
      const suggestion = await generateSingleSuggestion(context, type as SuggestionType);
      
      res.status(200).json(suggestion);
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      res.status(500).json({ message: "Error generating AI suggestion" });
    }
  });

  return httpServer;
}
