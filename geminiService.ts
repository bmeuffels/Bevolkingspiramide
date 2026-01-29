
import { GoogleGenAI } from "@google/genai";
import { CountryType, AIInsight } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDemographicInsight = async (year: number, type: CountryType): Promise<AIInsight> => {
  const isDeveloped = type === CountryType.DEVELOPED;
  const prompt = `
    Analyze the demographic situation of a ${isDeveloped ? 'Developed' : 'Developing'} country in the year ${year}.
    Provide:
    1. A short educational title.
    2. A brief analysis of challenges (e.g., aging population, workforce shortage, or youth bulge).
    3. 3 key demographic "stats" (realistic but fictional).
    
    Return the response in JSON format matching this structure:
    {
      "title": "string",
      "content": "string",
      "keyStats": ["string", "string", "string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Failed to fetch AI insight:", error);
    return {
      title: "Demographic Trends",
      content: "As nations progress, they typically move from high birth and death rates to low birth and death rates. This transition impacts economic growth, healthcare, and social structures.",
      keyStats: ["Birth Rate: Variable", "Life Expectancy: Improving", "Median Age: Rising"]
    };
  }
};
