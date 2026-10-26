import { ReunioesSection } from "@/components/meetings-client"
import { SiteFooter } from "@/components/site-footer"
import { BRTClock } from "@/components/brt-clock"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="w-full bg-[hsl(var(--na-blue))]">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-5">
          <div className="flex items-start justify-between text-white">
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold leading-none">Reuniões Virtuais</span>
              <span className="mt-1 text-[7px] font-semibold leading-none">Narcóticos Anônimos</span>
            </div>
            <BRTClock className="pt-0.5" />
          </div>
        </div>
      </section>

      {/* ── REUNIÕES ─────────────────────────────────────────────────────── */}
      <section id="reunioes" className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <ReunioesSection />
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
