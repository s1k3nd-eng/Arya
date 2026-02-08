"use client"

import { useEffect, useRef } from "react"

interface SoundwaveProps {
  isActive: boolean
  barCount?: number
  className?: string
}

export function Soundwave({ isActive, barCount = 5, className = "" }: SoundwaveProps) {
  const barsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!barsRef.current) return
    const bars = barsRef.current.children
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i] as HTMLElement
      if (isActive) {
        bar.style.animationPlayState = "running"
      } else {
        bar.style.animationPlayState = "paused"
        bar.style.transform = "scaleY(0.15)"
      }
    }
  }, [isActive])

  return (
    <div
      ref={barsRef}
      className={`flex items-center justify-center gap-[3px] ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-primary animate-soundwave origin-center"
          style={{
            height: 20,
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${0.8 + Math.random() * 0.6}s`,
            opacity: 0.6 + (i % 2) * 0.4,
          }}
        />
      ))}
    </div>
  )
}
