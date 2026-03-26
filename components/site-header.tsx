"use client"

import { useState } from "react"
import Image from "next/image"
import { Menu, X, ChevronDown, Phone, ExternalLink, MapPin, Video } from "lucide-react"
import { BRTClock } from "./brt-clock"
import { trackCallClick, trackPresenciaisClick, trackSiteNAClick } from "@/lib/pixel"

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [reunioesOnlineOpen, setReunioesOnlineOpen] = useState(false)

  function handleNavClick() {
    setMobileOpen(false)
    setReunioesOnlineOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Logo + Nome */}
        <a href="#" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/images/avatar.jpg" alt="Logo NA - Narcóticos Anônimos" width={36} height={36} className="rounded-full" />
          <span className="font-bold text-sm leading-tight text-foreground hidden sm:block">
            Narcóticos<br /><span className="text-[hsl(var(--na-blue))]">Anônimos</span>
          </span>
        </a>

        {/* Clock desktop */}
        <div className="hidden md:flex flex-1 justify-center">
          <BRTClock />
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Menu principal">

          <a
            href="tel:30035222"
            onClick={() => trackCallClick("header")}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-[hsl(var(--na-blue))] transition-colors rounded-md hover:bg-secondary"
          >
            <Phone className="w-3.5 h-3.5" />3003-5222
          </a>

          <div className="relative">
            <button
              onClick={() => setReunioesOnlineOpen(!reunioesOnlineOpen)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground hover:text-[hsl(var(--na-blue))] transition-colors rounded-md hover:bg-secondary"
            >
              <Video className="w-3.5 h-3.5" />
              Reuniões Online
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${reunioesOnlineOpen ? "rotate-180" : ""}`} />
            </button>
            {reunioesOnlineOpen && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg min-w-[180px] overflow-hidden z-50">
                <a href="#andamento" onClick={handleNavClick} className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary hover:text-[hsl(var(--na-blue))] transition-colors">Em Andamento</a>
                <a href="#iniciando" onClick={handleNavClick} className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary hover:text-[hsl(var(--na-blue))] transition-colors">Iniciando em Breve</a>
                <a href="#proximas" onClick={handleNavClick} className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary hover:text-[hsl(var(--na-blue))] transition-colors">Próximas</a>
              </div>
            )}
          </div>

          <a
            href="https://www.na.org.br/grupos"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackPresenciaisClick("header")}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-[hsl(var(--na-blue))] transition-colors rounded-md hover:bg-secondary"
          >
            <MapPin className="w-3.5 h-3.5" />Reuniões Presenciais
          </a>

          <a
            href="https://www.na.org.br"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackSiteNAClick("header")}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-[hsl(var(--na-blue))] transition-colors rounded-md hover:bg-secondary"
          >
            <ExternalLink className="w-3.5 h-3.5" />Site de N.A.
          </a>
        </nav>

        {/* Mobile: clock + hamburger */}
        <div className="flex lg:hidden items-center gap-3">
          <BRTClock />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-md hover:bg-secondary transition-colors" aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="lg:hidden bg-card border-t border-border" aria-label="Menu mobile">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">

            <a
              href="tel:30035222"
              onClick={() => { trackCallClick("header-mobile"); handleNavClick() }}
              className="flex items-center gap-2 px-3 py-3 text-sm font-bold text-white bg-[hsl(var(--na-blue))] rounded-md transition-colors"
            >
              <Phone className="w-4 h-4" />Linha de Ajuda — 3003-5222
            </a>

            <div>
              <button
                onClick={() => setReunioesOnlineOpen(!reunioesOnlineOpen)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
              >
                <span className="flex items-center gap-2"><Video className="w-4 h-4" /> Reuniões Online</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${reunioesOnlineOpen ? "rotate-180" : ""}`} />
              </button>
              {reunioesOnlineOpen && (
                <div className="ml-4 flex flex-col gap-0.5">
                  <a href="#andamento" onClick={handleNavClick} className="px-3 py-2 text-sm text-muted-foreground hover:text-[hsl(var(--na-blue))] hover:bg-secondary rounded-md transition-colors">Em Andamento</a>
                  <a href="#iniciando" onClick={handleNavClick} className="px-3 py-2 text-sm text-muted-foreground hover:text-[hsl(var(--na-blue))] hover:bg-secondary rounded-md transition-colors">Iniciando em Breve</a>
                  <a href="#proximas" onClick={handleNavClick} className="px-3 py-2 text-sm text-muted-foreground hover:text-[hsl(var(--na-blue))] hover:bg-secondary rounded-md transition-colors">Próximas</a>
                </div>
              )}
            </div>

            <a
              href="https://www.na.org.br/grupos"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { trackPresenciaisClick("header-mobile"); handleNavClick() }}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
            >
              <MapPin className="w-4 h-4 text-muted-foreground" />Reuniões Presenciais
            </a>

            <a
              href="https://www.na.org.br"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { trackSiteNAClick("header-mobile"); handleNavClick() }}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />Site de N.A.
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
