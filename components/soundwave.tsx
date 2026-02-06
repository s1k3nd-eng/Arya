"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface SoundwaveProps {
  isActive: boolean
  className?: string
  barCount?: number
}

export function Soundwave({
  isActive,
  className,
  barCount = 5,
}: SoundwaveProps) {
  const barsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!barsRef.current || !isActive) return

    const bars = barsRef.current.children
    const intervals: NodeJS.Timeout[] = []

    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i] as HTMLElement
      const delay = i * 120
      const duration = 400 + Math.random() * 400

      const animate = () => {
        const height = 20 + Math.random() * 80
        bar.style.height = `${height}%`
        bar.style.transition = `height ${duration}ms ease-in-out`
      }

      setTimeout(() => {
        animate()
        intervals.push(setInterval(animate, duration))
      }, delay)
    }

    return () => {
      intervals.forEach(clearInterval)
      if (barsRef.current) {
        const bars = barsRef.current.children
        for (let i = 0; i < bars.length; i++) {
          ;(bars[i] as HTMLElement).style.height = "20%"
        }
      }
    }
  }, [isActive, barCount])

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-[3px]",
        className
      )}
    >
      <div ref={barsRef} className="flex items-end justify-center gap-[3px] h-full">
        {Array.from({ length: barCount }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-[3px] rounded-full transition-all duration-300",
              isActive
                ? "bg-primary"
                : "bg-muted-foreground/30"
            )}
            style={{
              height: isActive ? "50%" : "20%",
            }}
          />
        ))}
      </div>
    </div>
  )
}
