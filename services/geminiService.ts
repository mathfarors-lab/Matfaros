
import { GoogleGenAI } from "@google/genai";

export async function detectLanguage(code: string): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return 'javascript';

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Identify the programming language for the following code. Respond ONLY with the name of the language.\n\nCode:\n${code.substring(0, 1000)}`,
      config: { temperature: 0.1, maxOutputTokens: 20 }
    });
    return response.text?.trim().toLowerCase() || 'javascript';
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'javascript';
  }
}

export async function findSyntaxErrors(code: string, language: string): Promise<number[]> {
  const apiKey = process.env.API_KEY;
  if (!apiKey || !code.trim()) return [];

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional code linter. Analyze this ${language} code for syntax errors. 
      Return ONLY a JSON array of line numbers (1-indexed) where errors are found. 
      If no errors, return [].
      Example: [5, 12]
      
      Code:
      ${code.substring(0, 2000)}`,
      config: { 
        temperature: 0,
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '[]');
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Syntax check failed:', error);
    return [];
  }
}
