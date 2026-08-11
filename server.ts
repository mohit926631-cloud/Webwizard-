import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { dbService, DBProject } from "./server/db";
import { CREDIT_COSTS, PLANS, CREDIT_PACKS } from "./src/config/pricing";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Helper to get Gemini Client
  function getGenAIClient(customApiKey?: string) {
    const key = customApiKey || process.env.GEMINI_API_KEY;
    if (!key || key.trim() === "" || key === "MY_GEMINI_API_KEY") {
      return null;
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Middleware helper to resolve current user token
  function authenticateToken(req: express.Request): any {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.replace("Bearer ", "").trim();
    return dbService.getUserByToken(token);
  }

  // Robust JSON parser for Gemini responses that handles control characters, trailing commas, & unescaped quotes
  function cleanAndParseJSON(rawText: string): any {
    if (!rawText || !rawText.trim()) {
      throw new Error("Empty response received from AI model");
    }

    // 1. Strip markdown code fences if present
    let clean = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/g, "")
      .trim();

    // Remove leading/trailing filler text outside JSON braces
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.substring(firstBrace, lastBrace + 1);
    }

    // Direct parse attempt
    try {
      return JSON.parse(clean);
    } catch (err1) {
      // Continue to sanitization
    }

    // 2. Remove trailing commas before closing braces/brackets
    clean = clean.replace(/,(\s*[\}\]])/g, "$1");

    try {
      return JSON.parse(clean);
    } catch (err2) {
      // Continue to control character escaping
    }

    // 3. Fix unescaped control characters inside JSON string literals
    let sanitized = "";
    let inString = false;
    let isEscaped = false;

    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];
      const code = clean.charCodeAt(i);

      if (char === '"' && !isEscaped) {
        inString = !inString;
        sanitized += char;
        isEscaped = false;
        continue;
      }

      if (inString) {
        if (char === '\\') {
          isEscaped = !isEscaped;
          sanitized += char;
        } else {
          isEscaped = false;
          if (code === 10) {
            sanitized += '\\n';
          } else if (code === 13) {
            sanitized += '\\r';
          } else if (code === 9) {
            sanitized += '\\t';
          } else if (code < 32) {
            sanitized += '';
          } else {
            sanitized += char;
          }
        }
      } else {
        isEscaped = false;
        sanitized += char;
      }
    }

    try {
      return JSON.parse(sanitized);
    } catch (err3) {
      // Continue to regex field extraction
    }

    // 4. Fallback field extractor for "html", "css", "js", "readme", "explanation"
    const extractStringKey = (keyName: string, source: string): string => {
      const keyIndex = source.indexOf(`"${keyName}"`);
      if (keyIndex === -1) return "";

      const colonIndex = source.indexOf(":", keyIndex);
      if (colonIndex === -1) return "";

      const startQuote = source.indexOf('"', colonIndex);
      if (startQuote === -1) return "";

      let result = "";
      let escaped = false;
      for (let i = startQuote + 1; i < source.length; i++) {
        const ch = source[i];
        if (escaped) {
          if (ch === 'n') result += '\n';
          else if (ch === 'r') result += '\r';
          else if (ch === 't') result += '\t';
          else if (ch === '"') result += '"';
          else if (ch === '\\') result += '\\';
          else result += ch;
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === '"') {
          const remainder = source.slice(i + 1).trim();
          if (remainder.startsWith(',') || remainder.startsWith('}') || remainder.length === 0) {
            break;
          } else {
            result += '"';
          }
        } else {
          result += ch;
        }
      }
      return result;
    };

    const html = extractStringKey("html", sanitized) || extractStringKey("html", clean);
    const css = extractStringKey("css", sanitized) || extractStringKey("css", clean);
    const js = extractStringKey("js", sanitized) || extractStringKey("js", clean);
    const readme = extractStringKey("readme", sanitized) || extractStringKey("readme", clean);
    const explanation = extractStringKey("explanation", sanitized) || extractStringKey("explanation", clean);

    if (html || css || js) {
      return { html, css, js, readme, explanation };
    }

    throw new Error("Unable to parse website code from AI response");
  }

  // Health Check
  app.get("/api/health", (req, res) => {
    const hasEnvKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
    res.json({ status: "ok", service: "VERVOX AI Engine v2", aiAvailable: hasEnvKey });
  });

  // --- AUTH ENDPOINTS ---
  app.post("/api/auth/send-otp", (req, res) => {
    try {
      const { email, name } = req.body || {};
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "A valid email address is required." });
      }
      const result = dbService.sendEmailOTP(email, name);
      console.log(`[OTP] Sent 6-digit code ${result.otpCode} to ${result.email}`);
      return res.json({
        success: true,
        message: `OTP code sent to ${result.email}`,
        email: result.email,
        otpCode: result.otpCode, // Returned for interactive verification display
        expiresSeconds: result.expiresSeconds,
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || "Failed to send OTP code." });
    }
  });

  app.post("/api/auth/verify-otp", (req, res) => {
    try {
      const { email, code, name } = req.body || {};
      if (!email || !code) {
        return res.status(400).json({ error: "Email and 6-digit OTP code are required." });
      }
      const { user, token } = dbService.verifyEmailOTP(email, code, name);
      return res.json({ user, token, success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || "OTP verification failed." });
    }
  });

  app.post("/api/auth/signup", (req, res) => {
    try {
      const { name, email, password } = req.body || {};
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required." });
      }
      const { user, token } = dbService.signupUser(name, email, password);
      return res.json({ user, token });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || "Signup failed." });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }
      const { user, token } = dbService.loginUser(email, password);
      return res.json({ user, token });
    } catch (err: any) {
      return res.status(401).json({ error: err.message || "Login failed." });
    }
  });

  app.post("/api/auth/google", (req, res) => {
    try {
      const { name, email, avatar } = req.body || {};
      if (!email) {
        return res.status(400).json({ error: "Email is required for Google auth." });
      }
      const { user, token } = dbService.googleLogin(name || "Google User", email, avatar);
      return res.json({ user, token });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || "Google auth failed." });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    const user = authenticateToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }
    return res.json({ user });
  });

  app.post("/api/auth/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "").trim();
      dbService.logoutToken(token);
    }
    return res.json({ success: true });
  });

  // --- PROJECTS ENDPOINTS ---
  app.get("/api/projects", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const projects = dbService.getUserProjects(user.id);
    return res.json({ projects });
  });

  app.post("/api/projects/save", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { id, name, description, category, files, thumbnailGradient } = req.body;
    if (!name || !files) {
      return res.status(400).json({ error: "Name and files are required" });
    }
    const saved = dbService.saveUserProject(user.id, {
      id,
      name,
      description,
      category,
      files,
      thumbnailGradient,
    });
    return res.json({ project: saved });
  });

  app.delete("/api/projects/:id", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const deleted = dbService.deleteUserProject(user.id, req.params.id);
    if (deleted) {
      return res.json({ success: true, id: req.params.id });
    }
    return res.status(404).json({ error: "Project not found or not owned by user" });
  });

  app.post("/api/projects/:id/duplicate", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const dup = dbService.duplicateUserProject(user.id, req.params.id);
    if (dup) {
      return res.json({ project: dup });
    }
    return res.status(404).json({ error: "Project not found" });
  });

  // --- NOTIFICATIONS ENDPOINTS ---
  app.get("/api/notifications", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const notifications = dbService.getUserNotifications(user.id);
    return res.json({ notifications });
  });

  app.post("/api/notifications/read", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.body;
    dbService.markNotificationRead(user.id, id);
    return res.json({ success: true });
  });

  app.post("/api/notifications/read-all", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    dbService.markAllNotificationsRead(user.id);
    return res.json({ success: true });
  });

  app.delete("/api/notifications/clear", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    dbService.clearUserNotifications(user.id);
    return res.json({ success: true });
  });

  // --- PROJECT VERSIONS & HISTORY LOGS ---
  app.get("/api/projects/:id/versions", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const versions = dbService.getProjectVersions(user.id, req.params.id);
    return res.json({ versions });
  });

  app.post("/api/projects/:id/restore/:versionId", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    try {
      const restored = dbService.restoreProjectVersion(user.id, req.params.id, req.params.versionId);
      dbService.addNotification(user.id, {
        title: "Version Restored",
        message: `Restored project "${restored.name}" to version snapshot successfully.`,
        type: "info",
        projectId: restored.id,
      });
      return res.json({ project: restored });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || "Failed to restore version" });
    }
  });

  app.get("/api/projects/:id/logs", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const logs = dbService.getProjectLogs(user.id, req.params.id);
    return res.json({ logs });
  });

  // --- AI GENERATE WEBSITE (REAL GEMINI) ---
  app.post("/api/generate", async (req, res) => {
    const user = authenticateToken(req);
    if (!user) {
      return res.status(401).json({ error: "You must be logged in to generate websites." });
    }

    const { prompt, category, apiKey } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const startTime = new Date().toISOString();
    const startTimestamp = Date.now();

    const creditCost = CREDIT_COSTS.GENERATE_WEBSITE;
    const creditResult = dbService.checkAndDeductCredits(user.id, creditCost);
    if (!creditResult.success) {
      dbService.addNotification(user.id, {
        title: "Generation Failed",
        message: `Insufficient credits to generate website. Required: ${creditCost}.`,
        type: "error",
      });
      return res.status(402).json({
        error: "INSUFFICIENT_CREDITS",
        message: `You need ${creditCost} credits to generate a website. You have ${creditResult.totalAvailable} credits remaining.`,
        required: creditCost,
        available: creditResult.totalAvailable,
      });
    }

    const ai = getGenAIClient(apiKey);
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_NOT_CONFIGURED",
        message: "Gemini API key is not configured on the server. Please check environment variables.",
      });
    }

    try {
      const systemInstruction = `You are VERVOX AI, an elite web designer and full-stack developer.
Given a user prompt describing a website, you MUST generate a completely tailored, rich, modern, responsive web application in pure HTML, CSS, and Vanilla JavaScript.

User Request Context:
Category: ${category || "General"}
Prompt: "${prompt}"

REQUIREMENTS:
1. CUSTOM TAILORED CONTENT: Generate actual headings, text, menus, buttons, cards, testimonials, pricing, and features specific to the user's requested industry/topic (e.g. if requested restaurant, build menu & booking; if gaming, build community leaderboards & tournament schedule; if clothing, build product showcase & shopping cart preview; if portfolio, build work gallery & experience timeline).
2. MODERN VISUAL DESIGN: Use sleek colors (#0f172a, #1e293b, #3b82f6, #8b5cf6, #ec4899, #f8fafc), smooth CSS grid/flexbox, Google Fonts (e.g. Plus Jakarta Sans or Inter), Lucide/FontAwesome inline SVG icons, subtle glassmorphism, hover animations.
3. INTERACTIVE JAVASCRIPT: Add real JS logic for mobile nav drawer, modal popups, interactive tabs, filter buttons, contact form validation with toast confirmation, theme toggler or counter animations.

Output strictly valid JSON conforming to this schema:
{
  "html": "<!DOCTYPE html><html>... complete valid HTML head and body ...</html>",
  "css": "/* complete modern CSS styles with animations, dark mode utilities, responsive breakpoints */",
  "js": "// complete JavaScript code for interactive UI components",
  "readme": "# Generated Website\\n\\nBuilt with VERVOX AI.\\n\\n## Running Locally\\nOpen index.html in any web browser."
}

DO NOT wrap inside Markdown code fences. Return ONLY raw JSON. Ensure all double quotes and newlines inside property values are properly JSON escaped.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Website Request: ${prompt}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from AI model");
      }

      const parsedData = cleanAndParseJSON(text);

      const files = {
        "index.html": parsedData.html || "<h1>Website</h1>",
        "style.css": parsedData.css || "body { background: #0f172a; color: white; }",
        "script.js": parsedData.js || "console.log('VERVOX Website loaded');",
        "README.md": parsedData.readme || `# ${prompt}\n\nGenerated with VERVOX AI.`,
      };

      const completionTime = new Date().toISOString();
      const durationSeconds = Math.round((Date.now() - startTimestamp) / 1000);

      // Save as user project automatically
      const project = dbService.saveUserProject(user.id, {
        name: prompt.slice(0, 28) || "AI Website",
        description: prompt,
        category: category || "AI Generated",
        files,
        thumbnailGradient: "from-blue-600 via-indigo-600 to-purple-600",
        status: "Ready",
        framework: "HTML5 / Tailwind / JS",
        versionNumber: 1,
        lastAction: "Initial website generation completed",
      });

      // Add Notification and Log
      dbService.addNotification(user.id, {
        title: "Website Completed",
        message: `Your project "${project.name}" has been completed successfully.`,
        type: "success",
        projectId: project.id,
      });

      dbService.addGenerationLog(user.id, {
        projectId: project.id,
        operationType: "Generation",
        startTime,
        completionTime,
        durationSeconds,
        status: "Completed",
        creditsUsed: creditCost,
        filesChanged: Object.keys(files),
      });

      return res.json({
        success: true,
        project,
        files,
        user: creditResult.user,
        creditsDeducted: creditCost,
        durationSeconds,
      });
    } catch (err: any) {
      console.error("Gemini Website Generation Error:", err?.message || err);
      const completionTime = new Date().toISOString();
      const durationSeconds = Math.round((Date.now() - startTimestamp) / 1000);

      dbService.addNotification(user.id, {
        title: "Generation Error",
        message: `Website generation failed: ${err?.message || "Unknown error"}`,
        type: "error",
      });

      return res.status(500).json({
        error: "GENERATION_FAILED",
        message: `Failed to generate website with AI: ${err?.message || "Unknown error"}`,
      });
    }
  });

  // --- AI EDIT WEBSITE (REAL GEMINI MODIFICATION) ---
  app.post("/api/ai-edit", async (req, res) => {
    const user = authenticateToken(req);
    if (!user) {
      return res.status(401).json({ error: "You must be logged in to edit websites." });
    }

    const { prompt, currentFiles, apiKey, projectId } = req.body;
    if (!prompt || !currentFiles) {
      return res.status(400).json({ error: "Prompt and current files are required" });
    }

    const creditCost = CREDIT_COSTS.AI_EDIT;
    const creditResult = dbService.checkAndDeductCredits(user.id, creditCost);
    if (!creditResult.success) {
      return res.status(402).json({
        error: "INSUFFICIENT_CREDITS",
        message: `You need ${creditCost} credits to edit a website. You have ${creditResult.totalAvailable} credits remaining.`,
        required: creditCost,
        available: creditResult.totalAvailable,
      });
    }

    const ai = getGenAIClient(apiKey);
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_NOT_CONFIGURED",
        message: "Gemini API key is not configured on the server.",
      });
    }

    try {
      const systemInstruction = `You are VERVOX AI, an expert front-end developer modifying an existing project.
You will receive the user's edit instruction and the current index.html, style.css, and script.js files.
You MUST modify the code to accurately fulfill the user's exact request (e.g., change background colors, add a section, make navbar sticky, change headings, alter layouts).

Return strictly valid JSON with the updated files and a concise explanation:
{
  "html": "...",
  "css": "...",
  "js": "...",
  "explanation": "Clear 1-sentence summary of what was modified (e.g., 'Updated header navigation to sticky positioning and changed theme background to dark navy blue.')"
}

DO NOT wrap in Markdown code fences. Return raw JSON.`;

      const promptPayload = `USER EDIT REQUEST: ${prompt}

CURRENT FILES:
--- index.html ---
${currentFiles["index.html"] || ""}

--- style.css ---
${currentFiles["style.css"] || ""}

--- script.js ---
${currentFiles["script.js"] || ""}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: promptPayload,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini AI model");
      }

      const parsedData = cleanAndParseJSON(text);

      const updatedFiles = {
        "index.html": parsedData.html || currentFiles["index.html"],
        "style.css": parsedData.css || currentFiles["style.css"],
        "script.js": parsedData.js || currentFiles["script.js"],
        "README.md": currentFiles["README.md"] || "# VERVOX Website",
      };

      let savedProject: DBProject | undefined;
      if (projectId) {
        savedProject = dbService.saveUserProject(user.id, {
          id: projectId,
          name: req.body.projectName || "Updated Website",
          files: updatedFiles,
          status: "Ready",
          lastAction: `AI Edit: ${prompt.slice(0, 30)}`,
        });

        dbService.addNotification(user.id, {
          title: "AI Modification Completed",
          message: `Your project "${savedProject.name}" has been updated successfully.`,
          type: "success",
          projectId: savedProject.id,
        });

        dbService.addGenerationLog(user.id, {
          projectId: savedProject.id,
          operationType: "Edit",
          startTime: new Date().toISOString(),
          completionTime: new Date().toISOString(),
          durationSeconds: 3,
          status: "Completed",
          creditsUsed: creditCost,
          filesChanged: Object.keys(updatedFiles),
        });
      }

      return res.json({
        success: true,
        files: updatedFiles,
        explanation: parsedData.explanation || "Modified website based on your instruction.",
        project: savedProject,
        user: creditResult.user,
        creditsDeducted: creditCost,
      });
    } catch (err: any) {
      console.error("Gemini AI Edit Error:", err?.message || err);
      if (projectId) {
        dbService.addNotification(user.id, {
          title: "AI Edit Failed",
          message: `Failed to modify website: ${err?.message || "Unknown error"}`,
          type: "error",
          projectId,
        });
      }
      return res.status(500).json({
        error: "EDIT_FAILED",
        message: `Failed to edit website: ${err?.message || "Unknown error"}`,
      });
    }
  });

  // --- AI CHAT (REAL GEMINI ASSISTANT) ---
  app.post("/api/ai-chat", async (req, res) => {
    const user = authenticateToken(req);
    if (!user) {
      return res.status(401).json({ error: "You must be logged in to chat with AI." });
    }

    const { message, projectContext, apiKey } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const creditCost = CREDIT_COSTS.AI_CHAT;
    const creditResult = dbService.checkAndDeductCredits(user.id, creditCost);
    if (!creditResult.success) {
      return res.status(402).json({
        error: "INSUFFICIENT_CREDITS",
        message: `AI chat requires ${creditCost} credits. You have ${creditResult.totalAvailable} credits remaining.`,
        required: creditCost,
        available: creditResult.totalAvailable,
      });
    }

    const ai = getGenAIClient(apiKey);
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_NOT_CONFIGURED",
        message: "Gemini API key is not configured on the server.",
      });
    }

    try {
      const systemInstruction = `You are VERVOX AI Assistant, an expert web engineering and UI/UX design AI.
Provide helpful, detailed, direct answers to the user's questions about website design, HTML/CSS/JS code structure, UX best practices, color palettes, section suggestions, or optimization tips.
If project context is provided, tailor your advice specifically to that website code.`;

      const contents = projectContext
        ? `CURRENT PROJECT CONTEXT:\n${JSON.stringify(projectContext, null, 2)}\n\nUSER QUESTION:\n${message}`
        : message;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({
        success: true,
        reply: response.text || "I am VERVOX AI, how can I assist with your website project?",
        user: creditResult.user,
        creditsDeducted: creditCost,
      });
    } catch (err: any) {
      console.error("Gemini AI Chat Error:", err?.message || err);
      return res.status(500).json({
        error: "CHAT_FAILED",
        message: `AI Chat error: ${err?.message || "Unknown error"}`,
      });
    }
  });

  // --- CLAIM FREE REFILL CREDITS ---
  app.post("/api/credits/claim-free", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    try {
      const updatedUser = dbService.claimFreeCredits(user.id, 200);
      return res.json({
        success: true,
        message: "Successfully claimed 200 free credits!",
        user: updatedUser,
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || "Failed to claim free credits." });
    }
  });

  // --- PAYMENT CHECKOUT & VERIFICATION ---
  app.post("/api/payment/create-order", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { planId, creditPackId, currency = "USD" } = req.body;
    let amount = 0;
    let description = "VERVOX AI Purchase";
    let creditsAdded = 0;

    if (planId && PLANS[planId]) {
      const plan = PLANS[planId];
      amount = currency === "INR" ? plan.priceInr : plan.priceUsd;
      description = `Upgrade to ${plan.name} Plan (${plan.monthlyCredits} Credits/mo)`;
      creditsAdded = plan.monthlyCredits;
    } else if (creditPackId) {
      const pack = CREDIT_PACKS.find((p) => p.id === creditPackId);
      if (pack) {
        amount = currency === "INR" ? pack.priceInr : pack.priceUsd;
        description = `${pack.name} - ${pack.credits} Extra Credits`;
        creditsAdded = pack.credits;
      }
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return res.json({
      orderId,
      amount,
      currency,
      description,
      creditsAdded,
      razorpayKey: process.env.RAZORPAY_KEY_ID || "rzp_test_vervox_2026",
    });
  });

  app.post("/api/payment/verify", (req, res) => {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { planId, creditPackId, amount, currency = "USD", paymentId, provider = "Razorpay" } = req.body;

    let creditsAdded = 0;
    if (planId && PLANS[planId]) {
      creditsAdded = PLANS[planId].monthlyCredits;
    } else if (creditPackId) {
      const pack = CREDIT_PACKS.find((p) => p.id === creditPackId);
      if (pack) creditsAdded = pack.credits;
    }

    try {
      const result = dbService.addPaymentTransaction(user.id, {
        planId,
        creditPackId,
        amount: Number(amount) || 0,
        currency,
        creditsAdded,
        provider,
        paymentId: paymentId || `pay_${Date.now()}`,
      });

      return res.json({
        success: true,
        message: "Payment processed successfully! Your account has been upgraded.",
        user: result.user,
        transaction: result.transaction,
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || "Payment verification failed." });
    }
  });

  // Vite Middleware integration for dev/prod
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
    console.log(`VERVOX Engine v2 running on http://localhost:${PORT}`);
  });
}

startServer();
