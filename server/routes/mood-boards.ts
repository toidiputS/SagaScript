import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import { z } from 'zod';
import { insertMoodBoardSchema, insertMoodBoardItemSchema } from '@shared/schema';

const router = Router();

// Get all mood boards for the user (with optional filters)
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { seriesId, bookId, chapterId, characterId, locationId } = req.query;
    
    const filters: any = {};
    if (seriesId) filters.seriesId = Number(seriesId);
    if (bookId) filters.bookId = Number(bookId);
    if (chapterId) filters.chapterId = Number(chapterId);
    if (characterId) filters.characterId = Number(characterId);
    if (locationId) filters.locationId = Number(locationId);
    
    const moodBoards = await storage.getMoodBoards(userId, Object.keys(filters).length > 0 ? filters : undefined);
    res.json(moodBoards);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single mood board by ID
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.params.id);
    const userId = req.user!.id;
    
    const moodBoard = await storage.getMoodBoard(boardId);
    
    if (!moodBoard) {
      return res.status(404).json({ error: 'Mood board not found' });
    }
    
    // Check if the board belongs to the current user
    if (moodBoard.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(moodBoard);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new mood board
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Validate the request body
    const boardData = insertMoodBoardSchema.parse({
      ...req.body,
      userId
    });
    
    const newBoard = await storage.createMoodBoard(boardData);
    res.status(201).json(newBoard);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update a mood board
router.patch('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.params.id);
    const userId = req.user!.id;
    
    // Check if the board exists and belongs to the user
    const existingBoard = await storage.getMoodBoard(boardId);
    if (!existingBoard) {
      return res.status(404).json({ error: 'Mood board not found' });
    }
    
    if (existingBoard.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update the board
    const updatedBoard = await storage.updateMoodBoard(boardId, req.body);
    res.json(updatedBoard);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a mood board
router.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.params.id);
    const userId = req.user!.id;
    
    // Check if the board exists and belongs to the user
    const existingBoard = await storage.getMoodBoard(boardId);
    if (!existingBoard) {
      return res.status(404).json({ error: 'Mood board not found' });
    }
    
    if (existingBoard.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Delete the board and all its items
    await storage.deleteMoodBoard(boardId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============= Mood Board Items =============

// Get all items for a mood board
router.get('/:boardId/items', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.params.boardId);
    const userId = req.user!.id;
    
    // Check if the board exists and belongs to the user
    const board = await storage.getMoodBoard(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Mood board not found' });
    }
    
    if (board.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const items = await storage.getMoodBoardItems(boardId);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new item to a mood board
router.post('/:boardId/items', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.params.boardId);
    const userId = req.user!.id;
    
    // Check if the board exists and belongs to the user
    const board = await storage.getMoodBoard(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Mood board not found' });
    }
    
    if (board.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Validate the request body
    const itemData = insertMoodBoardItemSchema.parse({
      ...req.body,
      moodBoardId: boardId
    });
    
    const newItem = await storage.createMoodBoardItem(itemData);
    res.status(201).json(newItem);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update a mood board item
router.patch('/:boardId/items/:itemId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.params.boardId);
    const itemId = Number(req.params.itemId);
    const userId = req.user!.id;
    
    // Check if the board exists and belongs to the user
    const board = await storage.getMoodBoard(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Mood board not found' });
    }
    
    if (board.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if the item exists and belongs to the board
    const item = await storage.getMoodBoardItem(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    if (item.moodBoardId !== boardId) {
      return res.status(400).json({ error: 'Item does not belong to this board' });
    }
    
    // Update the item
    const updatedItem = await storage.updateMoodBoardItem(itemId, req.body);
    res.json(updatedItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a mood board item
router.delete('/:boardId/items/:itemId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.params.boardId);
    const itemId = Number(req.params.itemId);
    const userId = req.user!.id;
    
    // Check if the board exists and belongs to the user
    const board = await storage.getMoodBoard(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Mood board not found' });
    }
    
    if (board.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if the item exists and belongs to the board
    const item = await storage.getMoodBoardItem(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    if (item.moodBoardId !== boardId) {
      return res.status(400).json({ error: 'Item does not belong to this board' });
    }
    
    // Delete the item
    await storage.deleteMoodBoardItem(itemId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update positions of items
router.post('/:boardId/items/reorder', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.params.boardId);
    const userId = req.user!.id;
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    
    // Check if the board exists and belongs to the user
    const board = await storage.getMoodBoard(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Mood board not found' });
    }
    
    if (board.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Validate that all items belong to this board
    const boardItems = await storage.getMoodBoardItems(boardId);
    const boardItemIds = new Set(boardItems.map(item => item.id));
    
    for (const item of items) {
      if (!boardItemIds.has(item.id)) {
        return res.status(400).json({ error: `Item ${item.id} does not belong to this board` });
      }
    }
    
    // Update positions
    await storage.updateMoodBoardItemPositions(items);
    
    // Return updated items
    const updatedItems = await storage.getMoodBoardItems(boardId);
    res.json(updatedItems);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;