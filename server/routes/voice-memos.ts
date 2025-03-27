import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import { z } from 'zod';
import { insertVoiceMemoSchema } from '@shared/schema';

const router = Router();

// Get all voice memos for the user (with optional filters)
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { seriesId, bookId, chapterId } = req.query;
    
    const filters: any = {};
    if (seriesId) filters.seriesId = Number(seriesId);
    if (bookId) filters.bookId = Number(bookId);
    if (chapterId) filters.chapterId = Number(chapterId);
    
    const memos = await storage.getVoiceMemos(userId, Object.keys(filters).length > 0 ? filters : undefined);
    res.json(memos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single voice memo by ID
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const memoId = Number(req.params.id);
    const userId = req.user!.id;
    
    const memo = await storage.getVoiceMemo(memoId);
    
    if (!memo) {
      return res.status(404).json({ error: 'Voice memo not found' });
    }
    
    // Check if the memo belongs to the current user
    if (memo.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(memo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new voice memo
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Validate the request body
    const memoData = insertVoiceMemoSchema.parse({
      ...req.body,
      userId
    });
    
    const newMemo = await storage.createVoiceMemo(memoData);
    res.status(201).json(newMemo);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update a voice memo
router.patch('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const memoId = Number(req.params.id);
    const userId = req.user!.id;
    
    // Check if the memo exists and belongs to the user
    const existingMemo = await storage.getVoiceMemo(memoId);
    if (!existingMemo) {
      return res.status(404).json({ error: 'Voice memo not found' });
    }
    
    if (existingMemo.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update the memo
    const updatedMemo = await storage.updateVoiceMemo(memoId, req.body);
    res.json(updatedMemo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a voice memo
router.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const memoId = Number(req.params.id);
    const userId = req.user!.id;
    
    // Check if the memo exists and belongs to the user
    const existingMemo = await storage.getVoiceMemo(memoId);
    if (!existingMemo) {
      return res.status(404).json({ error: 'Voice memo not found' });
    }
    
    if (existingMemo.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Delete the memo
    await storage.deleteVoiceMemo(memoId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;