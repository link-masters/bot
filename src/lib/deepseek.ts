export const callDeepSeekAPI = async (
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  history: { sender: "user" | "assistant" | "system"; content: string }[]
): Promise<string> => {
  const url = "https://api.deepseek.com/chat/completions";

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  for (const msg of history) {
    if (msg.sender === "user") {
      messages.push({ role: "user", content: msg.content });
    } else if (msg.sender === "assistant") {
      messages.push({ role: "assistant", content: msg.content });
    }
  }
  messages.push({ role: "user", content: userMessage });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || "deepseek-chat",
      messages,
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API call failed: ${errText || response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response generated.";
};
