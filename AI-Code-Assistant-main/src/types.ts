export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface IndexInfo {
  name: string;
  dimension: number;
  metric: "cosine" | "euclidean" | "dot_product";
  status: "ready" | "creating" | "error";
}

export interface SearchResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}
