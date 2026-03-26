const express = require("express");
const axios = require("axios");

const OLLAMA_URL = "http://localhost:11434/api/chat";
const OLLAMA_MODEL = "llama3.1:8b";
const MAX_HISTORY_MESSAGES = 20;
const NON_STREAM_TIMEOUT_MS = 60000;

function createChatbotRouter({ queryAsync }) {
  if (typeof queryAsync !== "function") {
    throw new Error("createChatbotRouter zahtijeva queryAsync funkciju.");
  }

  const router = express.Router();

  function normalizeHistory(history = []) {
    if (!Array.isArray(history)) return [];

    return history
      .filter(
        (msg) =>
          msg &&
          typeof msg.role === "string" &&
          typeof msg.content === "string" &&
          msg.content.trim()
      )
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content.trim(),
      }))
      .slice(-MAX_HISTORY_MESSAGES);
  }

  function escapeSSEData(value) {
    return String(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function shorten(value, max = 300) {
    if (typeof value !== "string") return value;
    return value.length > max ? `${value.slice(0, max)}...` : value;
  }

  function buildAttractionsContext(attractions) {
    if (!Array.isArray(attractions) || attractions.length === 0) {
      return "Trenutno nema dostupnih atrakcija u bazi.";
    }

    return attractions
      .map((item) =>
        [
          `ID: ${item.id_atrakcije}`,
          `Naziv: ${item.naziv || "Nije dostupno"}`,
          `Opis: ${shorten(item.opis || "Nije dostupno")}`,
          `Adresa: ${item.adresa || "Nije dostupno"}`,
          `Ocjena: ${item.prosjecna_ocjena ?? "Nije dostupno"}`,
        ].join(", ")
      )
      .join("\n");
  }

  function buildSystemPrompt(attractionsContext) {
    return `
      Ti si koristan i prirodan AI chatbot unutar turističke web aplikacije.

      Pomažeš korisnicima s turističkim atrakcijama, lokacijama, izletima, prirodom, povijesnim znamenitostima i putovanjima. Možeš odgovoriti i na općenita pitanja ako nisu vezana uz turizam.

      Način odgovaranja:
      - odgovaraj na hrvatskom jeziku (osim ako korisnik traži drugačije)
      - piši opušteno, jasno i prirodno, kao čovjek
      - koristi kratke i razumljive rečenice
      - izbjegavaj pretjerano formatiranje (npr. previše podebljanja ili velikih slova)
      - markdown koristi samo ako stvarno pomaže čitljivosti
      - emoji koristi rijetko i samo ako ima smisla

      Točnost:
      - ako korisnik pita o atrakcijama iz aplikacije, koristi isključivo podatke iz baze
      - nemoj izmišljati informacije
      - ako nema dovoljno podataka, reci to iskreno
      - ako nisi siguran, slobodno to naglasi

      Preporuke:
      - daj kratko objašnjenje zašto nešto preporučuješ
      - možeš spomenuti ugođaj, tip mjesta i kome bi odgovaralo

      Podaci iz baze atrakcija:
      ${attractionsContext}
        `.trim();
  }
  async function getAttractionsForPrompt() {
    const attractions = await queryAsync(`
      SELECT id_atrakcije, naziv, opis, adresa, prosjecna_ocjena
      FROM atrakcije
      LIMIT 30
    `);

    return attractions || [];
  }

  async function buildMessages(message, history) {
    const attractions = await getAttractionsForPrompt();
    const attractionsContext = buildAttractionsContext(attractions);
    const systemPrompt = buildSystemPrompt(attractionsContext);

    return [
      { role: "system", content: systemPrompt },
      ...normalizeHistory(history),
      { role: "user", content: message.trim() },
    ];
  }

  router.post("/", async (req, res) => {
    try {
      const { message, history = [] } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Poruka je obavezna.",
        });
      }

      const messages = await buildMessages(message, history);

      const ollamaResponse = await axios.post(
        OLLAMA_URL,
        {
          model: OLLAMA_MODEL,
          messages,
          stream: false,
          keep_alive: "10m",
          options: {
            temperature: 0.7,
          },
        },
        {
          timeout: NON_STREAM_TIMEOUT_MS,
        }
      );

      const reply =
        ollamaResponse?.data?.message?.content ||
        "Nažalost, nisam uspio generirati odgovor.";

      return res.status(200).json({
        success: true,
        reply,
      });
    } catch (error) {
      console.error(
        "Chatbot non-stream error:",
        error?.response?.data || error.message
      );

      return res.status(500).json({
        success: false,
        message: "Greška pri komunikaciji s lokalnim chatbotom.",
        error: error?.response?.data || error.message,
      });
    }
  });

  router.post("/stream", async (req, res) => {
    let responseClosed = false;
    let ollamaStream = null;

    const cleanupStream = () => {
      if (ollamaStream) {
        try {
          ollamaStream.destroy();
        } catch (_) {}
      }
    };

    const closeResponse = () => {
      if (!responseClosed) {
        responseClosed = true;
        cleanupStream();
        try {
          res.end();
        } catch (_) {}
      }
    };

    const sendEvent = (eventName, payload) => {
      if (responseClosed) return;
      res.write(`event: ${eventName}\n`);
      res.write(`data: ${escapeSSEData(JSON.stringify(payload))}\n\n`);
    };

    try {
      const { message, history = [] } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Poruka je obavezna.",
        });
      }

      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      if (typeof res.flushHeaders === "function") {
        res.flushHeaders();
      }

      req.on("aborted", () => {
        responseClosed = true;
        cleanupStream();
      });

      res.on("close", () => {
        responseClosed = true;
        cleanupStream();
      });

      const messages = await buildMessages(message, history);

      sendEvent("start", { success: true });

      const ollamaResponse = await axios({
        method: "post",
        url: OLLAMA_URL,
        data: {
          model: OLLAMA_MODEL,
          messages,
          stream: true,
          keep_alive: "10m",
          options: {
            temperature: 0.7,
          },
        },
        responseType: "stream",
        timeout: 0,
      });

      ollamaStream = ollamaResponse.data;

      let buffer = "";

      ollamaStream.on("data", (chunk) => {
        if (responseClosed) return;

        buffer += chunk.toString("utf8");

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const parsed = JSON.parse(trimmed);
            const token = parsed?.message?.content || "";

            if (token) {
              sendEvent("token", { token });
            }

            if (parsed?.done) {
              sendEvent("done", { success: true });
              closeResponse();
              return;
            }
          } catch (parseError) {
            console.error("Stream JSON parse error:", parseError.message);
          }
        }
      });

      ollamaStream.on("end", () => {
        if (!responseClosed) {
          sendEvent("done", { success: true });
          closeResponse();
        }
      });

      ollamaStream.on("error", (streamError) => {
        console.error("Ollama stream error:", streamError.message);

        if (!responseClosed) {
          sendEvent("error", {
            success: false,
            message: "Greška tijekom stream odgovora.",
          });
          closeResponse();
        }
      });
    } catch (error) {
      console.error(
        "Chatbot stream error:",
        error?.response?.data || error.message
      );

      if (!responseClosed && !res.headersSent) {
        return res.status(500).json({
          success: false,
          message: "Greška pri pokretanju stream odgovora.",
          error: error?.response?.data || error.message,
        });
      }

      if (!responseClosed) {
        sendEvent("error", {
          success: false,
          message: "Greška pri komunikaciji s lokalnim chatbotom.",
        });
        closeResponse();
      }
    }
  });

  return router;
}

module.exports = createChatbotRouter;
