"use client"

import type { UIMessage } from "ai"
import { cn } from "@/lib/utils"
import { Soundwave } from "./soundwave"

interface ChatMessageProps {
  message: UIMessage
  isStreaming?: boolean
}

function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return ""
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isArya = message.role === "assistant"
  const text = getMessageText(message)

  if (!text) return null

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isArya ? "justify-start" : "justify-end"
      )}
    >
      {isArya && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            {isStreaming ? (
              <Soundwave isActive barCount={3} className="h-3" />
            ) : (
              <span className="text-xs font-mono text-primary font-semibold">A</span>
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3",
          isArya
            ? "bg-card border border-border text-card-foreground"
            : "bg-primary/15 border border-primary/20 text-foreground"
        )}
      >
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {text}
        </div>
      </div>

      {!isArya && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
            <span className="text-xs font-mono text-muted-foreground">You</span>
          </div>
        </div>
      )}
    </div>
  )
}
