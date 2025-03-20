import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";

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
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";

// Utility function to hash passwords
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Session type augmentation
declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const MemoryStoreSession = MemoryStore(session);

  // Setup session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "saga-scribe-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error during login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user data" });
    }
  });

  // Series routes
  app.get("/api/series", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
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
      if (series.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.status(200).json(series);
    } catch (error) {
      res.status(500).json({ message: "Error fetching series" });
    }
  });

  app.post("/api/series", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
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
      if (series.userId !== req.session.userId) {
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
      if (series.userId !== req.session.userId) {
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
      if (series.userId !== req.session.userId) {
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
      
      if (series.userId !== req.session.userId) {
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
      if (series?.userId !== req.session.userId) {
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
      if (series?.userId !== req.session.userId) {
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
      if (series?.userId !== req.session.userId) {
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
      if (series?.userId !== req.session.userId) {
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
      if (series?.userId !== req.session.userId) {
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
      if (series?.userId !== req.session.userId) {
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
      if (series?.userId !== req.session.userId) {
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
      if (series?.userId !== req.session.userId) {
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
      if (series.userId !== req.session.userId) {
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
      
      if (series.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const newCharacter = await storage.createCharacter(characterData);
      
      // Check achievements after adding a character
      await storage.checkAndAwardAchievements(req.session.userId!);
      
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
      if (series?.userId !== req.session.userId) {
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
      if (series?.userId !== req.session.userId) {
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
      if (series.userId !== req.session.userId) {
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
      if (series?.userId !== req.session.userId) {
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
      if (series?.userId !== req.session.userId) {
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
      if (series?.userId !== req.session.userId) {
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
      if (series.userId !== req.session.userId) {
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
      
      if (series.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const newLocation = await storage.createLocation(locationData);
      
      // Check achievements after adding a location
      await storage.checkAndAwardAchievements(req.session.userId!);
      
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
      if (series?.userId !== req.session.userId) {
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
      if (series?.userId !== req.session.userId) {
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
      const userId = req.session.userId!;
      const period = req.query.period as 'day' | 'week' | 'month' | 'year' | undefined;
      
      const stats = await storage.getWritingStatsByUser(userId, period);
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching writing stats" });
    }
  });

  app.post("/api/writing-stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
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
      const userId = req.session.userId!;
      const userAchievements = await storage.getUserAchievements(userId);
      res.status(200).json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user achievements" });
    }
  });

  app.post("/api/check-achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
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
      const userId = req.session.userId!;
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
      const userId = req.session.userId!;
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
      const userId = req.session.userId!;
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription) {
        return res.status(404).json({ message: "No active subscription found" });
      }
      
      // Cancel subscription at period end
      const updated = await storage.cancelUserSubscription(subscription.id);
      
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error canceling subscription" });
    }
  });

  return httpServer;
}
