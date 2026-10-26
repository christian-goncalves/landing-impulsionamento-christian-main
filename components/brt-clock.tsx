"use client"

import { useEffect, useState } from "react"

export function BRTClock({ className = "" }: { className?: string }) {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    function updateTime() {
      const now = new Date()
      const brtTime = now.toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      setTime(brtTime)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!time) return null

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-xs text-white/70 font-sans uppercase tracking-wide">BRT</span>
      <span className="font-mono text-sm font-bold text-white tabular-nums tracking-wider">
        {time}
      </span>
    </div>
  )
}
