"use client"

import { ExternalLink, Globe } from "lucide-react"
import { trackSiteNAClick } from "@/lib/pixel"

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background py-10 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 font-display">
          Site de Narcóticos Anônimos
        </h2>
        <p className="text-background/80 text-sm leading-relaxed mb-4">
          Todas as informações apresentadas nesta página foram retiradas do site oficial de Narcóticos Anônimos.
        </p>
        <a
          href="https://www.na.org.br"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackSiteNAClick("footer")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-background text-[hsl(var(--na-blue))] font-bold text-sm rounded-xl hover:bg-background/90 transition-colors"
        >
          <Globe className="w-4 h-4" />
          Acessar na.org.br
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </footer>
  )
}
