let activeChatId = null;
let currentUserPlan = "free";
let selectedFile = null;
async function initChat() {
  requireAuth();
  await loadMe();
  await loadChats();
}
async function loadMe() {
  const data = await API.request("/api/auth/me", {
    headers: API.headers(),
  });

  const user = data.user;
  const subscription = data.subscription;

  currentUserPlan = user.plan || subscription?.plan || "free";

  const used = user.creditUsed || 0;

  const limit = user.creditLimit || 30;

  const remaining = Math.max(limit - used, 0);

  document.getElementById("userInfo").innerHTML = `
    <strong>${escapeHtml(user.name)}</strong><br>
    <small>
      ${currentUserPlan} plan | Credits: ${remaining} / ${limit}
    </small>
  `;
}
async function loadChats() {
  const chats = await API.request("/api/chats", { headers: API.headers() });
  const list = document.getElementById("chatList");
  list.innerHTML = chats
    .map(
      (c) =>
        `<button onclick="openChat('${c._id}')">${escapeHtml(c.title)}</button>`,
    )
    .join("");
}
async function newChat() {
  activeChatId = null;
  document.getElementById("messages").innerHTML =
    '<div class="empty">New chat started</div>';
}
async function openChat(id) {
  activeChatId = id;

  const messagesBox = document.getElementById("messages");

  // Show loading immediately
  messagesBox.innerHTML = '<div class="empty">Loading chat...</div>';

  try {
    const data = await API.request(`/api/chats/${id}`, {
      headers: API.headers(),
    });

    messagesBox.innerHTML = data.messages.map(renderMessage).join("");

    if (window.MathJax) {
      MathJax.typesetPromise();
    }

    scrollBottom();
  } catch (err) {
    messagesBox.innerHTML =
      '<div class="empty">Failed to load chat. Please try again.</div>';
  }
}
function renderMessage(m) {
  return `<div class="msg ${m.role}"><div class="bubble">${renderMarkdown(m.content)}${m.modelUsed ? `<div class="model">${escapeHtml(m.modelUsed)}</div>` : ""}</div></div>`;
}
async function sendChat(e) {
  e.preventDefault();
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (!message) return;
  input.value = "";
  const box = document.getElementById("messages");
  box.insertAdjacentHTML(
    "beforeend",
    renderMessage({ role: "user", content: message }),
  );
  box.insertAdjacentHTML(
    "beforeend",
    '<div id="loading" class="msg assistant"><div class="bubble">Thinking...</div></div>',
  );
  scrollBottom();
  try {
    const data = await API.request("/api/ai/chat", {
      method: "POST",
      headers: API.headers(),
      body: JSON.stringify({ chatId: activeChatId, message }),
    });
    activeChatId = data.chat._id;
    document.getElementById("loading").remove();
    box.insertAdjacentHTML("beforeend", renderMessage(data.assistant));

    if (window.MathJax) {
      MathJax.typesetPromise();
    }
    await loadChats();
    await loadMe();
    scrollBottom();
  } catch (err) {
    document.getElementById("loading")?.remove();

    const box = document.getElementById("messages");

    // limit reached
    if (err.status === 429 || err.message.includes("limit")) {
      const resetDate = new Date(err.resetTime);

      const formattedReset =
        resetDate.toLocaleDateString() +
        " " +
        resetDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

      box.insertAdjacentHTML(
        "beforeend",
        `
      <div class="msg assistant">
        <div class="bubble limit-warning">
          <strong>⚠️ Credit Limit Reached</strong><br><br>

          You have used all your available credits for this month.<br><br>

          Please come back on:<br>
          <strong>${formattedReset}</strong><br><br>

          Your free access resets every 24 hours.<br><br>

          Upgrade to Premium for higher limits.
        </div>
      </div>
      `,
      );

      document.getElementById("messageInput").disabled = true;
      document.querySelector(".composer button").disabled = true;

      scrollBottom();
      return;
    }

    alert(err.message);
  }
}
async function deleteCurrentChat() {
  if (!activeChatId) return;
  if (!confirm("Delete this chat?")) return;
  await API.request(`/api/chats/${activeChatId}`, {
    method: "DELETE",
    headers: API.headers(),
  });
  await newChat();
  await loadChats();
}
function scrollBottom() {
  const m = document.getElementById("messages");
  m.scrollTop = m.scrollHeight;
}

function toggleTheme() {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");

  localStorage.setItem("theme", isLight ? "light" : "dark");
}

window.addEventListener("load", () => {
  const theme = localStorage.getItem("theme");

  if (theme === "light") {
    document.body.classList.add("light");
  }
});

function openFilePicker() {
  if (currentUserPlan !== "premium") {
    showFreeFileWarning();
    return;
  }

  document.getElementById("fileInput").click();
}

function handleDragOver(event) {
  event.preventDefault();

  if (currentUserPlan !== "premium") {
    showFreeFileWarning();
    return;
  }

  document.getElementById("dropZone").classList.add("drag-active");
}

function handleDragLeave(event) {
  event.preventDefault();
  document.getElementById("dropZone").classList.remove("drag-active");
}

function handleFileDrop(event) {
  event.preventDefault();
  document.getElementById("dropZone").classList.remove("drag-active");

  if (currentUserPlan !== "premium") {
    showFreeFileWarning();
    return;
  }

  const file = event.dataTransfer.files[0];
  attachFile(file);
}

function handleFileSelect(event) {
  if (currentUserPlan !== "premium") {
    showFreeFileWarning();
    return;
  }

  const file = event.target.files[0];
  attachFile(file);
}

function attachFile(file) {
  if (!file) return;

  selectedFile = file;

  document.getElementById("attachedFile").innerHTML = `
    <div class="file-chip">
      📄 ${escapeHtml(file.name)}
      <button type="button" onclick="removeAttachedFile()">×</button>
    </div>
  `;
}

function removeAttachedFile() {
  selectedFile = null;
  document.getElementById("fileInput").value = "";
  document.getElementById("attachedFile").innerHTML = "";
}

function showFreeFileWarning() {
  const box = document.getElementById("messages");

  box.insertAdjacentHTML(
    "beforeend",
    `
    <div class="msg assistant">
      <div class="bubble limit-warning">
        <strong>⚠️ File Upload is for Premium Users Only</strong><br><br>
        Free users cannot upload files.<br>
        Please upgrade to Premium to upload PDF, DOCX, images, or other files.
      </div>
    </div>
    `,
  );

  scrollBottom();
}
