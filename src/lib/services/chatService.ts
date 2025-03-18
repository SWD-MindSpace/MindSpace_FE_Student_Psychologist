import { ChatRequest, ChatResponse } from "@/types/chat";

const CHAT_API_URL = "https://localhost:7096/api/v1/chat-agents/generate";

export const generateChatResponse = async (prompt: string): Promise<ChatResponse> => {
  try {
    const request: ChatRequest = { prompt };
    const response = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Failed to generate chat response");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw error;
  }
};
