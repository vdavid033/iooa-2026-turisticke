const express = require("express");
const axios = require("axios");

const OLLAMA_URL = "http://localhost:11434/api/chat";
const OLLAMA_MODEL = "llama3.2:3b";
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

  function shorten(value, max = 350) {
    if (typeof value !== "string") return value;
    return value.length > max ? `${value.slice(0, max)}...` : value;
  }

  function normalizeText(value = "") {
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractKeywords(message = "") {
    const stopWords = new Set([
      "koje",
      "koji",
      "koja",
      "kojeg",
      "kojim",
      "kojoj",
      "imate",
      "imamo",
      "imas",
      "ima",
      "atrakcije",
      "atrakcija",
      "preporuci",
      "preporuka",
      "molim",
      "zelim",
      "trebam",
      "reci",
      "daj",
      "daj mi",
      "gdje",
      "sto",
      "šta",
      "sta",
      "za",
      "od",
      "do",
      "na",
      "u",
      "po",
      "s",
      "sa",
      "su",
      "je",
      "li",
      "mi",
      "me",
      "se",
      "te",
      "to",
      "ovo",
      "ono",
      "neka",
      "neki",
      "neku",
      "najbolje",
      "top",
      "komentari",
      "komentar",
      "ocjena",
      "ocjene",
      "slike",
      "slika",
      "prirodne",
      "povijesne",
      "lokacije",
      "lokacija",
      "znamenitosti",
      "izlet",
      "izlete",
    ]);

    return normalizeText(message)
      .split(" ")
      .map((word) => word.trim())
      .filter((word) => word.length >= 3 && !stopWords.has(word))
      .slice(0, 8);
  }

  function detectIntent(message = "") {
    const text = normalizeText(message);

    if (
      text.includes("komentar") ||
      text.includes("komentari") ||
      text.includes("sto ljudi kazu") ||
      text.includes("što ljudi kažu") ||
      text.includes("misljenje") ||
      text.includes("mišljenje")
    ) {
      return "comments";
    }

    if (
      text.includes("najbolje") ||
      text.includes("top") ||
      text.includes("najvisa ocjena") ||
      text.includes("najviša ocjena") ||
      text.includes("najbolje ocijenjene") ||
      text.includes("najbolje ocenjene")
    ) {
      return "top";
    }

    if (
      text.includes("slika") ||
      text.includes("slike") ||
      text.includes("fotograf") ||
      text.includes("fotke")
    ) {
      return "images";
    }

    if (
      text.includes("gdje") ||
      text.includes("u ") ||
      text.includes("na adresi") ||
      text.includes("u blizini") ||
      text.includes("lokacija")
    ) {
      return "location";
    }

    if (
      text.includes("koje atrakcije") ||
      text.includes("sto imate") ||
      text.includes("što imate") ||
      text.includes("popis atrakcija") ||
      text.includes("sve atrakcije")
    ) {
      return "all";
    }

    return "search";
  }

  async function getAllAttractions(limit = 20) {
    const rows = await queryAsync(
      `
      SELECT 
        id_atrakcije,
        naziv,
        opis,
        adresa,
        prosjecna_ocjena,
        geografska_sirina,
        geografska_duzina
      FROM atrakcije
      ORDER BY id_atrakcije DESC
      LIMIT ?
      `,
      [limit]
    );

    return rows || [];
  }

  async function getTopAttractions(limit = 5) {
    const rows = await queryAsync(
      `
      SELECT 
        id_atrakcije,
        naziv,
        opis,
        adresa,
        prosjecna_ocjena,
        geografska_sirina,
        geografska_duzina
      FROM atrakcije
      ORDER BY COALESCE(prosjecna_ocjena, 0) DESC, naziv ASC
      LIMIT ?
      `,
      [limit]
    );

    return rows || [];
  }

  async function searchAttractionsByMessage(message, limit = 10) {
    const keywords = extractKeywords(message);

    if (!keywords.length) {
      return getAllAttractions(limit);
    }

    const whereParts = [];
    const params = [];

    for (const keyword of keywords) {
      const like = `%${keyword}%`;
      whereParts.push(`(naziv LIKE ? OR opis LIKE ? OR adresa LIKE ?)`);
      params.push(like, like, like);
    }

    params.push(limit);

    const sql = `
      SELECT 
        id_atrakcije,
        naziv,
        opis,
        adresa,
        prosjecna_ocjena,
        geografska_sirina,
        geografska_duzina
      FROM atrakcije
      WHERE ${whereParts.join(" OR ")}
      ORDER BY COALESCE(prosjecna_ocjena, 0) DESC, naziv ASC
      LIMIT ?
    `;

    const rows = await queryAsync(sql, params);
    return rows || [];
  }

  async function findBestMatchingAttraction(message) {
    const matches = await searchAttractionsByMessage(message, 1);
    return matches[0] || null;
  }

  async function getCommentsForAttractionId(attractionId, limit = 5) {
    if (!attractionId) return [];

    const rows = await queryAsync(
      `
      SELECT 
        ID_komentara,
        Komentar
      FROM Komentari
      WHERE VK_ID_atrakcije = ?
      ORDER BY ID_komentara DESC
      LIMIT ?
      `,
      [attractionId, limit]
    );

    return rows || [];
  }

  async function getRatingsForAttractionId(attractionId) {
    if (!attractionId) return [];

    const rows = await queryAsync(
      `
      SELECT 
        id_ocjene,
        ocjena
      FROM Ocjena
      WHERE VK_ID_Atrakcije = ?
      ORDER BY id_ocjene DESC
      LIMIT 10
      `,
      [attractionId]
    );

    return rows || [];
  }

  async function getImagesForAttractionId(attractionId) {
    if (!attractionId) return [];

    const rows = await queryAsync(
      `
      SELECT 
        id_slike,
        id_atrakcije_s
      FROM slike
      WHERE id_atrakcije_s = ?
      ORDER BY id_slike DESC
      LIMIT 10
      `,
      [attractionId]
    );

    return rows || [];
  }

  function buildAttractionsContext(attractions) {
    if (!Array.isArray(attractions) || attractions.length === 0) {
      return "Nema pronađenih atrakcija u bazi za ovaj upit.";
    }

    return attractions
      .map((item, index) =>
        [
          `${index + 1}. atrakcija`,
          `ID: ${item.id_atrakcije}`,
          `Naziv: ${item.naziv || "Nije dostupno"}`,
          `Opis: ${shorten(item.opis || "Nije dostupno")}`,
          `Adresa: ${item.adresa || "Nije dostupno"}`,
          `Prosječna ocjena: ${
            item.prosjecna_ocjena ?? "Nije dostupno"
          }`,
          `Geografska širina: ${
            item.geografska_sirina ?? "Nije dostupno"
          }`,
          `Geografska dužina: ${
            item.geografska_duzina ?? "Nije dostupno"
          }`,
        ].join(", ")
      )
      .join("\n");
  }

  function buildCommentsContext(comments) {
    if (!Array.isArray(comments) || comments.length === 0) {
      return "Za ovu atrakciju trenutno nema komentara u bazi.";
    }

    return comments
      .map(
        (comment, index) =>
          `${index + 1}. komentar: ${shorten(
            comment.Komentar || "Nema sadržaja",
            220
          )}`
      )
      .join("\n");
  }

  function buildRatingsContext(ratings) {
    if (!Array.isArray(ratings) || ratings.length === 0) {
      return "Za ovu atrakciju trenutno nema pojedinačnih ocjena u tablici Ocjena.";
    }

    return ratings
      .map((rating, index) => `${index + 1}. ocjena: ${rating.ocjena}`)
      .join("\n");
  }

  function buildImagesContext(images) {
    if (!Array.isArray(images) || images.length === 0) {
      return "Za ovu atrakciju trenutno nema dodatnih slika u tablici slike.";
    }

    return `Broj dodatnih slika za atrakciju: ${images.length}.`;
  }

  function buildSystemPrompt({ intent, attractionsContext, extraContext }) {
    return `
Ti si koristan i prirodan AI chatbot unutar turističke web aplikacije.

Odgovaraj na hrvatskom jeziku, osim ako korisnik izričito traži drugi jezik.

Pravila odgovaranja:
- odgovaraj jasno, prirodno i sažeto
- koristi isključivo podatke iz baze kad korisnik pita o atrakcijama iz aplikacije
- nemoj izmišljati informacije koje nisu u podacima
- ako nešto ne postoji u bazi, to reci iskreno
- ako je korisnik tražio preporuku, preporuči samo na temelju podataka iz baze
- ako ima više rezultata, izdvoji najrelevantnije i kratko objasni zašto
- ako korisnik pita za komentare, sažmi što piše u komentarima bez izmišljanja
- ako korisnik pita općenito, a postoje podaci iz baze koji pomažu, osloni se primarno na njih

Prepoznata vrsta upita:
${intent}

Relevantni podaci iz baze - atrakcije:
${attractionsContext}

Dodatni relevantni podaci:
${extraContext}
    `.trim();
  }

  async function buildContextForMessage(message) {
    const intent = detectIntent(message);

    if (intent === "top") {
      const topAttractions = await getTopAttractions(5);

      return {
        intent,
        attractionsContext: buildAttractionsContext(topAttractions),
        extraContext:
          "Ovo su atrakcije sortirane po prosječnoj ocjeni silazno.",
      };
    }

    if (intent === "comments") {
      const attraction = await findBestMatchingAttraction(message);

      if (!attraction) {
        return {
          intent,
          attractionsContext: "Nije pronađena odgovarajuća atrakcija za komentare.",
          extraContext: "Komentare nije moguće prikazati bez pronađene atrakcije.",
        };
      }

      const comments = await getCommentsForAttractionId(attraction.id_atrakcije, 5);
      const ratings = await getRatingsForAttractionId(attraction.id_atrakcije);

      return {
        intent,
        attractionsContext: buildAttractionsContext([attraction]),
        extraContext: [
          "Komentari za pronađenu atrakciju:",
          buildCommentsContext(comments),
          "",
          "Pojedinačne ocjene za pronađenu atrakciju:",
          buildRatingsContext(ratings),
        ].join("\n"),
      };
    }

    if (intent === "images") {
      const attraction = await findBestMatchingAttraction(message);

      if (!attraction) {
        return {
          intent,
          attractionsContext: "Nije pronađena odgovarajuća atrakcija za slike.",
          extraContext: "Nije moguće provjeriti slike bez pronađene atrakcije.",
        };
      }

      const images = await getImagesForAttractionId(attraction.id_atrakcije);

      return {
        intent,
        attractionsContext: buildAttractionsContext([attraction]),
        extraContext: buildImagesContext(images),
      };
    }

    if (intent === "location" || intent === "search") {
      const results = await searchAttractionsByMessage(message, 8);

      if (!results.length) {
        const fallback = await getTopAttractions(5);

        return {
          intent,
          attractionsContext:
            "Nema direktnog podudaranja za korisnički upit u nazivu, opisu ili adresi.",
          extraContext: [
            "Kao pomoćni kontekst prikazane su najbolje ocijenjene atrakcije iz baze:",
            buildAttractionsContext(fallback),
          ].join("\n"),
        };
      }

      return {
        intent,
        attractionsContext: buildAttractionsContext(results),
        extraContext:
          "Ovo su najrelevantnije atrakcije pronađene prema nazivu, opisu ili adresi.",
      };
    }

    if (intent === "all") {
      const attractions = await getAllAttractions(12);

      return {
        intent,
        attractionsContext: buildAttractionsContext(attractions),
        extraContext: "Prikazan je popis dostupnih atrakcija iz baze.",
      };
    }

    const fallback = await getTopAttractions(5);

    return {
      intent: "general",
      attractionsContext: buildAttractionsContext(fallback),
      extraContext:
        "Korisnik nije postavio strogo strukturirano pitanje pa su kao pomoć dani najrelevantniji podaci iz baze.",
    };
  }

  async function buildMessages(message, history) {
    const context = await buildContextForMessage(message);
    const systemPrompt = buildSystemPrompt(context);

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
            temperature: 0.5,
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
            temperature: 0.5,
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