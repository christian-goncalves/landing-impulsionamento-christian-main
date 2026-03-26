import { SiteHeader } from "@/components/site-header"
import { HeroCTAs } from "@/components/hero-ctas"
import { ReunioesSection } from "@/components/meetings-client"
import { LojaVirtual } from "@/components/loja-virtual"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-[hsl(var(--na-blue))]">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
          <div className="text-white text-center md:text-left">
            <p className="text-base font-semibold text-white/80 mb-1">
              Problemas com drogas?
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight font-display text-balance mb-6">
              Se você quiser,{" "}
              <span className="text-[hsl(var(--na-gold))]">NA</span> pode te ajudar
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-6">
              <span className="bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                Reuniões Virtuais
              </span>
              <span className="bg-[hsl(var(--na-gold))] text-[hsl(var(--na-blue))] px-3 py-1.5 rounded-full text-sm font-bold">
                24 Horas
              </span>
              <span className="bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                Gratuito
              </span>
            </div>

            {/* CTAs */}
            <HeroCTAs />
          </div>
        </div>
      </section>

      {/* ── REUNIÕES ─────────────────────────────────────────────────────── */}
      <section id="reunioes" className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <ReunioesSection />
        </div>
      </section>

      {/* ── Site de NA ───────────────────────────────────────────────────── */}
      <LojaVirtual />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  )
}
