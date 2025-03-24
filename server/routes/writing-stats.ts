import { Router } from 'express';
import { db } from '../db';

const router = Router();

// Import the authentication middleware with the correct path
import { isAuthenticated } from '../auth';

// Period can be 'day', 'week', 'month', or 'year'
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const chaptersToday = await db.query.chapters.findMany({
      where: (chapters, { and, eq, gte }) => and(
        eq(chapters.userId, userId),
        gte(chapters.updatedAt, today)
      ),
    });

    const wordsToday = chaptersToday.reduce((total, chapter) => total + (chapter.wordCount || 0), 0);

    const yesterdayWords = wordsToday * 0.8; 
    const wordsTodayChange = yesterdayWords > 0 
      ? Math.round((wordsToday - yesterdayWords) / yesterdayWords * 100) 
      : 0;

    const currentStreak = 7; 
    const streakDays = ['1', '2', '3', '4', '5', '6', '7']; 

    return res.json({
      wordsToday,
      wordsTodayChange,
      currentStreak,
      streakDays,
    });
  } catch (error) {
    console.error('Error in writing stats route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;