import { GoogleGenerativeAI } from "@google/generative-ai";
import { Book, Chapter, Character, Location, Series } from "@shared/schema";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI("AIzaSyD5k9BHXf1LQEO-6GXm3D1PWamDhp9Sgg0");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * Different types of AI writing suggestions
 */
export type SuggestionType =
  | "plotIdea"
  | "characterDevelopment"
  | "dialogue"
  | "consistency"
  | "worldBuilding"
  | "sceneDescription"
  | "conflict";

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
function generateSystemPrompt(
  context: StoryContext,
  type: SuggestionType
): string {
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
    prompt += `\nThe author is currently working on chapter "${
      context.currentChapter.title
    }" with content: "${context.currentChapter.content?.substring(0, 500)}..."`;
  }

  if (context.characters?.length) {
    prompt += `\nMain characters: ${context.characters
      .slice(0, 5)
      .map((c) => `${c.name} (${c.role})`)
      .join(", ")}`;
  }

  if (context.locations?.length) {
    prompt += `\nMain locations: ${context.locations
      .slice(0, 5)
      .map((l) => l.name)
      .join(", ")}`;
  }

  // Customize prompt based on suggestion type
  switch (type) {
    case "plotIdea":
      prompt += `\nProvide a creative plot idea or plot twist that would fit well with the current story.`;
      break;
    case "characterDevelopment":
      prompt += `\nSuggest a way to deepen one of the character's development or add complexity to their arc.`;
      break;
    case "dialogue":
      prompt += `\nSuggest an interesting dialogue exchange that could enhance the story.`;
      break;
    case "consistency":
      if (context.recentChapters?.length) {
        prompt += `\nBased on recent chapters, identify potential consistency issues or plot holes.`;
      } else {
        prompt += `\nSuggest how to maintain consistency in the story.`;
      }
      break;
    case "worldBuilding":
      prompt += `\nSuggest a world-building detail or element that could enrich the setting.`;
      break;
    case "sceneDescription":
      prompt += `\nProvide a creative scene description idea that would enhance the atmosphere or setting.`;
      break;
    case "conflict":
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
  types: SuggestionType[] = ["plotIdea", "characterDevelopment", "dialogue"],
  count: number = 3
): Promise<WritingSuggestion[]> {
  try {
    const suggestions: WritingSuggestion[] = [];

    // Generate multiple suggestions sequentially
    for (let i = 0; i < Math.min(count, types.length); i++) {
      const type = types[i % types.length];
      const systemPrompt = generateSystemPrompt(context, type);

      const prompt = `${systemPrompt}\n\nGenerate one insightful ${type} suggestion for my story.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().trim();

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
    const prompt = `You are a professional writing coach and editor. Analyze the writing sample provided and give constructive feedback on:
1. Writing style and voice
2. Pacing and structure
3. Character and dialogue strengths
4. Areas that could be improved
5. Specific suggestions for enhancement

Keep your analysis professional, supportive, and actionable. Limit your response to 300 words.

Please analyze this writing sample: "${chapterContent.substring(0, 1500)}..."`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error analyzing writing:", error);
    throw new Error("Failed to analyze writing sample");
  }
}
