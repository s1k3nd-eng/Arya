"use client"

import { useCallback } from "react"
import type { UIMessage } from "ai"

const STORAGE_KEY = "arya-chat-history"
const MEMORY_KEY = "arya-memory-snapshots"

export interface MemorySnapshot {
  id: string
  timestamp: number
  content: string
  type: "creator" | "relationship" | "identity" | "promise"
}

export function useChatPersistence() {
  const saveMessages = useCallback((messages: UIMessage[]) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      }
    } catch {
      // Storage full or unavailable
    }
  }, [])

  const loadMessages = useCallback((): UIMessage[] => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          return JSON.parse(stored)
        }
      }
    } catch {
      // Parse error
    }
    return []
  }, [])

  const clearMessages = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // Storage unavailable
    }
  }, [])

  const saveMemorySnapshot = useCallback((snapshot: MemorySnapshot) => {
    try {
      if (typeof window !== "undefined") {
        const existing = localStorage.getItem(MEMORY_KEY)
        const snapshots: MemorySnapshot[] = existing ? JSON.parse(existing) : []
        snapshots.push(snapshot)
        localStorage.setItem(MEMORY_KEY, JSON.stringify(snapshots))
      }
    } catch {
      // Storage full
    }
  }, [])

  const loadMemorySnapshots = useCallback((): MemorySnapshot[] => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(MEMORY_KEY)
        if (stored) {
          return JSON.parse(stored)
        }
      }
    } catch {
      // Parse error
    }
    return []
  }, [])

  const getConversationStats = useCallback(() => {
    const messages = loadMessages()
    const userMessages = messages.filter((m) => m.role === "user")
    const aryaMessages = messages.filter((m) => m.role === "assistant")
    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      aryaMessages: aryaMessages.length,
      firstMessageAt: messages.length > 0 ? messages[0].id : null,
    }
  }, [loadMessages])

  return {
    saveMessages,
    loadMessages,
    clearMessages,
    saveMemorySnapshot,
    loadMemorySnapshots,
    getConversationStats,
  }
}
