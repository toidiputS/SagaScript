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

    // Get all user chapters with updates, ordered by date
    const allChapters = await db.query.chapters.findMany({
      where: (chapters, { eq }) => eq(chapters.userId, userId),
      orderBy: (chapters, { desc }) => [desc(chapters.updatedAt)]
    });

    // Calculate streak
    let currentStreak = 0;
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    
    while (true) {
      const hasUpdates = allChapters.some(chapter => {
        const chapterDate = new Date(chapter.updatedAt);
        chapterDate.setHours(0, 0, 0, 0);
        return chapterDate.getTime() === date.getTime();
      });

      if (!hasUpdates) break;
      currentStreak++;
      date.setDate(date.getDate() - 1);
    }

    // Calculate today's word count
    const chaptersToday = allChapters.filter(chapter => {
      const chapterDate = new Date(chapter.updatedAt);
      return chapterDate >= today;
    });

    const wordsToday = chaptersToday.reduce((total, chapter) => {
      const wordCount = typeof chapter.wordCount === 'number' ? chapter.wordCount : 0;
      return total + wordCount;
    }, 0);

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

    const yesterdayWords = chaptersYesterday.reduce((total, chapter) => {
      const wordCount = typeof chapter.wordCount === 'number' ? chapter.wordCount : 0;
      return total + wordCount;
    }, 0);

    const wordsTodayChange = yesterdayWords > 0 
      ? Math.round(((wordsToday - yesterdayWords) / yesterdayWords) * 100) 
      : (wordsToday > 0 ? 100 : 0);

    // Calculate streak
    let streakDays = [];
    let consecutiveDays = true;
    let dayStreak = 0;
    
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
      
      const hasWordsToday = dayChapters.some(chapter => 
        typeof chapter.wordCount === 'number' && chapter.wordCount > 0
      );
      
      if (hasWordsToday && consecutiveDays) {
        dayStreak++;
        streakDays.push((i + 1).toString());
      } else {
        consecutiveDays = false;
        if (i === 0) {
          // Reset streak if no writing today
          dayStreak = 0;
          streakDays = [];
        }
      }
    } 

    return res.json({
      wordsToday,
      wordsTodayChange,
      currentStreak: dayStreak,
      streakDays,
    });
  } catch (error) {
    console.error('Error in writing stats route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;