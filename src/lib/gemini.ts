export const callGeminiAPI = async (
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  history: { sender: "user" | "assistant" | "system"; content: string }[]
) => {
  const cleanModelName = (model || "models/gemini-flash-lite-latest").replace(/^models\//, "");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModelName}:generateContent?key=${apiKey}`;

  // Format history for Gemini API
  // Roles must be "user" or "model" (model is for assistant responses)
  const contents = [
    ...history
      .filter(msg => msg.sender === "user" || msg.sender === "assistant")
      .map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      })),
    {
      role: "user",
      parts: [{ text: userMessage }]
    }
  ];

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      systemInstruction: systemPrompt ? {
        parts: [{ text: systemPrompt }]
      } : undefined,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    })
  });

  if (!response.ok) {
    throw new Error("Gemini API call failed");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
};
