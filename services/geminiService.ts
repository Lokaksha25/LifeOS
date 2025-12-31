import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeJournalEntry = async (entry: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a thoughtful, minimalist life coach. Analyze this journal entry and provide a brief, encouraging reflection (max 2 sentences) that helps the user find clarity. Entry: "${entry}"`,
    });
    return response.text || "Keep writing to find your clarity.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate reflection at this moment.";
  }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Audio } },
          { text: "Please transcribe the following audio file exactly as spoken. Do not add any commentary." }
        ]
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    throw new Error("Failed to transcribe audio.");
  }
};
