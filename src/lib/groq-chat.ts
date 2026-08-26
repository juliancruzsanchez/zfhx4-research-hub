import { httpsCallable } from "firebase/functions";

import { firebaseFunctions } from "@/lib/firebase";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GroqResponse {
  content: string;
}

const groqChatCallable = httpsCallable<{
  messages?: ChatMessage[];
  action?: "chat" | "synthesize";
}, GroqResponse>(firebaseFunctions, "groqChat");

export async function synthesizeFindings(): Promise<string> {
  const result = await groqChatCallable({ action: "synthesize" });
  return result.data.content;
}

export async function chatWithAssistant(
  messages: ChatMessage[],
): Promise<string> {
  const result = await groqChatCallable({ messages });
  return result.data.content;
}
