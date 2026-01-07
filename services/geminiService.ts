import { GoogleGenAI, Type } from "@google/genai";
import { MorningQuestion, UserProgress, AIPassProbability, MorningTopic, AfternoonTopic, AfternoonQuestion } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In a real environment, the key should be set.
  console.warn("API_KEY environment variable not set. Using a placeholder. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });

const questionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: 'A unique ID for the question' },
      question: { type: Type.STRING, description: 'The question text' },
      options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of 4 possible answers' },
      correctAnswer: { type: Type.STRING, description: 'The correct answer text from the options' },
      explanation: { type: Type.STRING, description: 'A detailed explanation of the correct answer' },
    },
    required: ['id', 'question', 'options', 'correctAnswer', 'explanation'],
  },
};

const afternoonQuestionSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: 'A unique ID for the question' },
    title: { type: Type.STRING, description: 'The title of the problem' },
    problemStatement: { type: Type.STRING, description: 'The full problem statement, formatted with markdown for readability (e.g., code blocks, lists).' },
    modelAnswer: { type: Type.STRING, description: 'A detailed model answer.' },
    explanation: { type: Type.STRING, description: 'A detailed explanation of the answer and underlying concepts.' },
  },
  required: ['id', 'title', 'problemStatement', 'modelAnswer', 'explanation'],
};


export const generateMorningQuestions = async (topic: MorningTopic, count: number, lang: 'ja' | 'en'): Promise<MorningQuestion[]> => {
  try {
    const langPrompt = lang === 'ja'
      ? '日本語で'
      : 'in English';

    const prompt = `基本情報技術者試験の午前問題（${topic}分野）を${count}問、${langPrompt}生成してください。各問題はユニークなID、問題文、4つの選択肢、正解の選択肢の文字列、そして詳しい解説を含めてください。`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
      },
    });

    const jsonText = response.text.trim();
    const questions = JSON.parse(jsonText);
    return questions;
  } catch (error) {
    console.error("Error generating morning questions:", error);
    // Fallback with mock data if API fails
    return Array.from({ length: count }, (_, i) => ({
      id: `mock-${topic}-${i}-${Date.now()}`,
      question: `This is a mock question #${i + 1} for topic: ${topic}. What is 2+2?`,
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      explanation: 'This is a mock explanation. 2+2 equals 4. The API call likely failed.'
    }));
  }
};

export const generateAfternoonQuestion = async (topic: AfternoonTopic, lang: 'ja' | 'en'): Promise<AfternoonQuestion> => {
    try {
        const langPrompt = lang === 'ja'
            ? '日本語で'
            : 'in English';

        const prompt = `基本情報技術者試験の午後問題（${topic}分野）を1問、${langPrompt}生成してください。問題にはユニークなID、タイトル、マークダウンで整形された問題文（コードブロックやリストを含む）、詳しい模範解答、そして根本的なコンセプトを説明する解説を含めてください。`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: afternoonQuestionSchema,
            },
        });

        const jsonText = response.text.trim();
        const question = JSON.parse(jsonText);
        return question;
    } catch (error) {
        console.error("Error generating afternoon question:", error);
        return {
            id: `mock-afternoon-${topic}-${Date.now()}`,
            title: `Mock Afternoon Question: ${topic}`,
            problemStatement: "This is a mock afternoon problem statement. The API call likely failed. Please check your API key and network connection.\n\n```sql\nSELECT * FROM users;\n```",
            modelAnswer: "This is the mock model answer.",
            explanation: "This is the mock explanation. The error occurred during the API call."
        };
    }
};

export const getAIPassProbability = async (progress: UserProgress, lang: 'ja' | 'en'): Promise<AIPassProbability> => {
    try {
        const langPrompt = lang === 'ja'
            ? '以下のJSON形式の学習データに基づき、基本情報技術者試験の合格確率を0から100の整数で予測してください。その確率に至った理由と、今後の学習に向けた具体的なアドバイスも日本語で生成してください。'
            : 'Based on the following learning data in JSON format, predict the pass probability for the FE exam as an integer between 0 and 100. Also, generate the reasoning for that probability and specific study advice for the future in English.';

        const prompt = `
${langPrompt}

学習データ:
${JSON.stringify(progress, null, 2)}
`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        probability: { type: Type.INTEGER, description: 'The predicted pass probability (0-100).' },
                        reasoning: { type: Type.STRING, description: 'The reasoning behind the prediction.' },
                        advice: { type: Type.STRING, description: 'Specific study advice for the user.' },
                    },
                    required: ['probability', 'reasoning', 'advice'],
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error getting AI pass probability:", error);
        return {
            probability: 42,
            reasoning: "Failed to connect to the AI analysis service. This is a fallback response.",
            advice: "Please check your network connection and API key. Keep studying consistently!"
        };
    }
};