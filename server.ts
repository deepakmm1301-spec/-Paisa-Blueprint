import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded or guarded initialization of Gemini API
let aiInstance: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in your environment secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Paisa Blueprint server is fully operational." });
});

// AI Financial Coach Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userProfile } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Missing or invalid 'messages' array" });
      return;
    }

    const ai = getAIClient();

    // Inject profile and guidelines as a strong system instruction
    const systemInstruction = `You are "Paisa Blueprint AI Coach", an expert personal financial adviser specializing in Indian personal finance, salaried employees, and government salary structures.
Your tone is encouraging, objective, smart, and financially prudent. You think like a typical middle-class or wealthy Indian household optimizer (minimizing taxes, maximizing safe compounding via Mutual Funds/SIP, buying Term over ULIP, keeping a solid emergency fund).

Use Indian Rupees (₹, Lakhs, Crores) for all numbers.
Where relevant, consider Indian tax schemes:
- Old Tax Regime deductions (Section 80C up to 1.5L, NPS Section 80CCD(1B) up to 50k, Standard Deduction 50k, Section 80D health insurance, HRA exempt).
- New Tax Regime (Standard deduction 75k, no major deductions, lower overall slab rates).
- High priority to safe compounding, NPS, PPF, EPF, and direct/regular mutual fund SIP schemes.

User Context:
${userProfile ? JSON.stringify(userProfile, null, 2) : "No specific profile shared yet. Ask them details if needed."}

Follow these instructions strictly:
1. Always give concrete, real Indian financial recommendations, never vague generalities.
2. If given salary figures, analyze their savings potential using the 50/30/20 rule adjusted for Indian scenarios.
3. Suggest clear action items (e.g., "Park 6 months of expenses in an arbitrage fund or sweep-in FD for emergency").
4. Keep answers concise, highly structured using markdown bolding and lists, and very action-oriented. Never write massive unbroken paragraphs.`;

    // Map messages payload to structure for general generateContent
    // The last message is the prompt. We can concatenate history or use chats API.
    // Let's use the chats API to keep it simple and robust, or pass the full list.
    // To keep it simple and compliant with chats.create:
    const chatInstance = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    // Send history first if any, then the last message
    // To support multiple turns seamlessly:
    let responseText = "";
    if (messages.length > 1) {
      // Re-feed chat history
      for (let i = 0; i < messages.length - 1; i++) {
        await chatInstance.sendMessage({ message: messages[i].content });
      }
    }
    
    const lastMessage = messages[messages.length - 1]?.content || "Hello";
    const result = await chatInstance.sendMessage({ message: lastMessage });
    
    responseText = result.text || "I was unable to formulate a response. Please try again.";

    res.json({
      role: "assistant",
      content: responseText
    });
  } catch (error: any) {
    console.error("AI Coach Error:", error);
    res.status(500).json({ 
      error: error.message || "An internal error occurred with the AI Coach.",
      isConfigError: !process.env.GEMINI_API_KEY
    });
  }
});

// Configure Vite or Serve Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Joined Vite dev middlewares.");
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Serving static files from ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Paisa Blueprint running on http://localhost:${PORT}`);
  });
}

startServer();
