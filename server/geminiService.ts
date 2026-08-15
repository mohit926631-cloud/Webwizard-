import { GoogleGenAI } from "@google/genai";
import { generateDemoWebsite } from "../src/services/demoAIEngine";

export interface GeminiRequestOptions {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}

/**
 * Robust JSON extraction and parser for Gemini responses
 */
export function cleanAndParseJSON(rawText: string): any {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty or invalid response from AI model");
  }

  let cleaned = rawText.trim();

  // Strip Markdown code blocks like ```json ... ``` or ``` ... ```
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  // Find the first '{' and last '}'
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err: any) {
    // Attempt minor repair for common JSON escaping quirks
    try {
      const repaired = cleaned
        .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas
        .replace(/[\u0000-\u001F]+/g, (match) => {
          if (match === "\n") return "\\n";
          if (match === "\r") return "\\r";
          if (match === "\t") return "\\t";
          return "";
        });
      return JSON.parse(repaired);
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${err?.message || "Invalid JSON"}`);
    }
  }
}

/**
 * Execute Gemini model with automatic fallback between model tiers
 */
export async function executeGeminiWithFallback(
  ai: GoogleGenAI,
  options: GeminiRequestOptions
): Promise<{ text: string }> {
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: options.responseMimeType,
          temperature: options.temperature,
        },
      });

      const text = response.text || "";
      if (text.trim().length > 0) {
        return { text };
      }
    } catch (err: any) {
      console.warn(`[Gemini execution with ${model} failed]:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed to generate content");
}

/**
 * Generate a rich, responsive procedural website fallback when AI is busy or in demo mode
 */
export function generateProceduralWebsite(
  prompt: string,
  category?: string
): { html: string; css: string; js: string; readme: string } {
  const demoResult = generateDemoWebsite(prompt, category);
  return {
    html: demoResult.files["index.html"] || "<!DOCTYPE html><html><body><h1>Website</h1></body></html>",
    css: demoResult.files["style.css"] || "body { background: #0f172a; color: white; }",
    js: demoResult.files["script.js"] || "console.log('Website loaded');",
    readme: demoResult.files["README.md"] || `# ${prompt}\n\nGenerated with VERVOX AI.`,
  };
}
