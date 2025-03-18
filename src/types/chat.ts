export interface ChatMessage {
  userName: string;
  message: string;
  timestamp?: Date;
}

export interface ChatRequest {
  prompt: string;
}

export interface ChatResponse {
  userName: string;
  message: string;
}
