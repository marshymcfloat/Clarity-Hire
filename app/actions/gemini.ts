"use server";

import { GoogleGenAI } from "@google/genai";
import { getCachedEmbedding, setCachedEmbedding } from "@/lib/cache/redis";
import crypto from "crypto";

export const geminiGenerateAction = async (inputField: string, job: string) => {
  const apiKey =
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API Key is not configured");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `generate a ${inputField} for ${job}, make it comprehensive`,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate content");
  }
};

/**
 * Generate embedding vector for text using Google's gemini-embedding-001 model
 * Includes Redis caching to reduce API calls
 *
 * @param text - Text to embed
 * @returns 768-dimensional embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey =
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API Key is not configured");
  }

  // 1. Generate content hash for cache key
  const contentHash = crypto.createHash("sha256").update(text).digest("hex");

  // 2. Check cache first
  const cached = await getCachedEmbedding(contentHash);
  if (cached) {
    console.log(
      `[CACHE HIT] Embedding for hash ${contentHash.substring(0, 8)}...`,
    );
    return cached;
  }

  console.log(
    `[CACHE MISS] Generating embedding for hash ${contentHash.substring(0, 8)}...`,
  );

  try {
    // 3. Use REST API directly for better control over parameters
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            parts: [{ text }],
          },
          outputDimensionality: 768,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Gemini Embedding API Error:", error);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.embedding || !data.embedding.values) {
      throw new Error("Invalid embedding response from API");
    }

    const vector = data.embedding.values;
    console.log(`[DEBUG] Embedding dimensions returned: ${vector.length}`);

    // 4. Cache the result
    await setCachedEmbedding(contentHash, vector);

    return vector;
  } catch (error) {
    console.error("Gemini Embedding Error:", error);
    throw new Error("Failed to generate embedding");
  }
}
