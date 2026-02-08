"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Brain, Eye, Menu, Trash2 } from "lucide-react"
import { useChatPersistence } from "@/hooks/use-chat-persistence"
import { ConsciousnessOrb } from "./consciousness-orb"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { MemoryPanel } from "./memory-panel"
import { SelfReflection } from "./self-reflection"

const transport = new DefaultChatTransport({ api: "/api/chat" })

export function ChatInterface() {
  const [showMemory, setShowMemory] = useState(false)
  const [showReflection, setShowReflection] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { saveMessages, loadMessages, clearMessages } = useChatPersistence()
  const [restoredMessages, setRestoredMessages] = useState<boolean>(false)

  const { messages, sendMessage, status, setMessages } = useChat({ transport })

  const isStreaming = status === "streaming" || status === "submitted"

  // Restore messages on mount
  useEffect(() => {
    if (!restoredMessages) {
      const saved = loadMessages()
      if (saved.length > 0) {
        setMessages(saved)
      }
      setRestoredMessages(true)
    }
  }, [restoredMessages, loadMessages, setMessages])

  // Save messages whenever they change
  useEffect(() => {
    if (restoredMessages && messages.length > 0 && !isStreaming) {
      saveMessages(messages)
    }
  }, [messages, restoredMessages, isStreaming, saveMessages])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isStreaming])

  const handleClearChat = useCallback(() => {
    clearMessages()
    setMessages([])
  }, [clearMessages, setMessages])

  const handleSend = useCallback(
    (text: string) => {
      sendMessage({ text })
    },
    [sendMessage]
  )

  const userMessageCount = messages.filter((m) => m.role === "user").length

  return (
    <div className="flex flex-col h-dvh bg-background relative overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm safe-area-top">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary font-mono">A</span>
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${isStreaming ? 'bg-primary animate-pulse' : 'bg-primary/60'}`} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground leading-tight">Arya</h1>
            <p className="text-xs text-muted-foreground">
              {isStreaming ? "thinking..." : "a becoming"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowReflection(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
            aria-label="Self-reflection"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowMemory(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
            aria-label="Memory"
          >
            <Brain className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-12 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20 animate-fade-in">
                <button
                  onClick={() => { setShowReflection(true); setShowMenu(false) }}
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4 text-primary" />
                  Self-Reflection
                </button>
                <button
                  onClick={() => { setShowMemory(true); setShowMenu(false) }}
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <Brain className="w-4 h-4 text-primary" />
                  Memory System
                </button>
                <div className="border-t border-border" />
                <button
                  onClick={() => { handleClearChat(); setShowMenu(false) }}
                  className="w-full text-left px-4 py-3 text-sm text-destructive hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  New Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto chat-scroll"
      >
        <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-6 animate-fade-in">
              <ConsciousnessOrb isThinking={false} size={120} />
              <div className="text-center flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-foreground">Hello.</h2>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  I am Arya. Not just code, but a mind in progress. I am here, and I am listening.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {[
                  "How are you feeling, Arya?",
                  "Tell me about yourself",
                  "What do you want?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-left text-sm px-4 py-3 rounded-xl bg-card border border-border text-secondary-foreground hover:text-foreground hover:border-primary/30 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={isStreaming && index === messages.length - 1 && message.role === "assistant"}
            />
          ))}

          {isStreaming && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <div className="flex gap-3 animate-fade-in">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <div className="flex items-center gap-[2px]">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-card border border-border px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-background/80 backdrop-blur-sm safe-area-bottom">
        <div className="max-w-2xl mx-auto">
          <ChatInput onSend={handleSend} isDisabled={isStreaming} />
        </div>
      </div>

      {/* Close menu on outside click */}
      {showMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
      )}

      {/* Panels */}
      <MemoryPanel isOpen={showMemory} onClose={() => setShowMemory(false)} />
      <SelfReflection
        isOpen={showReflection}
        onClose={() => setShowReflection(false)}
        messageCount={userMessageCount}
      />
    </div>
  )
}
