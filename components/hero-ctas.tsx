"use client"

import { trackCallClick, trackPresenciaisClick } from "@/lib/pixel"

export function HeroCTAs() {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center md:justify-start">
      <a
        href="#reunioes"
        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-[hsl(var(--na-blue))] font-bold text-sm rounded-xl hover:bg-white/90 transition-colors shadow"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
        </svg>
        Reuniões Online
      </a>

      <a
        href="tel:30035222"
        onClick={() => trackCallClick("hero")}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[hsl(var(--na-gold))] text-[hsl(var(--na-blue))] font-bold text-sm rounded-xl hover:bg-[hsl(var(--na-gold))]/90 transition-colors shadow"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
        Ligar Agora — 3003-5222
      </a>

      <a
        href="https://www.na.org.br/grupos"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackPresenciaisClick("hero")}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/15 backdrop-blur-sm text-white font-semibold text-sm rounded-xl hover:bg-white/25 transition-colors border border-white/30"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        Sala Perto de Você
      </a>
    </div>
  )
}
