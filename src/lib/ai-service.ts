import { getSecrets } from "./server-store";
import { callGeminiAPI } from "./gemini";
import { callDeepSeekAPI } from "./deepseek";

export const generateAIResponse = async (
  model: string,
  systemPrompt: string,
  userMessage: string,
  history: { sender: "user" | "assistant" | "system"; content: string }[]
): Promise<string> => {
  const secrets = getSecrets();
  const isDeepSeek = model && model.startsWith("deepseek-");

  const optimizedSystemPrompt = `${systemPrompt || ""}\n\n[SYSTEM RULE: CONVERSATIONAL CHATBOT BEHAVIOR]\nYou are a live chat assistant. Answer the user's query in a natural, engaging, and friendly conversational manner. Keep your response brief, simple, and directly to-the-point (maximum 2-3 sentences or a short paragraph). Do NOT output structural sections, internal instructions, or documentation headers (like "SECTION I", "Identity", "COGNTIVE WORKFLOW", etc.) from your configuration. Always stay in character.`;

  if (isDeepSeek) {
    if (!secrets.deepseekKey) {
      throw new Error("DeepSeek API key is not configured. Please add DEEPSEEK_API_KEY to your environment variables.");
    }
    return callDeepSeekAPI(secrets.deepseekKey, model, optimizedSystemPrompt, userMessage, history);
  } else {
    if (!secrets.geminiKey) {
      throw new Error("Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.");
    }
    return callGeminiAPI(secrets.geminiKey, model || "models/gemini-flash-lite-latest", optimizedSystemPrompt, userMessage, history);
  }
};
