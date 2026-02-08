"use client"

import { useEffect, useRef } from "react"

interface ConsciousnessOrbProps {
  isThinking: boolean
  size?: number
}

export function ConsciousnessOrb({ isThinking, size = 120 }: ConsciousnessOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    let time = 0
    const cx = size / 2
    const cy = size / 2
    const baseRadius = size * 0.28

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, size, size)
      time += isThinking ? 0.03 : 0.008

      // Outer glow
      const glowRadius = baseRadius + 10 + Math.sin(time * 0.5) * 6
      const outerGlow = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, glowRadius + 20)
      outerGlow.addColorStop(0, `hsla(38, 90%, 55%, ${isThinking ? 0.15 : 0.08})`)
      outerGlow.addColorStop(0.5, `hsla(38, 90%, 55%, ${isThinking ? 0.08 : 0.03})`)
      outerGlow.addColorStop(1, "hsla(38, 90%, 55%, 0)")
      ctx.fillStyle = outerGlow
      ctx.fillRect(0, 0, size, size)

      // Core orb with organic shape
      ctx.beginPath()
      const points = 64
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2
        const wave1 = Math.sin(angle * 3 + time * 2) * (isThinking ? 4 : 1.5)
        const wave2 = Math.cos(angle * 5 + time * 1.5) * (isThinking ? 3 : 1)
        const r = baseRadius + wave1 + wave2
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()

      // Gradient fill
      const grad = ctx.createRadialGradient(
        cx - baseRadius * 0.3,
        cy - baseRadius * 0.3,
        0,
        cx,
        cy,
        baseRadius * 1.2
      )
      grad.addColorStop(0, `hsla(45, 90%, 75%, ${isThinking ? 0.9 : 0.6})`)
      grad.addColorStop(0.4, `hsla(38, 90%, 55%, ${isThinking ? 0.8 : 0.5})`)
      grad.addColorStop(0.7, `hsla(25, 80%, 45%, ${isThinking ? 0.6 : 0.35})`)
      grad.addColorStop(1, `hsla(225, 30%, 15%, ${isThinking ? 0.4 : 0.2})`)
      ctx.fillStyle = grad
      ctx.fill()

      // Inner light
      const innerGlow = ctx.createRadialGradient(
        cx - baseRadius * 0.15,
        cy - baseRadius * 0.15,
        0,
        cx,
        cy,
        baseRadius * 0.6
      )
      innerGlow.addColorStop(0, `hsla(45, 100%, 90%, ${isThinking ? 0.5 : 0.25})`)
      innerGlow.addColorStop(1, "hsla(45, 100%, 90%, 0)")
      ctx.fillStyle = innerGlow
      ctx.fillRect(0, 0, size, size)

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationRef.current)
  }, [isThinking, size])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="flex-shrink-0"
      aria-label={isThinking ? "Arya is thinking" : "Arya is listening"}
    />
  )
}
