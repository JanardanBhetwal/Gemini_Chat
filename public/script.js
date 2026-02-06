const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Send message on button click
sendBtn.addEventListener("click", sendMessage);

// Send message on Enter key
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function formatResponse(text) {
  // Replace markdown-like syntax with HTML tags
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
    .replace(/### (.*?)\n/g, "<h3>$1</h3>") // H3 headers
    .replace(/---/g, "<hr>") // Horizontal rule
    .replace(/\n/g, "<br>"); // Line breaks
}

async function sendMessage() {
  const message = userInput.value.trim();

  if (!message) return;

  // Add user message to chat
  addMessage(message, "user");
  userInput.value = "";
  sendBtn.disabled = true;

  // Show loading indicator
  const loadingEl = addMessage("", "bot");
  loadingEl.innerHTML =
    '<div class="loading"><span></span><span></span><span></span></div>';

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (response.ok) {
      // Remove loading indicator and add formatted bot response
      loadingEl.remove();
      addMessage(formatResponse(data.reply), "bot", true);
    } else {
      loadingEl.remove();
      addMessage("Error: " + (data.error || "Failed to get response"), "bot");
    }
  } catch (error) {
    console.error("Error:", error);
    loadingEl.remove();
    addMessage("Error: Could not connect to the server", "bot");
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
}

function addMessage(text, sender, isHTML = false) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${sender}-message`;

  const p = document.createElement("p");
  if (isHTML) {
    p.innerHTML = text; // Set HTML content if formatted
  } else {
    p.textContent = text; // Set plain text content
  }

  messageEl.appendChild(p);
  chatBox.appendChild(messageEl);

  // Auto scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;

  return messageEl;
}
