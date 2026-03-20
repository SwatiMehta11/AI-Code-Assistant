import axios from "axios";
import { Message } from "../types";

export async function chatWithAssistant(message: string, history: Message[]): Promise<string> {
  try {
    const response = await axios.post("/api/chat", {
      message,
      history: history.map(m => ({ role: m.role, content: m.content }))
    });

    return response.data.text;
  } catch (error) {
    console.error("Chat error:", error);
    throw new Error("Failed to communicate with assistant");
  }
}
