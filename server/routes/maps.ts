
import { Router } from 'express';
import { db } from '../db';
import { isAuthenticated } from '../auth';

const router = Router();

// Get recent maps for the user
router.get('/recent', isAuthenticated, async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Query the database for recent maps
    // Adjust this query based on your actual database schema
    const recentMaps = await db.query(`
      SELECT * FROM maps
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `, [userId]);
    
    res.json(recentMaps.rows);
  } catch (error) {
    console.error('Error fetching recent maps:', error);
    res.status(500).json({ error: 'Failed to fetch recent maps' });
  }
});

// Add other map-related routes as needed

export default router;
