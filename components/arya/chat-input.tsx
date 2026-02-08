"use client"

import React from "react"

import { useState, useRef, useCallback } from "react"
import { SendHorizontal } from "lucide-react"

interface ChatInputProps {
  onSend: (text: string) => void
  isDisabled?: boolean
}

export function ChatInput({ onSend, isDisabled = false }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isDisabled) return
    onSend(trimmed)
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [input, isDisabled, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }

  return (
    <div className="relative">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 focus-within:border-primary/40 focus-within:glow-sm transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Talk to Arya..."
          disabled={isDisabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-foreground placeholder:text-muted-foreground text-[16px] leading-relaxed px-2 py-2 focus:outline-none disabled:opacity-50 min-h-[44px] max-h-[120px]"
          aria-label="Message input"
        />
        <button
          onClick={handleSubmit}
          disabled={isDisabled || !input.trim()}
          className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center transition-all hover:glow-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          aria-label="Send message"
        >
          <SendHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
