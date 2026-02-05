
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export const processImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string = "Please remove all watermarks, logos, brand names, and overlapping text from this image while preserving the background and subject details perfectly. Ensure the result is clean and natural."
): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please ensure process.env.API_KEY is configured.");
    throw new Error("API configuration error.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      console.warn("Gemini AI returned no results.");
      return null;
    }

    // 遍历结果寻找图像数据
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini API Request Failed:", error);
    throw error;
  }
};
