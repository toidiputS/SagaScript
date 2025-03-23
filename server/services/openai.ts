import OpenAI from 'openai';
import { 
  Book, 
  Chapter, 
  Character,
  Location, 
  Series 
} from '@shared/schema';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Different types of AI writing suggestions
 */
export type SuggestionType = 
  | 'plotIdea' 
  | 'characterDevelopment' 
  | 'dialogue' 
  | 'consistency' 
  | 'worldBuilding' 
  | 'sceneDescription'
  | 'conflict';

/**
 * Structure for AI writing suggestions
 */
export interface WritingSuggestion {
  id: string;
  type: SuggestionType;
  content: string;
  seriesId?: number;
  bookId?: number;
  chapterId?: number;
  characterId?: number;
  locationId?: number;
  createdAt: Date;
}

/**
 * Data needed for the AI to generate context-aware suggestions
 */
interface StoryContext {
  series?: Series;
  books?: Book[];
  characters?: Character[];
  locations?: Location[];
  currentBook?: Book;
  currentChapter?: Chapter;
  recentChapters?: Chapter[];
}

/**
 * Generate a system prompt based on the story context and request type
 */
function generateSystemPrompt(context: StoryContext, type: SuggestionType): string {
  let prompt = `You are a professional writing assistant for a novel writing application called "Saga Scribe". 
You provide insightful, creative, and helpful writing suggestions to authors.
Your suggestions should be concise (1-3 sentences), specific, and actionable.
`;

  if (context.series) {
    prompt += `\nThe author is working on a series titled "${context.series.title}" with the following description: "${context.series.description}".`;
  }

  if (context.currentBook) {
    prompt += `\nThe current book is titled "${context.currentBook.title}" with the summary: "${context.currentBook.description}".`;
  }

  if (context.currentChapter) {
    prompt += `\nThe author is currently working on chapter "${context.currentChapter.title}" with content: "${context.currentChapter.content?.substring(0, 500)}..."`;
  }

  if (context.characters?.length) {
    prompt += `\nMain characters: ${context.characters.slice(0, 5).map(c => `${c.name} (${c.role})`).join(', ')}`;
  }

  if (context.locations?.length) {
    prompt += `\nMain locations: ${context.locations.slice(0, 5).map(l => l.name).join(', ')}`;
  }

  // Customize prompt based on suggestion type
  switch (type) {
    case 'plotIdea':
      prompt += `\nProvide a creative plot idea or plot twist that would fit well with the current story.`;
      break;
    case 'characterDevelopment':
      prompt += `\nSuggest a way to deepen one of the character's development or add complexity to their arc.`;
      break;
    case 'dialogue':
      prompt += `\nSuggest an interesting dialogue exchange that could enhance the story.`;
      break;
    case 'consistency':
      if (context.recentChapters?.length) {
        prompt += `\nBased on recent chapters, identify potential consistency issues or plot holes.`;
      } else {
        prompt += `\nSuggest how to maintain consistency in the story.`;
      }
      break;
    case 'worldBuilding':
      prompt += `\nSuggest a world-building detail or element that could enrich the setting.`;
      break;
    case 'sceneDescription':
      prompt += `\nProvide a creative scene description idea that would enhance the atmosphere or setting.`;
      break;
    case 'conflict':
      prompt += `\nSuggest an interesting conflict or tension that could drive the story forward.`;
      break;
  }

  return prompt;
}

/**
 * Generate AI writing suggestions based on the story context
 */
export async function generateWritingSuggestions(
  context: StoryContext,
  types: SuggestionType[] = ['plotIdea', 'characterDevelopment', 'dialogue'],
  count: number = 3
): Promise<WritingSuggestion[]> {
  try {
    const suggestions: WritingSuggestion[] = [];
    
    // Generate multiple suggestions sequentially
    for (let i = 0; i < Math.min(count, types.length); i++) {
      const type = types[i % types.length];
      const systemPrompt = generateSystemPrompt(context, type);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Generate one insightful ${type} suggestion for my story.`
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      });

      const content = completion.choices[0].message.content?.trim() || '';
      
      suggestions.push({
        id: `suggestion-${Date.now()}-${i}`,
        type,
        content,
        seriesId: context.series?.id,
        bookId: context.currentBook?.id,
        chapterId: context.currentChapter?.id,
        createdAt: new Date(),
      });
    }
    
    return suggestions;
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    throw new Error("Failed to generate AI writing suggestions");
  }
}

/**
 * Generate a single writing suggestion of a specific type
 */
export async function generateSingleSuggestion(
  context: StoryContext,
  type: SuggestionType
): Promise<WritingSuggestion> {
  const suggestions = await generateWritingSuggestions(context, [type], 1);
  return suggestions[0];
}

/**
 * Generate a detailed writing analysis based on chapter content
 */
export async function analyzeWriting(chapterContent: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional writing coach and editor. Analyze the writing sample provided and give constructive feedback on:
1. Writing style and voice
2. Pacing and structure
3. Character and dialogue strengths
4. Areas that could be improved
5. Specific suggestions for enhancement

Keep your analysis professional, supportive, and actionable. Limit your response to 300 words.`
        },
        {
          role: "user",
          content: `Please analyze this writing sample: "${chapterContent.substring(0, 1500)}..."`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error("Error analyzing writing:", error);
    throw new Error("Failed to analyze writing sample");
  }
}

/**
 * Different map styles available for generation
 */
export type MapStyle = 
  | 'fantasy' 
  | 'sci-fi' 
  | 'historical' 
  | 'modern' 
  | 'post-apocalyptic';

/**
 * Different art styles available for map generation
 */
export type ArtStyle = 
  | 'ink-and-parchment'
  | 'watercolor'
  | 'isometric'
  | 'topographical';

/**
 * Configuration options for the map image generation
 */
export interface MapGenerationOptions {
  description: string;
  style: MapStyle;
  artStyle: ArtStyle;
  seriesId?: number;
  locationId?: number;
}

/**
 * Result of the map generation process
 */
export interface MapGenerationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  description: string;
  style: MapStyle;
  artStyle: ArtStyle;
  seriesId?: number;
  locationId?: number;
  createdAt: Date;
}

/**
 * Generate a detailed map prompt based on the user's description and style preferences
 */
function generateMapPrompt(options: MapGenerationOptions): string {
  // Create a safer base prompt that focuses on cartography
  let basePrompt = "Create a beautiful cartographic map illustration based on this description: ";
  basePrompt += options.description;
  
  // Add style-specific elements with safer language
  switch (options.style) {
    case 'fantasy':
      basePrompt += " Include fantasy-inspired elements such as forests, mountains, and medieval settlements.";
      break;
    case 'sci-fi':
      basePrompt += " Include science fiction inspired elements such as futuristic settlements and technology.";
      break;
    case 'historical':
      basePrompt += " Include elements inspired by historical maps and traditional cartography techniques.";
      break;
    case 'modern':
      basePrompt += " Include modern geographical elements like urban areas, roads, and contemporary landmarks.";
      break;
    case 'post-apocalyptic':
      basePrompt += " Include elements showing abandoned structures and nature reclaiming settled areas.";
      break;
  }
  
  // Add art style-specific elements with safer language
  switch (options.artStyle) {
    case 'ink-and-parchment':
      basePrompt += " Use an ink drawing style on parchment texture with hand-drawn details.";
      break;
    case 'watercolor':
      basePrompt += " Use a watercolor painting style with soft color transitions and artistic brush strokes.";
      break;
    case 'isometric':
      basePrompt += " Use an isometric perspective that shows height and depth.";
      break;
    case 'topographical':
      basePrompt += " Use topographical style with contour lines showing elevation changes.";
      break;
  }

  // General map quality instructions with safer language
  basePrompt += " Include labels for locations, a compass rose, and a decorative border. Make it detailed and visually appealing.";
  
  return basePrompt;
}

/**
 * Generate a fantasy map image based on a description
 */
export async function generateMapImage(options: MapGenerationOptions): Promise<MapGenerationResult> {
  try {
    const prompt = generateMapPrompt(options);
    
    console.log(`Generating map image with prompt: ${prompt}`);
    
    // Add a retry mechanism in case of content filter issues
    let retryCount = 0;
    const maxRetries = 2;
    let response;
    let lastError;
    
    while (retryCount <= maxRetries) {
      try {
        let currentPrompt = prompt;
        
        // On retry, simplify the prompt further
        if (retryCount > 0) {
          currentPrompt = `Create a simple map illustration of ${options.description} in ${options.artStyle} style.`;
          console.log(`Retry ${retryCount} with simplified prompt: ${currentPrompt}`);
        }
        
        response = await openai.images.generate({
          model: "dall-e-3",
          prompt: currentPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard", // Changed from "hd" to "standard" to reduce potential issues
          style: "natural",    // Changed from "vivid" to "natural" to reduce potential issues
        });
        
        // If we got a successful response, break out of the retry loop
        break;
      } catch (err) {
        lastError = err;
        retryCount++;
        
        // If we've exhausted retries, throw the last error
        if (retryCount > maxRetries) {
          throw err;
        }
        
        // Wait a short time before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!response || !response.data[0].url) {
      throw new Error("Generated image URL is missing");
    }
    
    const imageUrl = response.data[0].url;
    
    // Create the result object
    const result: MapGenerationResult = {
      id: `map-${Date.now()}`,
      imageUrl,
      prompt, // Store the original prompt
      description: options.description,
      style: options.style,
      artStyle: options.artStyle,
      seriesId: options.seriesId,
      locationId: options.locationId,
      createdAt: new Date(),
    };
    
    return result;
  } catch (error: any) {
    // Extract more detailed error information if available
    let errorMessage = "Failed to generate map image";
    if (error.error?.message) {
      errorMessage = `Map generation failed: ${error.error.message}`;
    } else if (error.message) {
      errorMessage = `Map generation failed: ${error.message}`;
    }
    
    console.error("Error generating map image:", error);
    throw new Error(errorMessage);
  }
}

/**
 * Save an image from a URL to the local filesystem
 */
export async function saveImageFromUrl(imageUrl: string, fileName: string): Promise<string> {
  try {
    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'maps');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    const filePath = path.join(uploadDir, fileName);
    
    // Write the file
    await promisify(fs.writeFile)(filePath, Buffer.from(buffer));
    
    // Return the public URL
    return `/maps/${fileName}`;
  } catch (error) {
    console.error("Error saving image:", error);
    throw new Error("Failed to save image");
  }
}