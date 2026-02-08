"use client"

import { MessageSquare, Brain, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export type TabId = "chat" | "memory" | "diagnostics"

interface NavBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "memory", label: "Memory", icon: Brain },
  { id: "diagnostics", label: "System", icon: Activity },
]

export function NavBar({ activeTab, onTabChange }: NavBarProps) {
  return (
    <nav className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-3 px-6 min-h-[56px] transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
