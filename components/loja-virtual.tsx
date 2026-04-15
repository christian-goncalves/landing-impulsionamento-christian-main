"use client"

import { ExternalLink, Globe } from "lucide-react"
import Image from "next/image"
import { trackSiteNAClick } from "@/lib/pixel"

export function LojaVirtual() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-[hsl(var(--na-blue))] to-[hsl(var(--na-light-blue))] rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 text-white">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Image
                src="/images/avatar.jpg"
                alt="Logo NA"
                width={64}
                height={64}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 font-display">
              Site de Narcóticos Anônimos
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Todas as informações apresentadas nesta página foram retiradas do site oficial de Narcóticos Anônimos.
            </p>
            <a
              href="https://www.na.org.br"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackSiteNAClick("loja-virtual")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[hsl(var(--na-blue))] font-bold text-sm rounded-xl hover:bg-white/90 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Acessar na.org.br
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
