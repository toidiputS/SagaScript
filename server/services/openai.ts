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
  let basePrompt = "Create a highly detailed fantasy map with the following description: ";
  basePrompt += options.description;
  
  // Add style-specific elements
  switch (options.style) {
    case 'fantasy':
      basePrompt += " The map should have fantasy elements like dragons, castles, and magical forests.";
      break;
    case 'sci-fi':
      basePrompt += " The map should have sci-fi elements like futuristic cities, space stations, and advanced technology.";
      break;
    case 'historical':
      basePrompt += " The map should have historical elements reminiscent of ancient civilizations and traditional cartography.";
      break;
    case 'modern':
      basePrompt += " The map should have modern elements like cities, highways, and contemporary landmarks.";
      break;
    case 'post-apocalyptic':
      basePrompt += " The map should have post-apocalyptic elements showing ruins, wasteland, and nature reclaiming civilization.";
      break;
  }
  
  // Add art style-specific elements
  switch (options.artStyle) {
    case 'ink-and-parchment':
      basePrompt += " Render the map in an ink and parchment style like ancient manuscripts, with hand-drawn details and aged paper texture.";
      break;
    case 'watercolor':
      basePrompt += " Render the map in a beautiful watercolor painting style with soft color transitions and artistic brush strokes.";
      break;
    case 'isometric':
      basePrompt += " Render the map in an isometric perspective with 3D-like elements that pop up from the surface.";
      break;
    case 'topographical':
      basePrompt += " Render the map in a topographical style with contour lines indicating elevation, mountains, and valleys.";
      break;
  }

  // General map quality instructions
  basePrompt += " Make sure all locations are clearly labeled. Include a compass rose, scale bar, and decorative border. The map should look professional and highly detailed.";
  
  return basePrompt;
}

/**
 * Generate a fantasy map image based on a description
 */
export async function generateMapImage(options: MapGenerationOptions): Promise<MapGenerationResult> {
  try {
    const prompt = generateMapPrompt(options);
    
    console.log(`Generating map image with prompt: ${prompt}`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
    });
    
    const imageUrl = response.data[0].url || '';
    
    // Create the result object
    const result: MapGenerationResult = {
      id: `map-${Date.now()}`,
      imageUrl,
      prompt,
      description: options.description,
      style: options.style,
      artStyle: options.artStyle,
      seriesId: options.seriesId,
      locationId: options.locationId,
      createdAt: new Date(),
    };
    
    return result;
  } catch (error) {
    console.error("Error generating map image:", error);
    throw new Error("Failed to generate map image");
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