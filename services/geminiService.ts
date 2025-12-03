import { GoogleGenAI, Type } from "@google/genai";
import { Mission } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MISSION_SYSTEM_PROMPT = `
You are a supportive, gentle life coach designed to help people with social anxiety or low energy (hikikomori) take very small steps ("Small Step Challenge").
Generate missions that are concrete, achievable in under 15 minutes, and low pressure.
Categories:
- Social: very small interactions (e.g., say thanks to cashier, comment online).
- Health: simple movement or sunlight.
- Organization: tidying a small area.
- Self-care: mindfulness or hygiene.

Output JSON only.
`;

export const generateMissions = async (): Promise<Mission[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate 3 different 'small step' missions for today. Vary the categories.",
      config: {
        systemInstruction: MISSION_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] },
              credits: { type: Type.NUMBER },
              category: { type: Type.STRING, enum: ["social", "health", "organization", "self-care"] },
            },
            required: ["id", "title", "description", "difficulty", "credits", "category"],
          },
        },
      },
    });

    let jsonString = response.text || "[]";
    // Sanitize markdown if present
    jsonString = jsonString.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    
    const missions = JSON.parse(jsonString);
    return missions.map((m: any) => ({ ...m, completed: false }));
  } catch (error) {
    console.error("Gemini Mission Gen Error:", error);
    // Fallback missions if API fails
    return [
      {
        id: "fallback-1",
        title: "창문 열고 환기하기",
        description: "신선한 공기를 마시며 1분간 심호흡을 해보세요.",
        difficulty: "easy",
        credits: 50,
        category: "health",
        completed: false
      },
      {
        id: "fallback-2",
        title: "책상 정리 5분",
        description: "눈에 보이는 쓰레기만이라도 치워보세요.",
        difficulty: "medium",
        credits: 100,
        category: "organization",
        completed: false
      },
      {
        id: "fallback-3",
        title: "따뜻한 차 한 잔",
        description: "좋아하는 차나 물을 마시며 여유를 가지세요.",
        difficulty: "easy",
        credits: 50,
        category: "self-care",
        completed: false
      }
    ];
  }
};

export const getEncouragement = async (missionTitle: string, reflection?: string): Promise<string> => {
  try {
    let prompt = `User just completed the mission: "${missionTitle}".`;
    if (reflection) {
      prompt += ` User's reflection: "${reflection}".`;
    }
    prompt += ` Give them a short, warm, 1-sentence validation or compliment in Korean. If they wrote a reflection, acknowledge it gently.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "정말 잘하셨어요! 멋진 한 걸음입니다.";
  } catch (error) {
    return "수고하셨어요! 오늘의 작은 성공을 축하합니다.";
  }
};