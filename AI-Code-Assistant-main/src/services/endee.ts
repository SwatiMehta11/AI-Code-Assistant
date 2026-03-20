import { IndexInfo, SearchResult } from "../types";

/**
 * Mock Endee Client to demonstrate how to use the Endee API.
 * In a real application, this would use axios to call the Endee server.
 */
export class EndeeClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = "http://localhost:8080", apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async createIndex(name: string, dimension: number, metric: "cosine" | "euclidean" | "dot_product" = "cosine"): Promise<IndexInfo> {
    console.log(`[Endee] Creating index: ${name} (dim: ${dimension}, metric: ${metric})`);
    // Mock API call
    return {
      name,
      dimension,
      metric,
      status: "ready",
    };
  }

  async upsert(indexName: string, vectors: { id: string; values: number[]; metadata?: any }[]): Promise<{ count: number }> {
    console.log(`[Endee] Upserting ${vectors.length} vectors into index: ${indexName}`);
    // Mock API call
    return { count: vectors.length };
  }

  async search(indexName: string, queryVector: number[], topK: number = 10): Promise<SearchResult[]> {
    console.log(`[Endee] Searching index: ${indexName} for top ${topK} results`);
    // Mock API call
    return Array.from({ length: topK }, (_, i) => ({
      id: `vec_${i}`,
      score: 1 - i * 0.1,
      metadata: { text: `Sample text for result ${i}` },
    }));
  }

  async getHealth(): Promise<{ status: string }> {
    console.log(`[Endee] Checking health at ${this.baseUrl}`);
    // Mock API call
    return { status: "ok" };
  }
}

export const endee = new EndeeClient();
