"use client"

import { Wifi } from "lucide-react"
import type { TabId } from "./nav-bar"

interface StatusHeaderProps {
  activeTab: TabId
}

const tabTitles: Record<TabId, string> = {
  chat: "Arya AI",
  memory: "Memory Bank",
  diagnostics: "Diagnostics",
}

export function StatusHeader({ activeTab }: StatusHeaderProps) {
  return (
    <header className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping opacity-50" />
          </div>
          <h1 className="text-base font-semibold text-foreground">
            {tabTitles[activeTab]}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-muted-foreground">v2.0</span>
        </div>
      </div>
    </header>
  )
}
