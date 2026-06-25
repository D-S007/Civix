import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/analyze-issue", async (req, res) => {
    try {
      const { imageUrl, lat, lng, description, address } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
      }

      const ai = new GoogleGenAI({ apiKey });

      // Fetch the image to pass as inlineData
      const imageRes = await fetch(imageUrl);
      const arrayBuffer = await imageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = imageRes.headers.get("content-type") || "image/jpeg";

      const imagePart = {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType,
        },
      };

      // 1. Vision Agent
      const visionPrompt = `
      You are a civic infrastructure inspector AI working for a municipal government.
      When given an image of a public space, analyze it and return ONLY valid JSON.
      Do not add any explanation outside the JSON block.
      
      Analyze this image from GPS coordinates: ${lat}, ${lng}
      Location context: ${address}
      `;

      const visionSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          issue_detected: { type: Type.BOOLEAN },
          primary_issue_type: { type: Type.STRING },
          severity: { type: Type.STRING },
          severity_reason: { type: Type.STRING },
          estimated_affected_area_sqm: { type: Type.NUMBER, nullable: true },
          visible_hazard_to_public: { type: Type.BOOLEAN },
          confidence_score: { type: Type.NUMBER },
          recommended_department: { type: Type.STRING },
        },
        required: ["issue_detected", "primary_issue_type", "severity", "confidence_score"],
      };

      const visionResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [visionPrompt, imagePart],
        config: {
          responseMimeType: "application/json",
          responseSchema: visionSchema,
        },
      });

      const visionResult = JSON.parse(visionResponse.text || "{}");

      // 2. Category Agent
      const categoryPrompt = `
      You are a civic issue classification engine.
      Your job is to assign a structured category to a reported civic issue.
      
      ALLOWED CATEGORIES:
      - Roads & Infrastructure: pothole, road_damage, bridge_issue, footpath_damage
      - Sanitation: garbage_overflow, open_defecation, dead_animal, sewage_leak
      - Utilities: water_leak, pipeline_burst, electricity_failure, streetlight_broken
      - Public Safety: encroachment, illegal_construction, tree_fall_risk, accident_prone_zone
      
      Issue Description: ${description}
      Vision Agent Result: ${JSON.stringify(visionResult)}
      Location: ${address}
      `;

      const categorySchema: Schema = {
        type: Type.OBJECT,
        properties: {
          primary_category: { type: Type.STRING },
          sub_category: { type: Type.STRING },
          department_routing: { type: Type.STRING },
          requires_urgent_attention: { type: Type.BOOLEAN },
          public_safety_risk: { type: Type.BOOLEAN },
        },
      };

      const categoryResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: categoryPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: categorySchema,
        },
      });
      const categoryResult = JSON.parse(categoryResponse.text || "{}");

      // 3. Priority Agent
      const priorityPrompt = `
      You are a civic issue prioritization engine for a municipal authority.
      Combine multiple signals to compute a final priority score for resource allocation.
      
      Category: ${categoryResult.primary_category}
      Severity: ${visionResult.severity}
      Location context: ${address}
      `;

      const prioritySchema: Schema = {
        type: Type.OBJECT,
        properties: {
          priority_score: { type: Type.NUMBER },
          priority_label: { type: Type.STRING },
          recommended_response_hours: { type: Type.NUMBER },
          escalate_to_senior: { type: Type.BOOLEAN },
        },
      };

      const priorityResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: priorityPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: prioritySchema,
        },
      });
      const priorityResult = JSON.parse(priorityResponse.text || "{}");

      // 4. Resolution Prediction
      const resolutionPrompt = `
      You are a civic issue resolution prediction AI.
      Estimate when this new issue will be resolved based on department workload and complexity.
      
      Issue Type: ${categoryResult.primary_category} / ${categoryResult.sub_category}
      Priority: ${priorityResult.priority_label}
      Department: ${categoryResult.department_routing}
      `;

      const resolutionSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          estimated_resolution_days: { type: Type.NUMBER },
          confidence: { type: Type.STRING },
          citizen_friendly_message: { type: Type.STRING },
        },
      };

      const resolutionResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: resolutionPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: resolutionSchema,
        },
      });
      const resolutionResult = JSON.parse(resolutionResponse.text || "{}");

      res.json({
        vision: visionResult,
        category: categoryResult,
        priority: priorityResult,
        resolution: resolutionResult,
      });
    } catch (error: any) {
      console.error("Agent error:", error);
      res.status(500).json({ error: error.message });
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
