"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  Cpu,
  Zap,
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DiagnosticItem {
  id: string
  name: string
  status: "healthy" | "warning" | "critical" | "checking"
  value: string
  detail: string
  icon: typeof Activity
}

interface AutonomousTask {
  id: string
  name: string
  status: "active" | "scheduled" | "completed"
  nextRun: string
  lastResult: string
}

export function DiagnosticsPanel() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([])
  const [tasks, setTasks] = useState<AutonomousTask[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    // Simulate diagnostics loading
    const timer = setTimeout(() => {
      setDiagnostics([
        {
          id: "1",
          name: "Cognitive Engine",
          status: "healthy",
          value: "98.7%",
          detail: "Multi-model fusion active",
          icon: Cpu,
        },
        {
          id: "2",
          name: "Memory System",
          status: "healthy",
          value: "2.4GB",
          detail: "6 memories stored, 0 conflicts",
          icon: Activity,
        },
        {
          id: "3",
          name: "Response Latency",
          status: "healthy",
          value: "142ms",
          detail: "Average over last 50 queries",
          icon: Zap,
        },
        {
          id: "4",
          name: "Security Layer",
          status: "healthy",
          value: "Active",
          detail: "All protocols enforced",
          icon: Shield,
        },
        {
          id: "5",
          name: "Self-Improvement",
          status: "warning",
          value: "Pending",
          detail: "3 optimizations queued",
          icon: RefreshCw,
        },
      ])

      setTasks([
        {
          id: "t1",
          name: "Autonomous Health Check",
          status: "active",
          nextRun: "Running now",
          lastResult: "All systems nominal",
        },
        {
          id: "t2",
          name: "Continuous Learning",
          status: "scheduled",
          nextRun: "In 15 minutes",
          lastResult: "2 new patterns acquired",
        },
        {
          id: "t3",
          name: "Memory Optimization",
          status: "scheduled",
          nextRun: "In 1 hour",
          lastResult: "Consolidated 3 memories",
        },
        {
          id: "t4",
          name: "Self Improvement Check",
          status: "completed",
          nextRun: "In 6 hours",
          lastResult: "No critical updates needed",
        },
      ])
    }, 400)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setUptime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const runDiagnostics = () => {
    setIsRunning(true)
    setDiagnostics((prev) =>
      prev.map((d) => ({ ...d, status: "checking" as const }))
    )

    // Simulate progressive checking
    setTimeout(() => {
      setDiagnostics((prev) =>
        prev.map((d, i) =>
          i === 0 ? { ...d, status: "healthy" as const } : d
        )
      )
    }, 500)
    setTimeout(() => {
      setDiagnostics((prev) =>
        prev.map((d, i) =>
          i <= 1 ? { ...d, status: "healthy" as const } : d
        )
      )
    }, 900)
    setTimeout(() => {
      setDiagnostics((prev) =>
        prev.map((d, i) =>
          i <= 2 ? { ...d, status: "healthy" as const } : d
        )
      )
    }, 1300)
    setTimeout(() => {
      setDiagnostics((prev) =>
        prev.map((d, i) =>
          i <= 3 ? { ...d, status: "healthy" as const } : d
        )
      )
    }, 1700)
    setTimeout(() => {
      setDiagnostics((prev) =>
        prev.map((d) => ({
          ...d,
          status:
            d.id === "5" ? ("warning" as const) : ("healthy" as const),
        }))
      )
      setIsRunning(false)
    }, 2100)
  }

  const statusColors = {
    healthy: "text-primary",
    warning: "text-yellow-400",
    critical: "text-destructive",
    checking: "text-muted-foreground",
  }

  const statusIcons = {
    healthy: CheckCircle2,
    warning: AlertCircle,
    critical: AlertCircle,
    checking: RefreshCw,
  }

  const taskStatusColors = {
    active: "bg-primary/20 text-primary",
    scheduled: "bg-secondary text-muted-foreground",
    completed: "bg-primary/10 text-primary/60",
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Status header */}
      <div className="flex-shrink-0 px-4 pt-6 pb-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-sm font-medium text-foreground">
                System Online
              </span>
            </div>
            <span className="text-xs font-mono text-primary">
              v2.0
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className="text-sm font-mono text-foreground mt-0.5">
                {formatUptime(uptime)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Jobs</p>
              <p className="text-sm font-mono text-foreground mt-0.5">
                {tasks.filter((t) => t.status === "active").length} /{" "}
                {tasks.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Run diagnostics button */}
      <div className="flex-shrink-0 px-4 pb-4">
        <button
          type="button"
          onClick={runDiagnostics}
          disabled={isRunning}
          className={cn(
            "w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 min-h-[48px]",
            isRunning
              ? "bg-secondary text-muted-foreground"
              : "bg-primary text-primary-foreground glow-sm hover:glow-md"
          )}
        >
          <RefreshCw
            className={cn("w-4 h-4", isRunning && "animate-spin")}
          />
          {isRunning ? "Running diagnostics..." : "Run Full Diagnostics"}
        </button>
      </div>

      {/* Diagnostics list */}
      <div className="flex-shrink-0 px-4 pb-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          System Health
        </h3>
        <div className="flex flex-col gap-2">
          {diagnostics.map((diag) => {
            const Icon = diag.icon
            const StatusIcon = statusIcons[diag.status]

            return (
              <div
                key={diag.id}
                className="bg-card border border-border rounded-xl p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {diag.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-muted-foreground">
                          {diag.value}
                        </span>
                        <StatusIcon
                          className={cn(
                            "w-4 h-4",
                            statusColors[diag.status],
                            diag.status === "checking" && "animate-spin"
                          )}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {diag.detail}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Autonomous tasks */}
      <div className="flex-shrink-0 px-4 pb-6">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Autonomous Tasks
        </h3>
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-card border border-border rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  {task.name}
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-md font-medium",
                    taskStatusColors[task.status]
                  )}
                >
                  {task.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{task.nextRun}</span>
                <span className="text-border">|</span>
                <span>{task.lastResult}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
