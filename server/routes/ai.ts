
import { Router } from 'express';
import { Request, Response } from 'express';
import { 
  generateWritingSuggestions, 
  generateSingleSuggestion, 
  generateMapImage,
  saveImageFromUrl,
  type SuggestionType,
  type MapStyle,
  type ArtStyle,
  type MapGenerationOptions
} from '../services/openai';
import { z } from 'zod';
import path from 'path';
import crypto from 'crypto';

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

/**
 * Schema for map generation request
 */
const mapGenerationSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  style: z.enum(['fantasy', 'sci-fi', 'historical', 'modern', 'post-apocalyptic']),
  artStyle: z.enum(['ink-and-parchment', 'watercolor', 'isometric', 'topographical']),
  seriesId: z.number().optional(),
  locationId: z.number().optional()
});

/**
 * Generate a map from description
 */
router.post('/generate-map', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ 
        message: 'OpenAI API key is not configured',
        solution: 'Please ask an administrator to configure the OpenAI API key'
      });
    }
    
    // Validate request data
    const parsedData = mapGenerationSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        message: 'Invalid request data',
        errors: parsedData.error.format() 
      });
    }
    
    const options: MapGenerationOptions = parsedData.data;
    
    // Check if description contains potentially problematic content
    const filteredDescription = options.description
      .replace(/\bdestroy\b|\bdestruction\b|\bviolence\b|\bbattle\b|\bweapon\b|\bcombat\b|\bfight\b/gi, 'area')
      .trim();
      
    if (filteredDescription !== options.description) {
      console.log('Description was filtered for problematic content');
      options.description = filteredDescription;
    }
    
    // Generate the map image
    const result = await generateMapImage(options);
    
    // Save the image locally
    if (result.imageUrl) {
      const fileName = `map-${crypto.randomBytes(8).toString('hex')}.png`;
      
      try {
        const localUrl = await saveImageFromUrl(result.imageUrl, fileName);
        result.imageUrl = localUrl; // Replace with local URL
      } catch (saveError) {
        console.warn('Could not save image locally, using original URL:', saveError);
      }
    }
    
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error generating map:', error);
    
    // Extract detailed error message if available
    let errorMessage = 'Failed to generate map image';
    
    if (error.message) {
      if (error.message.includes('content_policy_violation') || 
          error.message.includes('safety system')) {
        errorMessage = 'Your map description contains content that violates OpenAI\'s content policy. Please revise your description.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return res.status(500).json({ 
      message: errorMessage,
      suggestion: 'Try using simpler language or avoid descriptions that might trigger content filters.'
    });
  }
});

/**
 * Get map styles and art styles
 */
router.get('/map-styles', (req: Request, res: Response) => {
  const mapStyles = [
    { value: 'fantasy', label: 'Fantasy', description: 'Medieval-inspired world with magical elements' },
    { value: 'sci-fi', label: 'Sci-Fi', description: 'Futuristic worlds with advanced technology' },
    { value: 'historical', label: 'Historical', description: 'Based on historical periods and cartography' },
    { value: 'modern', label: 'Modern', description: 'Contemporary settings with current geography' },
    { value: 'post-apocalyptic', label: 'Post-Apocalyptic', description: 'World after a catastrophic event' }
  ];
  
  const artStyles = [
    { value: 'ink-and-parchment', label: 'Ink & Parchment', description: 'Traditional hand-drawn style on aged paper' },
    { value: 'watercolor', label: 'Watercolor', description: 'Artistic watercolor painting with gentle colors' },
    { value: 'isometric', label: 'Isometric', description: '3D-like perspective with raised elements' },
    { value: 'topographical', label: 'Topographical', description: 'Elevation-focused with contour lines' }
  ];
  
  return res.status(200).json({ mapStyles, artStyles });
});

export default router;
