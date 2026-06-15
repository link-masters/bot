(function () {
  // 1. Get configuration
  const config = window.BotFlowConfig || {};
  const botId = config.botId || "";
  const title = config.title || "Chat Assistant";
  const themeColor = config.themeColor || "#4f46e5";
  const welcomeMessage = config.welcomeMessage || "Hi! How can I help you?";

  // 2. Determine base API URL from script source
  let baseUrl = "http://localhost:3000";
  if (document.currentScript) {
    try {
      baseUrl = new URL(document.currentScript.src).origin;
    } catch (e) {
      console.error("[BotFlow Widget]: Failed to parse script origin", e);
    }
  }

  // State
  let isOpen = false;
  let messages = [
    {
      sender: "assistant",
      content: welcomeMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ];
  let isThinking = false;

  // 3. Inject CSS Styles
  const style = document.createElement("style");
  style.textContent = `
    .bf-widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .bf-trigger-btn {
      width: 60px;
      height: 60px;
      borderRadius: 50%;
      border: none;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }
    .bf-trigger-btn:hover {
      transform: scale(1.05);
    }
    .bf-chat-window {
      width: 360px;
      height: 520px;
      background-color: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      border: 1px solid rgba(0,0,0,0.1);
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: bfSlideUp 0.3s ease-out;
    }
    @keyframes bfSlideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .bf-header {
      padding: 16px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .bf-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .bf-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    .bf-title-group h4 {
      margin: 0;
      font-size: 14px;
      font-weight: bold;
    }
    .bf-title-group span {
      font-size: 11px;
      opacity: 0.85;
    }
    .bf-close-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 24px;
      cursor: pointer;
      opacity: 0.8;
      line-height: 1;
    }
    .bf-messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background-color: #f9f9f9;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .bf-msg-row {
      display: flex;
      flex-direction: column;
      max-width: 80%;
    }
    .bf-msg-row.assistant {
      align-self: flex-start;
      align-items: flex-start;
    }
    .bf-msg-row.user {
      align-self: flex-end;
      align-items: flex-end;
    }
    .bf-msg-bubble {
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13.5px;
      line-height: 1.4;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      white-space: pre-wrap;
    }
    .bf-msg-row.assistant .bf-msg-bubble {
      background-color: #fff;
      color: #333;
      border-top-left-radius: 2px;
    }
    .bf-msg-row.user .bf-msg-bubble {
      color: #fff;
      border-top-right-radius: 2px;
    }
    .bf-msg-time {
      font-size: 10px;
      color: #999;
      margin-top: 4px;
    }
    .bf-input-area {
      padding: 12px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 8px;
      background-color: #fff;
    }
    .bf-input {
      flex: 1;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #ddd;
      outline: none;
      font-size: 13px;
    }
    .bf-send-btn {
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      font-size: 13px;
    }
    .bf-brand-footer {
      padding: 6px;
      text-align: center;
      background-color: #fff;
      font-size: 10px;
      color: #aaa;
      border-top: 1px solid #f5f5f5;
    }
  `;
  document.head.appendChild(style);

  // 4. Create Markup Elements
  const container = document.createElement("div");
  container.className = "bf-widget-container";

  // Trigger Button
  const triggerBtn = document.createElement("button");
  triggerBtn.className = "bf-trigger-btn";
  triggerBtn.style.backgroundColor = themeColor;
  triggerBtn.style.borderRadius = "50%";
  triggerBtn.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  // Chat Window
  const chatWindow = document.createElement("div");
  chatWindow.className = "bf-chat-window";

  chatWindow.innerHTML = `
    <div class="bf-header" style="background-color: ${themeColor}">
      <div class="bf-header-info">
        <div class="bf-avatar">💬</div>
        <div class="bf-title-group">
          <h4>${title}</h4>
          <span>Online</span>
        </div>
      </div>
      <button class="bf-close-btn">&times;</button>
    </div>
    <div class="bf-messages-area"></div>
    <form class="bf-input-area">
      <input type="text" class="bf-input" placeholder="Type a message..." required />
      <button type="submit" class="bf-send-btn" style="background-color: ${themeColor}">Send</button>
    </form>
    <div class="bf-brand-footer">Powered by BotFlow AI</div>
  `;

  container.appendChild(triggerBtn);
  container.appendChild(chatWindow);
  document.body.appendChild(container);

  // References
  const messagesArea = chatWindow.querySelector(".bf-messages-area");
  const closeBtn = chatWindow.querySelector(".bf-close-btn");
  const form = chatWindow.querySelector(".bf-input-area");
  const inputEl = chatWindow.querySelector(".bf-input");

  // Render Messages
  function renderMessages() {
    messagesArea.innerHTML = "";
    messages.forEach((msg) => {
      const msgRow = document.createElement("div");
      msgRow.className = `bf-msg-row ${msg.sender}`;

      const bubble = document.createElement("div");
      bubble.className = "bf-msg-bubble";
      bubble.textContent = msg.content;
      if (msg.sender === "user") {
        bubble.style.backgroundColor = themeColor;
      }

      const timeSpan = document.createElement("span");
      timeSpan.className = "bf-msg-time";
      timeSpan.textContent = msg.time;

      msgRow.appendChild(bubble);
      msgRow.appendChild(timeSpan);
      messagesArea.appendChild(msgRow);
    });

    if (isThinking) {
      const typingIndicator = document.createElement("div");
      typingIndicator.className = "bf-msg-row assistant";
      typingIndicator.innerHTML = `
        <div class="bf-msg-bubble" style="background-color: #fff; color: #999;">Typing...</div>
      `;
      messagesArea.appendChild(typingIndicator);
    }
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  // Toggle Visibility
  triggerBtn.addEventListener("click", () => {
    isOpen = true;
    triggerBtn.style.display = "none";
    chatWindow.style.display = "flex";
    renderMessages();
  });

  closeBtn.addEventListener("click", () => {
    isOpen = false;
    chatWindow.style.display = "none";
    triggerBtn.style.display = "flex";
  });

  // Handle Send Message
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text || isThinking) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    messages.push({ sender: "user", content: text, time });
    inputEl.value = "";
    isThinking = true;
    renderMessages();

    try {
      const history = messages.slice(0, -1).map((m) => ({
        sender: m.sender,
        content: m.content
      }));

      // Call Next.js Server API
      const res = await fetch(`${baseUrl}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.model || "models/gemini-flash-lite-latest",
          systemPrompt: config.systemPrompt || "You are a helpful assistant.",
          userMessage: text,
          history: history
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed request");

      messages.push({
        sender: "assistant",
        content: data.text || "No reply.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });
    } catch (err) {
      console.error("[BotFlow Widget Error]:", err);
      messages.push({
        sender: "assistant",
        content: "Sorry, I am having trouble connecting to the host server.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });
    } finally {
      isThinking = false;
      renderMessages();
    }
  });

  // Initial render
  renderMessages();
})();
