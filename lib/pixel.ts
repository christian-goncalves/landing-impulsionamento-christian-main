// ── Meta Pixel — apenas PageView ────────────────────────────────────────────
// Eventos de conversão (Lead, Contact) foram removidos pois a Meta bloqueia
// automaticamente eventos de sites na categoria de saúde/recuperação.
// O rastreamento de cliques é feito via GA4 + GTM.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

import { trackEvent } from "@/lib/analytics"

export function trackZoomClick(grupoNome: string, tipoAcesso: string, horario: string, origin = "meeting-card") {
  trackEvent("zoom_click", {
    origin,
    grupo_nome: grupoNome,
    tipo_acesso: tipoAcesso,
    horario,
  })
}

export function trackCallClick(origin: string) {
  trackEvent("call_click", { origin })
}

export function trackPresenciaisClick(origin: string) {
  trackEvent("presenciais_click", { origin })
}

export function trackSiteNAClick(origin: string) {
  trackEvent("site_na_click", { origin })
}

export function trackCtaClick(origin: string, cta: string) {
  trackEvent("cta_click", {
    origin,
    cta,
  })
}

export function trackShareClick(origin: string, canal: "whatsapp" | "copy_link") {
  trackEvent("share_click", {
    origin,
    canal,
  })
}
