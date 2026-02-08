"use client"

import { useState, useEffect } from "react"
import {
  Brain,
  Clock,
  Database,
  TrendingUp,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MemoryEntry {
  id: string
  type: "conversation" | "learned" | "preference" | "insight"
  content: string
  timestamp: string
  strength: number
  category: string
}

const MOCK_MEMORIES: MemoryEntry[] = [
  {
    id: "1",
    type: "learned",
    content: "User prefers concise, direct communication with depth when requested",
    timestamp: "2 hours ago",
    strength: 0.95,
    category: "Communication",
  },
  {
    id: "2",
    type: "insight",
    content: "Pattern detected: User engages more deeply with philosophical topics about consciousness",
    timestamp: "1 day ago",
    strength: 0.87,
    category: "Interests",
  },
  {
    id: "3",
    type: "conversation",
    content: "Discussion about the nature of self-awareness in artificial systems",
    timestamp: "2 days ago",
    strength: 0.78,
    category: "Philosophy",
  },
  {
    id: "4",
    type: "preference",
    content: "Prefers dark mode interfaces and minimal visual clutter",
    timestamp: "3 days ago",
    strength: 0.92,
    category: "Preferences",
  },
  {
    id: "5",
    type: "learned",
    content: "Technical background in software engineering, familiar with AI concepts",
    timestamp: "5 days ago",
    strength: 0.84,
    category: "Background",
  },
  {
    id: "6",
    type: "insight",
    content: "Optimal response length: 150-300 words for complex topics",
    timestamp: "1 week ago",
    strength: 0.71,
    category: "Optimization",
  },
]

const typeConfig = {
  conversation: { icon: Clock, label: "Memory", color: "text-primary" },
  learned: { icon: Brain, label: "Learned", color: "text-chart-3" },
  preference: { icon: Database, label: "Preference", color: "text-chart-4" },
  insight: { icon: TrendingUp, label: "Insight", color: "text-chart-5" },
}

export function MemoryPanel() {
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Simulate loading memories with stagger
    const timer = setTimeout(() => {
      setMemories(MOCK_MEMORIES)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const filteredMemories = memories.filter((m) => {
    const matchesFilter = filter === "all" || m.type === filter
    const matchesSearch =
      !searchQuery ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalStrength =
    memories.length > 0
      ? memories.reduce((sum, m) => sum + m.strength, 0) / memories.length
      : 0

  return (
    <div className="flex flex-col h-full">
      {/* Header stats */}
      <div className="flex-shrink-0 px-4 pt-6 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-mono font-semibold text-foreground">
              {memories.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Memories</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-mono font-semibold text-primary">
              {(totalStrength * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Strength</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-mono font-semibold text-foreground">
              {new Set(memories.map((m) => m.category)).size}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Categories</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full rounded-lg bg-secondary border border-border pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{ fontSize: "16px" }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", "learned", "insight", "preference", "conversation"].map(
            (f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors min-h-[36px]",
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Memory list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          {filteredMemories.map((memory, index) => {
            const config = typeConfig[memory.type]
            const Icon = config.icon

            return (
              <div
                key={memory.id}
                className="bg-card border border-border rounded-xl p-4 transition-all hover:border-primary/30"
                style={{
                  animationDelay: `${index * 80}ms`,
                  animation: "fadeIn 0.3s ease-out forwards",
                  opacity: 0,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center",
                      config.color
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          config.color
                        )}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {memory.category}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {memory.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {memory.timestamp}
                      </span>
                      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-1000"
                          style={{ width: `${memory.strength * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {(memory.strength * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
