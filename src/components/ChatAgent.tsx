import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Loader2,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  chatWithAssistant,
  synthesizeFindings,
} from "@/lib/groq-chat";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What developmental features are associated with ZFHX4 loss of function?",
  "How was the ZFHX4 connection discovered?",
  "What do zebrafish studies tell us?",
  "Are there any treatment options?",
];

export default function ChatAgent() {
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(true);
  const [isChatting, setIsChatting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    synthesizeFindings()
      .then(setSynthesis)
      .catch(() => {
        setError(
          "Unable to load research synthesis. Make sure the chat service is deployed.",
        );
      })
      .finally(() => setIsSynthesizing(false));
  }, []);

  async function handleSend(text?: string) {
    const question = (text ?? input).trim();
    if (!question || isChatting) return;

    setInput("");
    setError(null);

    const userMessage: ChatMessage = { role: "user", content: question };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsChatting(true);

    try {
      const reply = await chatWithAssistant(nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch {
      setError("Something went wrong. Please try again.");
      setMessages(nextMessages);
    } finally {
      setIsChatting(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <section className="mx-auto max-w-[1240px] px-5 pb-20 pt-6 sm:px-8 lg:px-10">
      <div className="overflow-hidden rounded-2xl border border-[#d4e5df] bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-[#edf1ef] bg-[#f8fbfa] px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#18322f] text-[#d9f0e9]">
              <Bot className="size-[18px]" />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#18322f]">
                Ask about ZFHX4 Research
              </h2>
              <p className="text-sm text-[#71837f]">
                AI-powered answers grounded in published research
              </p>
            </div>
          </div>
        </div>

        {/* Synthesis card */}
        <div className="border-b border-[#edf1ef] bg-[#f5f9f7] px-6 py-5 sm:px-8">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-[#398b74]" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5d8a7a]">
                Key Findings
              </p>
              {isSynthesizing ? (
                <div className="mt-3 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-4 animate-pulse rounded bg-[#d4e5df]"
                      style={{ width: `${85 - i * 10}%` }}
                    />
                  ))}
                </div>
              ) : synthesis ? (
                <div className="mt-3 whitespace-pre-line text-sm leading-6 text-[#3a5c53]">
                  {synthesis}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Chat messages */}
        {messages.length > 0 && (
          <div className="max-h-[420px] overflow-y-auto px-6 py-5 sm:px-8">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`mb-4 flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#e7f4ef] text-[#398b74]">
                      <Bot className="size-3.5" />
                    </span>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      msg.role === "user"
                        ? "bg-[#18322f] text-white"
                        : "bg-[#f5f8f7] text-[#2e4f47] border border-[#e4ece8]"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#18322f] text-[#d9f0e9]">
                      <User className="size-3.5" />
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {isChatting && (
              <div className="flex gap-3">
                <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#e7f4ef] text-[#398b74]">
                  <Bot className="size-3.5" />
                </span>
                <div className="flex items-center gap-2 rounded-2xl bg-[#f5f8f7] px-4 py-3 text-sm text-[#71837f] border border-[#e4ece8]">
                  <Loader2 className="size-3.5 animate-spin" />
                  Thinking…
                </div>
              </div>
            )}
            {error && (
              <p className="mt-2 text-center text-xs text-red-500">
                {error}
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Suggested questions */}
        <div className="border-t border-[#edf1ef] bg-[#fbfcfb] px-6 pt-4 pb-2 sm:px-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#81958f]">
            {messages.length === 0
              ? "Suggested questions"
              : "Ask a follow-up"}
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                disabled={isChatting || isSynthesizing}
                onClick={() => handleSend(question)}
                className="cursor-pointer rounded-full border border-[#d4e5df] bg-white px-3.5 py-1.5 text-xs font-medium text-[#3a5c53] transition-colors hover:border-[#a8cabe] hover:bg-[#f0f7f4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-[#edf1ef] bg-white px-6 py-4 sm:px-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about ZFHX4 research…"
              disabled={isChatting || isSynthesizing}
              className="h-11 flex-1 border-[#d5e2de] bg-[#f8fbfa] text-sm placeholder:text-[#a0b3ae] focus-visible:ring-[#a8d8c9]"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isChatting || isSynthesizing || !input.trim()}
              className="size-11 shrink-0 cursor-pointer bg-[#398b74] text-white hover:bg-[#2d755f] disabled:opacity-40"
              aria-label="Send message"
            >
              {isChatting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
