"use client"

import { Phone, ExternalLink, Video, MapPin } from "lucide-react"
import Image from "next/image"
import { trackCallClick, trackPresenciaisClick, trackSiteNAClick } from "@/lib/pixel"

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Logo */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Image src="/images/avatar.jpg" alt="Logo NA" width={48} height={48} className="rounded-full" />
            <div>
              <div className="font-bold text-base">Narcóticos Anônimos</div>
              <div className="text-xs text-background/60">Recuperação, Serviço e Unidade</div>
            </div>
          </div>
        </div>

        {/* 3 CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <a
            href="#andamento"
            className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-[hsl(var(--na-blue))] text-white font-bold text-sm hover:bg-[hsl(var(--na-blue))]/80 transition-colors"
          >
            <Video className="w-5 h-5" />Reuniões Online
          </a>

          <a
            href="https://www.na.org.br/grupos"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackPresenciaisClick("footer")}
            className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-background/10 text-background font-bold text-sm hover:bg-background/20 transition-colors border border-background/20"
          >
            <MapPin className="w-5 h-5" />Reuniões Presenciais
          </a>

          <a
            href="tel:30035222"
            onClick={() => trackCallClick("footer")}
            className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-[hsl(var(--na-gold))] text-[hsl(var(--na-blue))] font-bold text-sm hover:bg-[hsl(var(--na-gold))]/90 transition-colors"
          >
            <Phone className="w-5 h-5" />Linha de Ajuda — 3003-5222
          </a>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/40">
          <span>Narcóticos Anônimos. Todos os direitos reservados.</span>
          <a
            href="https://www.na.org.br"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackSiteNAClick("footer")}
            className="flex items-center gap-1 hover:text-background/60 transition-colors"
          >
            na.org.br <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  )
}
