// ── Meta Pixel — apenas PageView ────────────────────────────────────────────
// Eventos de conversão (Lead, Contact) foram removidos pois a Meta bloqueia
// automaticamente eventos de sites na categoria de saúde/recuperação.
// O rastreamento de cliques é feito via GA4 + GTM.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

// Mantém as funções exportadas como no-op para não quebrar imports existentes
export function trackZoomClick(_grupoNome: string, _tipo: string, _horario: string) {}
export function trackCallClick(_origem: string) {}
export function trackPresenciaisClick(_origem: string) {}
export function trackSiteNAClick(_origem: string) {}