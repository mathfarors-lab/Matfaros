
import { GoogleGenAI, Type } from "@google/genai";

export interface SyntaxError {
  line: number;
  message: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to handle rate limiting with exponential backoff
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED");
    if (isRateLimit && retries > 0) {
      console.warn(`Gemini rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function detectLanguage(code: string): Promise<string> {
  if (!code.trim()) return 'plain text';
  
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Identify the programming language of the following code snippet. Return ONLY the name of the language (e.g. "javascript", "python", "rust", "c", "cpp", "csharp", "r", "scala", "perl", "matlab"). 
      Key context: 
      - If it uses #include <iostream> or std::, it's "cpp".
      - If it uses <- for assignment or library(), it's "r".
      - If it uses trait, case class, or object keyword, it's "scala".
      - If it uses my $ or sigils like @ or %, it's "perl".
      - If it uses function ... end with % comments, it's "matlab".
      Return ONLY the slug identifier.\n\nCode:\n${code.substring(0, 1000)}`,
    });
    return response.text?.trim().toLowerCase() || 'javascript';
  });
}

export async function findSyntaxErrors(code: string, language: string): Promise<SyntaxError[]> {
  if (!code.trim() || language === 'plain text') return [];

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following ${language} code for syntax errors. Return a JSON list of errors. Each error should have a 'line' number and a 'message' describing the error. If there are no errors, return an empty list [].\n\nCode:\n${code.substring(0, 2000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              line: { type: Type.NUMBER },
              message: { type: Type.STRING },
            },
            required: ['line', 'message'],
          },
        },
      },
    });
    return JSON.parse(response.text?.trim() || '[]');
  });
}
