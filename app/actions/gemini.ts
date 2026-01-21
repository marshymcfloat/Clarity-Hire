"use server";

import { GoogleGenAI } from "@google/genai";

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
