import { Router } from 'express';
import { isAuthenticated as auth } from '../auth'; // Import the auth middleware
import { db } from '../db';

const router = Router();

// Get writing statistics for the current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // For this example, we'll calculate word count for today based on word count from chapters
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get chapters modified today
    const chaptersToday = await db.query.chapters.findMany({
      where: (chapters, { and, eq, gte }) => and(
        eq(chapters.userId, userId),
        gte(chapters.updatedAt, today)
      ),
    });

    // Calculate total words written today
    const wordsToday = chaptersToday.reduce((total, chapter) => total + (chapter.wordCount || 0), 0);

    // Calculate change from yesterday (for demonstration)
    const yesterdayWords = wordsToday * 0.8; // Simplified mock data
    const wordsTodayChange = yesterdayWords > 0 
      ? Math.round((wordsToday - yesterdayWords) / yesterdayWords * 100) 
      : 0;

    // Calculate streak (for demonstration)
    // In a real app, you would query the database for consecutive days of writing
    const currentStreak = 7; // Simplified mock data

    // Generate mock streak days (in a real app, these would be the days the user wrote)
    const streakDays = ['1', '2', '3', '4', '5', '6', '7']; // Simplified mock data

    return res.json({
      wordsToday,
      wordsTodayChange,
      currentStreak,
      streakDays,
    });
  } catch (error) {
    console.error('Error fetching writing stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;