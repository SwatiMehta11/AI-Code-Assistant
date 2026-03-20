import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Knowledge base content from Endee repo
const ENDEE_KNOWLEDGE = `
# Endee: High-Performance Open Source Vector Database

Endee.io is a high-performance vector database designed to handle up to 1B vectors on a single node. It delivers significant performance gains through optimized indexing and execution.

## Why Endee?
- **Speed**: Sub-10ms search latency on 100M+ vectors.
- **Scale**: Designed for massive datasets on single nodes.
- **Efficiency**: Optimized memory and CPU usage for production AI.
- **Hybrid Search**: Combines vector similarity with BM25-style keyword matching.

## Use Cases
- **RAG (Retrieval-Augmented Generation)**: Enhance LLMs with private, real-time data.
- **Semantic Search**: Find content by meaning rather than just keywords.
- **Agentic AI**: Provide long-term memory for AI agents.
- **Recommendations**: High-speed matching for content and products.

## Getting Started
### Docker
\`\`\`bash
docker run -p 8080:8080 endeeio/endee
\`\`\`

### Manual Build (CMake)
1. Create build directory: \`mkdir build && cd build\`
2. Configure: \`cmake ..\`
3. Compile: \`make -j$(nproc)\`
4. Run: \`./endee\`

## API Reference
- **POST /v1/indexes**: Create a new index.
- **POST /v1/indexes/{name}/upsert**: Add vectors with metadata.
- **POST /v1/indexes/{name}/search**: Perform high-speed semantic search.
- **GET /v1/health**: Check server health and metrics.

## Performance Benchmarks
- Single Node: Up to 1B vectors.
- Latency: Sub-10ms search on 100M vectors.
- Throughput: Optimized for high-concurrency workloads.

## Community and Support
- GitHub: https://github.com/endee-io/endee
- Website: https://endee.io/
- Discord: Join our community for real-time support.
`;

async function startServer() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  app.use(express.json());

  // API Route for Chat
  app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a technical assistant for Endee, a high-performance vector database. 
                Use the following knowledge base to answer the user's question. 
                If the answer is not in the knowledge base, use your general knowledge but mention it's not in the official docs.
                
                Knowledge Base:
                ${ENDEE_KNOWLEDGE}
                
                User Question: ${message}`
              }
            ]
          }
        ],
        config: {
          systemInstruction: "You are a helpful and precise technical assistant for Endee.io. Provide code snippets where relevant."
        }
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to generate response" });
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
