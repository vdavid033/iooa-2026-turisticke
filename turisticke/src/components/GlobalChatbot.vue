<template>
  <div class="chatbot-fab">
    <q-btn
      round
      unelevated
      class="chatbot-btn"
      @click="chatOpen = true"
      aria-label="Otvori chatbot"
    >
      <svg
        class="chatbot-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="chatGradientGlobal"
            x1="8"
            y1="8"
            x2="56"
            y2="56"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#38bdf8" />
            <stop offset="1" stop-color="#2563eb" />
          </linearGradient>
        </defs>

        <circle cx="32" cy="32" r="30" fill="url(#chatGradientGlobal)" />
        <rect x="16" y="20" width="32" height="22" rx="10" fill="white" />
        <circle cx="26" cy="31" r="2.4" fill="#2563EB" />
        <circle cx="32" cy="31" r="2.4" fill="#2563EB" />
        <circle cx="38" cy="31" r="2.4" fill="#2563EB" />
      </svg>
    </q-btn>
  </div>

  <q-dialog v-model="chatOpen" position="right" @hide="handleChatHide">
    <q-card class="chatbot-card">
      <q-card-section class="chatbot-header">
        <div class="chatbot-header-left">
          <div class="chatbot-avatar">
            <q-icon name="smart_toy" size="24px" />
          </div>

          <div>
            <div class="chatbot-title">AI turistički chatbot</div>
            <div class="chatbot-status">Lokalni Ollama asistent</div>
          </div>
        </div>

        <q-btn
          flat
          round
          dense
          icon="close"
          color="white"
          @click="chatOpen = false"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="chatbot-messages" ref="messagesContainer">
        <div
          v-for="(msg, index) in messages"
          :key="`${msg.sender}-${index}`"
          :class="['chat-message', msg.sender]"
        >
          <div class="chat-bubble">
            <div
              v-if="msg.sender === 'bot'"
              class="markdown-body"
              v-html="renderMarkdown(msg.text)"
            ></div>

            <div v-else class="plain-message">
              {{ msg.text }}
            </div>
          </div>
        </div>

        <div v-if="isTyping" class="chat-message bot">
          <div class="chat-bubble typing-bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="quick-questions-section">
        <div class="quick-questions-title">Brza pitanja</div>

        <div class="quick-questions">
          <q-btn
            v-for="question in quickQuestions"
            :key="question.label"
            flat
            no-caps
            rounded
            class="quick-btn"
            :label="question.label"
            :disable="isSending"
            @click="sendQuickMessage(question.message)"
          />
        </div>
      </q-card-section>

      <q-card-section class="chatbot-input-section">
        <q-input
          v-model="userMessage"
          outlined
          rounded
          dense
          autogrow
          :disable="isSending"
          placeholder="Upiši poruku..."
          class="chatbot-input"
          @keyup.enter.exact.prevent="sendMessage"
        >
          <template #append>
            <q-btn
              round
              dense
              flat
              :icon="isSending ? 'hourglass_top' : 'send'"
              color="primary"
              :disable="!canSendMessage"
              @click="sendMessage"
            />
          </template>
        </q-input>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
} from "vue";
import MarkdownIt from "markdown-it";

const API_BASE_URL = "http://localhost:4200";
const CHATBOT_STREAM_URL = `${API_BASE_URL}/api/chatbot/stream`;
const STORAGE_KEY = "global_chatbot_messages";

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  typographer: true,
});

const INITIAL_BOT_MESSAGE =
  "👋 **Pozdrav!** Ja sam tvoj lokalni AI chatbot.\n\nMogu ti pomoći oko **turističkih atrakcija**, preporuka za izlete, ali i oko općenitih pitanja.";

const QUICK_QUESTIONS = [
  {
    label: "Koje atrakcije imate?",
    message: "Koje atrakcije imate u bazi?",
  },
  {
    label: "Preporuka za izlet",
    message: "Preporuči mi neki izlet.",
  },
  {
    label: "Prirodne atrakcije",
    message: "Koje prirodne atrakcije preporučuješ?",
  },
  {
    label: "Povijesne lokacije",
    message: "Koje povijesne znamenitosti preporučuješ?",
  },
];

export default {
  name: "GlobalChatbot",

  setup() {
    const chatOpen = ref(false);
    const userMessage = ref("");
    const isTyping = ref(false);
    const isSending = ref(false);
    const messagesContainer = ref(null);
    const streamAbortController = ref(null);
    const quickQuestions = ref(QUICK_QUESTIONS);

    const messages = ref(loadInitialMessages());

    const canSendMessage = computed(() => {
      return Boolean(userMessage.value.trim()) && !isSending.value;
    });

    watch(chatOpen, async (isOpen) => {
      if (isOpen) {
        await scrollChatToBottom();
      }
    });

    watch(
      () => messages.value,
      async (newMessages) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));

        if (chatOpen.value) {
          await scrollChatToBottom();
        }
      },
      { deep: true }
    );

    const renderMarkdown = (text) => md.render(text || "");

    function loadInitialMessages() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
          const parsed = JSON.parse(saved);

          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (error) {
        console.error("Greška pri učitavanju chat povijesti:", error);
      }

      return [
        {
          sender: "bot",
          text: INITIAL_BOT_MESSAGE,
        },
      ];
    }

    function abortActiveStream() {
      if (streamAbortController.value) {
        streamAbortController.value.abort();
        streamAbortController.value = null;
      }
    }

    async function scrollChatToBottom() {
      await nextTick();

      let container = messagesContainer.value;

      if (container?.$el) {
        container = container.$el;
      }

      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }

    function buildHistoryForBackend() {
      return messages.value.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));
    }

    function extractSseEvents(buffer) {
      const blocks = buffer.split("\n\n");
      const remainder = blocks.pop() || "";

      const parsedEvents = blocks
        .map((block) => {
          const lines = block.split("\n");
          let eventName = "message";
          let eventData = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              eventData += line.replace("data:", "").trim();
            }
          }

          if (!eventData) return null;

          try {
            return {
              eventName,
              payload: JSON.parse(eventData),
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      return {
        events: parsedEvents,
        remainder,
      };
    }

    async function streamChatResponse(text) {
      abortActiveStream();
      streamAbortController.value = new AbortController();

      const response = await fetch(CHATBOT_STREAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message: text,
          history: buildHistoryForBackend().slice(0, -1),
        }),
        signal: streamAbortController.value.signal,
      });

      if (!response.ok || !response.body) {
        let errorMessage = "Greška pri stream odgovoru.";

        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch (_) {
          // ignore
        }

        throw new Error(errorMessage);
      }

      messages.value.push({
        sender: "bot",
        text: "",
      });

      const botIndex = messages.value.length - 1;
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let buffer = "";
      let firstTokenArrived = false;

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          isTyping.value = false;
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const { events, remainder } = extractSseEvents(buffer);
        buffer = remainder;

        for (const event of events) {
          const { eventName, payload } = event;

          if (eventName === "token" && payload?.token) {
            if (!firstTokenArrived) {
              firstTokenArrived = true;
              isTyping.value = false;
            }

            messages.value[botIndex].text += payload.token;
            await scrollChatToBottom();
          }

          if (eventName === "error") {
            isTyping.value = false;
            throw new Error(
              payload?.message || "Greška tijekom stream odgovora."
            );
          }

          if (eventName === "done") {
            isTyping.value = false;
            await scrollChatToBottom();
            return;
          }
        }
      }

      await scrollChatToBottom();
    }

    async function sendMessage() {
      const text = userMessage.value.trim();

      if (!text || isSending.value) return;

      messages.value.push({
        sender: "user",
        text,
      });

      userMessage.value = "";
      isTyping.value = true;
      isSending.value = true;

      await scrollChatToBottom();

      try {
        await streamChatResponse(text);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        console.error("Chatbot stream error:", error);

        messages.value.push({
          sender: "bot",
          text: "⚠️ Trenutno ne mogu dohvatiti odgovor od lokalnog AI modela.\n\nProvjeri radi li **backend na portu 4200** i **Ollama na portu 11434**.",
        });
      } finally {
        isTyping.value = false;
        isSending.value = false;
        streamAbortController.value = null;
        await scrollChatToBottom();
      }
    }

    async function sendQuickMessage(text) {
      if (isSending.value) return;
      userMessage.value = text;
      await sendMessage();
    }

    function handleChatHide() {
      abortActiveStream();
      isTyping.value = false;
      isSending.value = false;
    }

    onBeforeUnmount(() => {
      abortActiveStream();
    });

    return {
      chatOpen,
      userMessage,
      isTyping,
      isSending,
      canSendMessage,
      messagesContainer,
      messages,
      quickQuestions,
      renderMarkdown,
      sendMessage,
      sendQuickMessage,
      handleChatHide,
    };
  },
};
</script>

<style scoped>
.chatbot-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 3000;
}

.chatbot-btn {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  padding: 0;
  background: transparent;
  box-shadow: 0 16px 35px rgba(37, 99, 235, 0.35);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: chatbotPulse 2.2s infinite;
}

.chatbot-btn:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.45);
}

.chatbot-svg {
  width: 68px;
  height: 68px;
  display: block;
}

.chatbot-card {
  width: 430px;
  max-width: 96vw;
  height: 700px;
  max-height: 92vh;
  border-radius: 24px 0 0 24px;
  overflow: hidden;
  box-shadow: -10px 20px 40px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.chatbot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #0f172a, #1d4ed8);
  color: white;
  padding: 18px;
}

.chatbot-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chatbot-avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chatbot-title {
  font-size: 17px;
  font-weight: 700;
}

.chatbot-status {
  font-size: 13px;
  opacity: 0.88;
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  background: linear-gradient(to bottom, #f8fbff, #f1f5f9);
}

.chat-message {
  display: flex;
  margin-bottom: 14px;
}

.chat-message.user {
  justify-content: flex-end;
}

.chat-message.bot {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 85%;
  padding: 14px 16px;
  border-radius: 18px;
  line-height: 1.6;
  font-size: 14px;
  white-space: normal;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
}

.chat-message.user .chat-bubble {
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  color: white;
  border-bottom-right-radius: 6px;
}

.chat-message.bot .chat-bubble {
  background: white;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 6px;
}

.plain-message {
  white-space: pre-wrap;
}

.markdown-body :deep(p) {
  margin: 0 0 10px;
}

.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(strong) {
  font-weight: 800;
  color: #0f172a;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 8px 0 8px 18px;
  padding: 0;
}

.markdown-body :deep(li) {
  margin-bottom: 6px;
}

.markdown-body :deep(a) {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  word-break: break-word;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(code) {
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 13px;
}

.typing-bubble {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 62px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  animation: blink 1.2s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

.quick-questions-section {
  padding: 14px 14px 10px;
  background: #ffffff;
}

.quick-questions-title {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 10px;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-btn {
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  border: 1px solid #dbeafe;
}

.chatbot-input-section {
  padding: 14px;
  background: white;
}

.chatbot-input {
  width: 100%;
}

@keyframes chatbotPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4),
      0 16px 35px rgba(37, 99, 235, 0.35);
  }
  70% {
    box-shadow: 0 0 0 18px rgba(37, 99, 235, 0),
      0 16px 35px rgba(37, 99, 235, 0.35);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0),
      0 16px 35px rgba(37, 99, 235, 0.35);
  }
}

@keyframes blink {
  0%,
  80%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

@media (max-width: 600px) {
  .chatbot-fab {
    right: 16px;
    bottom: 16px;
  }

  .chatbot-btn,
  .chatbot-svg {
    width: 60px;
    height: 60px;
  }

  .chatbot-card {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>