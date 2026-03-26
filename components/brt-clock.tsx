"use client"

import { useEffect, useState } from "react"

export function BRTClock() {
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
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">BRT</span>
      <span className="font-mono text-sm font-bold text-na-blue tabular-nums tracking-wider">
        {time}
      </span>
    </div>
  )
}
