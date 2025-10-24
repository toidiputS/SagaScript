import type { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "../storage";

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './public/avatars';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with user ID and timestamp
    const userId = (req.user as any)?.id;
    const ext = path.extname(file.originalname);
    const filename = `avatar-${userId}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// File filter for images only
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized - Please log in" });
};

export default function setupProfileRoutes(app: Express) {
  // Get comprehensive profile data
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user statistics
      const stats = await storage.getUserStats(userId);
      
      // Get user achievements
      const userAchievements = await storage.getUserAchievements(userId);
      
      // Get current subscription
      const subscription = await storage.getUserSubscription(userId);
      let subscriptionPlan = null;
      if (subscription) {
        subscriptionPlan = await storage.getSubscriptionPlan(subscription.planId);
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      const profile = {
        ...userWithoutPassword,
        stats: stats || {
          totalWords: 0,
          totalChapters: 0,
          totalBooks: 0,
          totalSeries: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageWordsPerDay: 0,
          totalWritingDays: 0,
          joinDate: user.createdAt,
        },
        achievements: userAchievements || [],
        subscription: subscription ? {
          ...subscription,
          plan: subscriptionPlan
        } : null
      };

      res.status(200).json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: "Error fetching profile data" });
    }
  });

  // Update profile information
  app.put("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const updates = req.body;
      
      // Validate allowed fields
      const allowedFields = ['displayName', 'email', 'bio', 'location', 'website', 'socialLinks'];
      const filteredUpdates: any = {};
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      }

      // Validate email format if provided
      if (filteredUpdates.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(filteredUpdates.email)) {
          return res.status(400).json({ message: "Invalid email format" });
        }
      }

      // Validate website URL if provided
      if (filteredUpdates.website) {
        try {
          new URL(filteredUpdates.website);
        } catch {
          return res.status(400).json({ message: "Invalid website URL" });
        }
      }

      const updatedUser = await storage.updateUser(userId, filteredUpdates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });

  // Upload avatar
  app.post("/api/profile/avatar", isAuthenticated, upload.single('avatar'), async (req, res) => {
    try {
      const userId = req.user!.id;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Generate avatar URL
      const avatarUrl = `/avatars/${req.file.filename}`;
      
      // Update user's avatar in database
      const updatedUser = await storage.updateUser(userId, { avatar: avatarUrl });
      
      if (!updatedUser) {
        // Clean up uploaded file if user update fails
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "User not found" });
      }

      // Clean up old avatar file if it exists
      const oldUser = await storage.getUser(userId);
      if (oldUser?.avatar && oldUser.avatar !== avatarUrl) {
        const oldAvatarPath = `./public${oldUser.avatar}`;
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      res.status(200).json({ 
        avatarUrl,
        message: "Avatar uploaded successfully" 
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ message: "Error uploading avatar" });
    }
  });

  // Get recent activity
  app.get("/api/profile/recent-activity", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // For now, return empty array - this will be implemented when we have activity tracking
      const recentActivity: any[] = [];
      
      res.status(200).json(recentActivity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      res.status(500).json({ message: "Error fetching recent activity" });
    }
  });

  // Get writing statistics with period filtering
  app.get("/api/writing-stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const period = req.query.period as 'day' | 'week' | 'month' | 'year' || 'week';
      
      // Get writing statistics from storage
      const stats = await storage.getWritingStatsByPeriod(userId, period);
      
      res.status(200).json(stats || []);
    } catch (error) {
      console.error('Error fetching writing statistics:', error);
      res.status(500).json({ message: "Error fetching writing statistics" });
    }
  });

  // Get comprehensive user statistics
  app.get("/api/user-stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get comprehensive user statistics
      const stats = await storage.getUserStats(userId);
      
      if (!stats) {
        return res.status(404).json({ message: "User statistics not found" });
      }

      res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      res.status(500).json({ message: "Error fetching user statistics" });
    }
  });

  // Get writing streak information
  app.get("/api/writing-streak", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Try to get existing writing streak
      let streak = await storage.getWritingStreak(userId);
      
      if (!streak) {
        // Create initial streak record if it doesn't exist
        streak = await storage.createWritingStreak({
          userId,
          currentStreak: 0,
          longestStreak: 0,
          totalWritingDays: 0
        });
      }

      res.status(200).json(streak);
    } catch (error) {
      console.error('Error fetching writing streak:', error);
      res.status(500).json({ message: "Error fetching writing streak" });
    }
  });

  // Get writing goals
  app.get("/api/writing-goals", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const goals = await storage.getUserWritingGoals(userId);
      
      res.status(200).json(goals || []);
    } catch (error) {
      console.error('Error fetching writing goals:', error);
      res.status(500).json({ message: "Error fetching writing goals" });
    }
  });

  // Create a new writing goal
  app.post("/api/writing-goals", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const goalData = req.body;
      
      // Validate required fields
      if (!goalData.title || !goalData.goalType || !goalData.targetValue) {
        return res.status(400).json({ message: "Title, goal type, and target value are required" });
      }

      const newGoal = await storage.createWritingGoal({
        ...goalData,
        userId
      });

      res.status(201).json(newGoal);
    } catch (error) {
      console.error('Error creating writing goal:', error);
      res.status(500).json({ message: "Error creating writing goal" });
    }
  });

  // Update user preferences
  app.put("/api/user/preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { preferences } = req.body;
      
      if (!preferences) {
        return res.status(400).json({ message: "Preferences data is required" });
      }

      // Validate preferences structure
      const validThemes = ['light', 'dark', 'spooky', 'system'];
      const validVisibility = ['public', 'private'];
      
      if (preferences.theme && !validThemes.includes(preferences.theme)) {
        return res.status(400).json({ message: "Invalid theme value" });
      }
      
      if (preferences.privacy?.profileVisibility && !validVisibility.includes(preferences.privacy.profileVisibility)) {
        return res.status(400).json({ message: "Invalid profile visibility value" });
      }

      const updatedUser = await storage.updateUser(userId, { preferences });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ 
        message: "Preferences updated successfully",
        preferences: updatedUser.preferences 
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ message: "Error updating preferences" });
    }
  });

  // Change password
  app.put("/api/user/password", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      // Verify current password
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const bcrypt = require('bcrypt');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await storage.updateUser(userId, { password: hashedNewPassword });

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: "Error updating password" });
    }
  });

  // Get plan usage tracking
  app.get("/api/user/usage", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get user's current subscription
      const subscription = await storage.getUserSubscription(userId);
      let subscriptionPlan = null;
      
      if (subscription) {
        subscriptionPlan = await storage.getSubscriptionPlan(subscription.planId);
      }
      
      // Get user's current usage
      const userSeries = await storage.getAllSeriesByUser(userId);
      const userStats = await storage.getUserStats(userId);
      
      // Calculate usage based on plan limits
      const defaultLimits = {
        series: 1,
        aiPrompts: 10,
        collaborators: 0,
        storage: 100 // MB
      };
      
      const planLimits = subscriptionPlan?.limits as any || defaultLimits;
      
      // Get current month's AI prompt usage (simplified - would need actual tracking)
      const currentDate = new Date();
      const resetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      
      const usage = {
        series: {
          used: userSeries.length,
          limit: planLimits.series || defaultLimits.series
        },
        aiPrompts: {
          used: 0, // Would need actual AI prompt tracking
          limit: planLimits.aiPrompts || defaultLimits.aiPrompts,
          resetDate: resetDate.toISOString()
        },
        collaborators: {
          used: 0, // Would need actual collaborator counting
          limit: planLimits.collaborators || defaultLimits.collaborators
        },
        storage: {
          used: 0, // Would need actual storage calculation
          limit: planLimits.storage || defaultLimits.storage
        }
      };

      res.status(200).json(usage);
    } catch (error) {
      console.error('Error fetching plan usage:', error);
      res.status(500).json({ message: "Error fetching plan usage" });
    }
  });

  // Export user data
  app.post("/api/user/export", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get all user data
      const user = await storage.getUser(userId);
      const userSeries = await storage.getAllSeriesByUser(userId);
      const userAchievements = await storage.getUserAchievements(userId);
      const writingStats = await storage.getWritingStatsByUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all books and chapters for the user's series
      const allBooks = [];
      const allChapters = [];
      const allCharacters = [];
      const allLocations = [];
      
      for (const series of userSeries) {
        const books = await storage.getBooksBySeries(series.id);
        allBooks.push(...books);
        
        const characters = await storage.getCharactersBySeries(series.id);
        allCharacters.push(...characters);
        
        const locations = await storage.getLocationsBySeries(series.id);
        allLocations.push(...locations);
        
        for (const book of books) {
          const chapters = await storage.getChaptersByBook(book.id);
          allChapters.push(...chapters);
        }
      }

      // Prepare comprehensive export data (excluding sensitive information)
      const exportData = {
        profile: {
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          bio: user.bio,
          location: user.location,
          website: user.website,
          socialLinks: user.socialLinks,
          preferences: user.preferences,
          createdAt: user.createdAt,
        },
        series: userSeries || [],
        books: allBooks || [],
        chapters: allChapters || [],
        characters: allCharacters || [],
        locations: allLocations || [],
        achievements: userAchievements || [],
        writingStats: writingStats || [],
        statistics: await storage.getUserStats(userId) || {},
        exportedAt: new Date().toISOString(),
      };

      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="sagascript-data-${userId}-${Date.now()}.json"`);
      
      res.status(200).json(exportData);
    } catch (error) {
      console.error('Error exporting user data:', error);
      res.status(500).json({ message: "Error exporting user data" });
    }
  });

  // Delete user account
  app.delete("/api/user/delete", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get user to check if avatar needs cleanup
      const user = await storage.getUser(userId);
      
      // Delete user data (for now, just return success - actual deletion would need cascade handling)
      // const deleted = await storage.deleteUser(userId);
      
      // Clean up avatar file if it exists
      if (user?.avatar) {
        const avatarPath = `./public${user.avatar}`;
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }

      // Log out the user
      req.logout((err: any) => {
        if (err) {
          console.error('Error logging out user after deletion:', err);
        }
      });

      res.status(200).json({ message: "Account deletion requested - contact support to complete" });
    } catch (error) {
      console.error('Error deleting user account:', error);
      res.status(500).json({ message: "Error deleting user account" });
    }
  });
}