"use client"

import { useEffect, useState } from "react"

type AvatarProps = {
  isSpeaking?: boolean
  size?: "sm" | "md" | "lg"
}

export function AIAvatar({ isSpeaking = false, size = "md" }: AvatarProps) {
  const [mouthState, setMouthState] = useState<"closed" | "open">("closed")

  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setMouthState((prev) => (prev === "closed" ? "open" : "closed"))
      }, 300)
      return () => clearInterval(interval)
    } else {
      setMouthState("closed")
    }
  }, [isSpeaking])

  const sizeClasses = {
    sm: "size-12",
    md: "size-16",
    lg: "size-24",
  }

  const eyeSize = {
    sm: 3,
    md: 4,
    lg: 6,
  }

  const mouthHeight = mouthState === "open" ? (size === "lg" ? 8 : size === "md" ? 6 : 4) : 2

  return (
    <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Head */}
        <circle cx="50" cy="50" r="45" fill="hsl(var(--primary))" opacity="0.2" />
        <circle cx="50" cy="50" r="42" fill="hsl(var(--primary))" opacity="0.3" />
        <circle cx="50" cy="50" r="38" fill="hsl(var(--primary))" />

        {/* Face glow when speaking */}
        {isSpeaking && (
          <circle cx="50" cy="50" r="38" fill="hsl(var(--primary))" opacity="0.3" className="animate-pulse" />
        )}

        {/* Eyes */}
        <circle cx="38" cy="42" r={eyeSize[size]} fill="white" />
        <circle cx="62" cy="42" r={eyeSize[size]} fill="white" />
        <circle cx="38" cy="42" r={eyeSize[size] - 1} fill="hsl(var(--primary-foreground))" />
        <circle cx="62" cy="42" r={eyeSize[size] - 1} fill="hsl(var(--primary-foreground))" />

        {/* Cheeks (blush) */}
        <ellipse cx="28" cy="55" rx="5" ry="3" fill="hsl(var(--secondary))" opacity="0.4" />
        <ellipse cx="72" cy="55" rx="5" ry="3" fill="hsl(var(--secondary))" opacity="0.4" />

        {/* Mouth - animates when speaking */}
        <ellipse
          cx="50"
          cy="65"
          rx="12"
          ry={mouthHeight}
          fill="hsl(var(--primary-foreground))"
          className="transition-all duration-200"
        />

        {/* Smile curve when not speaking wide */}
        {mouthState === "closed" && (
          <path d="M 38 62 Q 50 68 62 62" stroke="hsl(var(--primary-foreground))" strokeWidth="2" fill="none" />
        )}

        {/* Sparkle effect near avatar when speaking */}
        {isSpeaking && (
          <>
            <circle cx="20" cy="30" r="2" fill="hsl(var(--accent))" opacity="0.8" className="animate-ping" />
            <circle cx="80" cy="35" r="1.5" fill="hsl(var(--accent))" opacity="0.8" className="animate-ping" />
            <circle cx="75" cy="70" r="2" fill="hsl(var(--accent))" opacity="0.8" className="animate-ping" />
          </>
        )}
      </svg>

      {/* Ripple effect when speaking */}
      {isSpeaking && <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />}
    </div>
  )
}
