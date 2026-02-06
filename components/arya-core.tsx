"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface AryaCoreProps {
  status: "idle" | "thinking" | "speaking" | "listening"
  className?: string
}

export function AryaCore({ status, className }: AryaCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = 120
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const center = size / 2
    let time = 0

    const getConfig = () => {
      switch (status) {
        case "thinking":
          return { speed: 0.04, amplitude: 8, rings: 4, alpha: 0.9 }
        case "speaking":
          return { speed: 0.06, amplitude: 12, rings: 5, alpha: 1 }
        case "listening":
          return { speed: 0.02, amplitude: 4, rings: 3, alpha: 0.7 }
        default:
          return { speed: 0.015, amplitude: 3, rings: 3, alpha: 0.5 }
      }
    }

    const draw = () => {
      const config = getConfig()
      ctx.clearRect(0, 0, size, size)

      for (let ring = 0; ring < config.rings; ring++) {
        const baseRadius = 20 + ring * 8
        const points = 64
        const ringOffset = ring * 0.5

        ctx.beginPath()
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2
          const wave =
            Math.sin(angle * 3 + time * config.speed * 60 + ringOffset) *
            config.amplitude *
            (1 - ring * 0.15)
          const r = baseRadius + wave
          const x = center + r * Math.cos(angle)
          const y = center + r * Math.sin(angle)

          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()

        const alpha = config.alpha * (1 - ring * 0.2)
        ctx.strokeStyle = `hsla(174, 80%, 48%, ${alpha})`
        ctx.lineWidth = 1.5 - ring * 0.2
        ctx.stroke()

        if (ring === 0) {
          const gradient = ctx.createRadialGradient(
            center,
            center,
            0,
            center,
            center,
            baseRadius
          )
          gradient.addColorStop(0, `hsla(174, 80%, 48%, ${alpha * 0.15})`)
          gradient.addColorStop(1, "hsla(174, 80%, 48%, 0)")
          ctx.fillStyle = gradient
          ctx.fill()
        }
      }

      // Center dot
      ctx.beginPath()
      ctx.arc(center, center, 3, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(174, 80%, 48%, ${config.alpha})`
      ctx.fill()

      time += 1
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [status])

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-xl transition-opacity duration-1000",
          status === "thinking" || status === "speaking"
            ? "opacity-60"
            : "opacity-20"
        )}
        style={{ backgroundColor: "hsl(174, 80%, 48%)" }}
      />
      <canvas ref={canvasRef} className="relative z-10" />
    </div>
  )
}
