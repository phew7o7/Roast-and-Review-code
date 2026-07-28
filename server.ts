import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set("trust proxy", 1);
  app.use(express.json({ limit: "5mb" }));

  // Basic in-memory IP-based rate limiter
  const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
  
  const rateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // In production, you might want to use app.set('trust proxy', 1) if behind a load balancer
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 10; // max 10 requests per minute per IP
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitMap.get(ip)!;
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({ error: "Too many requests. Please try again in a minute." });
    }
    
    record.count++;
    next();
  };

  // API Routes
  app.post("/api/review", rateLimiter, async (req, res) => {
    try {
      const { code, language, style } = req.body;

      if (!code) {
        return res.status(400).json({ error: "Code is required" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let styleInstruction = "A funny roast mode that jokes about the user's code.";
      if (style && style !== "Default") {
         styleInstruction = `A funny roast mode that jokes about the user's code IN THE PERSONA AND STYLE OF: ${style}.`;
      }

      const systemInstruction = `You are an AI code reviewer with two personalities:
1. ${styleInstruction}
2. A serious senior software engineer who gives genuinely useful feedback.

Rules:
- Roast the code, never the programmer.
- Keep jokes creative and lighthearted.
- Do not insult intelligence, identity, or experience.
- After every roast, explain the actual issue.
- If the code is already good, compliment it while making playful jokes.
- Never invent bugs that don't exist.
- Suggest cleaner alternatives where appropriate.
- Use markdown formatting.

Response format:

# 🔥 Roast

(3-6 funny roast bullets)

---

# 🛠 Actual Review

## What's Good
- ...

## Problems
- ...

## Suggestions
- ...

---

# ⭐ Overall Rating

Readability: X/10

Performance: X/10

Maintainability: X/10

Bug Risk: X/10

Final Verdict:
(2-3 sentences)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Please review the following ${language || "code"} snippet:\n\n\`\`\`\n${code}\n\`\`\``,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ review: response.text });
    } catch (error) {
      console.error("Error generating review:", error);
      res.status(500).json({ error: "Failed to generate review" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
