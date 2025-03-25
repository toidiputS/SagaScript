
import { Router } from 'express';
import { Request, Response } from 'express';
import { 
  generateWritingSuggestions, 
  generateSingleSuggestion, 
  type SuggestionType
} from '../services/openai';
import { z } from 'zod';

const router = Router();

/**
 * Get a signed URL from Eleven Labs for conversation
 */
router.get('/conversation/signed-url', async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agentId;
    
    if (!agentId) {
      return res.status(400).json({ message: 'Agent ID is required' });
    }
    
    if (!process.env.XI_API_KEY) {
      return res.status(500).json({ message: 'XI_API_KEY environment variable is not set' });
    }
    
    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set("xi-api-key", process.env.XI_API_KEY);
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: requestHeaders,
      }
    );
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        message: 'Error from Eleven Labs API',
        status: response.status
      });
    }
    
    const body = await response.json();
    const url = body.signed_url;
    
    return res.status(200).json({ url });
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Generate writing suggestions
 */
router.post('/writing-suggestions', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { context, types, count } = req.body;
    
    if (!context) {
      return res.status(400).json({ message: 'Story context is required' });
    }
    
    const suggestions = await generateWritingSuggestions(
      context,
      types || undefined,
      count || 3
    );
    
    return res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error generating writing suggestions:', error);
    return res.status(500).json({ message: 'Failed to generate writing suggestions' });
  }
});

/**
 * Generate a single writing suggestion
 */
router.post('/writing-suggestion', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { context, type } = req.body;
    
    if (!context || !type) {
      return res.status(400).json({ message: 'Context and suggestion type are required' });
    }
    
    const suggestion = await generateSingleSuggestion(context, type);
    
    return res.status(200).json(suggestion);
  } catch (error) {
    console.error('Error generating writing suggestion:', error);
    return res.status(500).json({ message: 'Failed to generate writing suggestion' });
  }
});



export default router;
