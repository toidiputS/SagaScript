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

    // Get yesterday's word count
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const chaptersYesterday = await db.query.chapters.findMany({
      where: (chapters, { and, eq, gte, lt }) => and(
        eq(chapters.userId, userId),
        gte(chapters.updatedAt, yesterday),
        lt(chapters.updatedAt, today)
      ),
    });

    const yesterdayWords = chaptersYesterday.reduce((total, chapter) => total + (chapter.wordCount || 0), 0);
    const wordsTodayChange = yesterdayWords > 0 
      ? Math.round((wordsToday - yesterdayWords) / yesterdayWords * 100) 
      : 0;

    // Calculate streak
    let currentStreak = 0;
    let streakDays = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayChapters = await db.query.chapters.findMany({
        where: (chapters, { and, eq, gte, lt }) => and(
          eq(chapters.userId, userId),
          gte(chapters.updatedAt, date),
          lt(chapters.updatedAt, nextDay)
        ),
      });
      
      if (dayChapters.length > 0) {
        currentStreak = i === currentStreak ? currentStreak + 1 : currentStreak;
        streakDays.push((i + 1).toString());
      } else if (i === 0) {
        // If no writing today, check if wrote yesterday to maintain streak
        continue;
      } else {
        break;
      }
    } 

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