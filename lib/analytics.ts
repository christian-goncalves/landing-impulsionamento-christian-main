"use client"

type EventParams = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

function getPagePath(): string {
  if (typeof window === "undefined") return ""
  return window.location.pathname + window.location.search
}

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined") return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: name,
    page_path: getPagePath(),
    ...params,
  })
}
