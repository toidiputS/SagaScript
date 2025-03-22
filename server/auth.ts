import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import MemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Use the storage's session store which is either MemoryStore or PostgreSQLStore
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "saga-scribe-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to false for local development, true in production
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      sameSite: 'lax',
    },
    store: storage.sessionStore, // Use the storage implementation's session store
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        const isPasswordValid = await comparePasswords(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || undefined);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("[AUTH] Register request received:", req.body);
      
      // Validate required fields
      if (!req.body.username || !req.body.password || !req.body.displayName) {
        console.log("[AUTH] Registration failed: Missing required fields");
        return res.status(400).json({ 
          message: "Missing required fields. Please provide username, password, and displayName."
        });
      }
      
      // Check username length
      if (req.body.username.length < 3) {
        console.log("[AUTH] Registration failed: Username too short");
        return res.status(400).json({ 
          message: "Username must be at least 3 characters long"
        });
      }
      
      // Check password length
      if (req.body.password.length < 6) {
        console.log("[AUTH] Registration failed: Password too short");
        return res.status(400).json({ 
          message: "Password must be at least 6 characters long"
        });
      }
      
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("[AUTH] Registration failed: Username already exists");
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Default plan to apprentice if not provided
      const userData = {
        ...req.body,
        plan: req.body.plan || "apprentice",
      };

      const hashedPassword = await hashPassword(userData.password);
      
      console.log("[AUTH] Creating user with data:", { 
        ...userData, 
        password: "[REDACTED]" 
      });
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      console.log("[AUTH] User created successfully, ID:", user.id);

      req.login(user, (err) => {
        if (err) {
          console.log("[AUTH] Login after registration failed:", err);
          return next(err);
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        console.log("[AUTH] Registration successful, user logged in");
        res.status(201).json(userWithoutPassword);
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      // Using JSON.stringify to safely log the unknown error
      console.log("[AUTH] Registration error:", 
        error instanceof Error ? error.message : JSON.stringify(error));
      res.status(500).json({ message: "Registration failed: " + errorMessage });
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      console.log("[AUTH] Login attempt for:", req.body.username);
      
      // Validate required fields
      if (!req.body.username || !req.body.password) {
        console.log("[AUTH] Login failed: Missing required fields");
        return res.status(400).json({ 
          message: "Missing required fields. Please provide username and password."
        });
      }
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          console.log("[AUTH] Login error:", err);
          return res.status(500).json({ message: "Login error: " + err.message });
        }
        
        if (!user) {
          console.log("[AUTH] Login failed:", info?.message || "Authentication failed");
          return res.status(401).json({ message: info?.message || "Invalid username or password" });
        }
        
        req.login(user, (err: any) => {
          if (err) {
            console.log("[AUTH] Login session error:", err);
            return res.status(500).json({ message: "Session creation failed: " + err.message });
          }
          
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          console.log("[AUTH] Login successful for user:", user.id);
          res.status(200).json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      // Using JSON.stringify to safely log the unknown error
      console.log("[AUTH] Unexpected login error:", 
        error instanceof Error ? error.message : JSON.stringify(error));
      res.status(500).json({ message: "Login failed: " + errorMessage });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err: any) => {
      if (err) return res.status(500).json({ message: "Error during logout" });
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    res.status(200).json(userWithoutPassword);
  });
}