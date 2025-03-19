import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { createHash } from "crypto";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "saga-scribe-secret",
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        const hashedPassword = createHash('sha256').update(password).digest('hex');
        if (user.password !== hashedPassword) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication routes
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      tier: user.tier,
    });
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { username, email, password, displayName } = req.body;

      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        username,
        email,
        password,
        displayName,
      });

      // Log in the user after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        return res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          tier: user.tier,
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/me", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      tier: user.tier,
    });
  });

  // Series routes
  app.get("/api/series", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    try {
      const userSeries = await storage.getAllSeriesByUser(userId);
      res.json(userSeries);
    } catch (error) {
      console.error("Error fetching series:", error);
      res.status(500).json({ message: "Error fetching series" });
    }
  });

  app.get("/api/series/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const seriesId = parseInt(req.params.id);
    
    try {
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to series" });
      }
      
      res.json(series);
    } catch (error) {
      console.error("Error fetching series:", error);
      res.status(500).json({ message: "Error fetching series" });
    }
  });

  app.post("/api/series", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    try {
      const { title, description, genre, booksPlanned } = req.body;
      
      const newSeries = await storage.createSeries({
        userId,
        title,
        description,
        genre,
        booksPlanned: parseInt(booksPlanned) || 1,
      });
      
      res.status(201).json(newSeries);
    } catch (error) {
      console.error("Error creating series:", error);
      res.status(500).json({ message: "Error creating series" });
    }
  });

  app.put("/api/series/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const seriesId = parseInt(req.params.id);
    
    try {
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to series" });
      }
      
      const updatedSeries = await storage.updateSeries(seriesId, req.body);
      res.json(updatedSeries);
    } catch (error) {
      console.error("Error updating series:", error);
      res.status(500).json({ message: "Error updating series" });
    }
  });

  app.delete("/api/series/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const seriesId = parseInt(req.params.id);
    
    try {
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to series" });
      }
      
      await storage.deleteSeries(seriesId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting series:", error);
      res.status(500).json({ message: "Error deleting series" });
    }
  });

  // Book routes
  app.get("/api/series/:seriesId/books", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const seriesId = parseInt(req.params.seriesId);
    
    try {
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to series" });
      }
      
      const books = await storage.getBooksBySeriesId(seriesId);
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Error fetching books" });
    }
  });

  app.post("/api/series/:seriesId/books", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const seriesId = parseInt(req.params.seriesId);
    
    try {
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to series" });
      }
      
      const { title, position, status } = req.body;
      
      // Get current books to determine the next position if not provided
      let bookPosition = position;
      if (!bookPosition) {
        const books = await storage.getBooksBySeriesId(seriesId);
        bookPosition = books.length + 1;
      }
      
      const newBook = await storage.createBook({
        seriesId,
        title,
        position: bookPosition,
        status,
      });
      
      res.status(201).json(newBook);
    } catch (error) {
      console.error("Error creating book:", error);
      res.status(500).json({ message: "Error creating book" });
    }
  });

  app.put("/api/books/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const bookId = parseInt(req.params.id);
    
    try {
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      const series = await storage.getSeries(book.seriesId);
      
      if (series?.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to book" });
      }
      
      const updatedBook = await storage.updateBook(bookId, req.body);
      res.json(updatedBook);
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(500).json({ message: "Error updating book" });
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const bookId = parseInt(req.params.id);
    
    try {
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      const series = await storage.getSeries(book.seriesId);
      
      if (series?.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to book" });
      }
      
      await storage.deleteBook(bookId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Error deleting book" });
    }
  });

  // Character routes
  app.get("/api/series/:seriesId/characters", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const seriesId = parseInt(req.params.seriesId);
    
    try {
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to series" });
      }
      
      const characters = await storage.getCharactersBySeriesId(seriesId);
      res.json(characters);
    } catch (error) {
      console.error("Error fetching characters:", error);
      res.status(500).json({ message: "Error fetching characters" });
    }
  });

  app.post("/api/series/:seriesId/characters", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const seriesId = parseInt(req.params.seriesId);
    
    try {
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to series" });
      }
      
      const { name, role, occupation, description, background, bookAppearances } = req.body;
      
      const newCharacter = await storage.createCharacter({
        userId,
        seriesId,
        name,
        role,
        occupation,
        description,
        background,
        bookAppearances,
      });
      
      res.status(201).json(newCharacter);
    } catch (error) {
      console.error("Error creating character:", error);
      res.status(500).json({ message: "Error creating character" });
    }
  });

  app.put("/api/characters/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const characterId = parseInt(req.params.id);
    
    try {
      const character = await storage.getCharacter(characterId);
      
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      if (character.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to character" });
      }
      
      const updatedCharacter = await storage.updateCharacter(characterId, req.body);
      res.json(updatedCharacter);
    } catch (error) {
      console.error("Error updating character:", error);
      res.status(500).json({ message: "Error updating character" });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const characterId = parseInt(req.params.id);
    
    try {
      const character = await storage.getCharacter(characterId);
      
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      if (character.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to character" });
      }
      
      await storage.deleteCharacter(characterId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting character:", error);
      res.status(500).json({ message: "Error deleting character" });
    }
  });

  // Location routes
  app.get("/api/series/:seriesId/locations", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const seriesId = parseInt(req.params.seriesId);
    
    try {
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to series" });
      }
      
      const locations = await storage.getLocationsBySeriesId(seriesId);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Error fetching locations" });
    }
  });

  app.post("/api/series/:seriesId/locations", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const seriesId = parseInt(req.params.seriesId);
    
    try {
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to series" });
      }
      
      const { name, description, type, bookAppearances } = req.body;
      
      const newLocation = await storage.createLocation({
        userId,
        seriesId,
        name,
        description,
        type,
        bookAppearances,
      });
      
      res.status(201).json(newLocation);
    } catch (error) {
      console.error("Error creating location:", error);
      res.status(500).json({ message: "Error creating location" });
    }
  });

  // Timeline routes
  app.get("/api/series/:seriesId/timeline", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const seriesId = parseInt(req.params.seriesId);
    
    try {
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to series" });
      }
      
      const timelineEvents = await storage.getTimelineEventsBySeriesId(seriesId);
      res.json(timelineEvents);
    } catch (error) {
      console.error("Error fetching timeline events:", error);
      res.status(500).json({ message: "Error fetching timeline events" });
    }
  });

  app.post("/api/series/:seriesId/timeline", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    const seriesId = parseInt(req.params.seriesId);
    
    try {
      const series = await storage.getSeries(seriesId);
      
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      
      if (series.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to series" });
      }
      
      const { title, description, date, characters, locations, bookId } = req.body;
      
      const newEvent = await storage.createTimelineEvent({
        userId,
        seriesId,
        title,
        description,
        date,
        characters,
        locations,
        bookId: bookId ? parseInt(bookId) : null,
      });
      
      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Error creating timeline event:", error);
      res.status(500).json({ message: "Error creating timeline event" });
    }
  });

  // Writing session routes
  app.post("/api/writing-sessions", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    
    try {
      const { bookId, seriesId, wordCount, duration } = req.body;
      
      // Validate that either bookId or seriesId is provided
      if (!bookId && !seriesId) {
        return res.status(400).json({ message: "Either bookId or seriesId must be provided" });
      }
      
      // If bookId is provided, check that the book exists and belongs to the user
      if (bookId) {
        const book = await storage.getBook(parseInt(bookId));
        if (!book) {
          return res.status(404).json({ message: "Book not found" });
        }
        
        const series = await storage.getSeries(book.seriesId);
        if (series?.userId !== userId) {
          return res.status(403).json({ message: "Unauthorized access to book" });
        }
      }
      
      // If seriesId is provided, check that the series exists and belongs to the user
      if (seriesId && !bookId) {
        const series = await storage.getSeries(parseInt(seriesId));
        if (!series) {
          return res.status(404).json({ message: "Series not found" });
        }
        
        if (series.userId !== userId) {
          return res.status(403).json({ message: "Unauthorized access to series" });
        }
      }
      
      const newSession = await storage.createWritingSession({
        userId,
        bookId: bookId ? parseInt(bookId) : null,
        seriesId: seriesId ? parseInt(seriesId) : null,
        wordCount: parseInt(wordCount),
        duration: duration ? parseInt(duration) : null,
      });
      
      res.status(201).json(newSession);
    } catch (error) {
      console.error("Error creating writing session:", error);
      res.status(500).json({ message: "Error creating writing session" });
    }
  });

  app.get("/api/writing-sessions", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    
    try {
      const sessions = await storage.getWritingSessionsByUserId(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching writing sessions:", error);
      res.status(500).json({ message: "Error fetching writing sessions" });
    }
  });

  // User stats route
  app.get("/api/user-stats", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    
    try {
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Error fetching user stats" });
    }
  });

  // Achievements route
  app.get("/api/achievements", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = (req.user as any).id;
    
    try {
      const achievements = await storage.getAchievementsByUserId(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Error fetching achievements" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
