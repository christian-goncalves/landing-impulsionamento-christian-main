"use client"

import { useEffect } from "react"
import { trackEvent } from "@/lib/analytics"

const SCROLL_MILESTONES = [25, 50, 75, 100]
const TIME_MILESTONES_SECONDS = [30, 60, 120]

export function AnalyticsEvents() {
  useEffect(() => {
    const seenSections = new Set<string>()
    const reachedScrollMilestones = new Set<number>()

    const sectionElements = Array.from(document.querySelectorAll<HTMLElement>("section[id]"))

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const id = entry.target.getAttribute("id")
          if (!id || seenSections.has(id)) return

          seenSections.add(id)
          trackEvent("section_view", {
            origin: "viewport",
            section_id: id,
          })
        })
      },
      { threshold: 0.35 },
    )

    sectionElements.forEach((element) => sectionObserver.observe(element))

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return

      const scrollPercent = Math.round((window.scrollY / maxScroll) * 100)

      SCROLL_MILESTONES.forEach((milestone) => {
        if (scrollPercent < milestone || reachedScrollMilestones.has(milestone)) return
        reachedScrollMilestones.add(milestone)
        trackEvent("scroll_depth", {
          origin: "viewport",
          scroll_percent: milestone,
        })
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    const timers = TIME_MILESTONES_SECONDS.map((seconds) =>
      window.setTimeout(() => {
        trackEvent("time_on_page_milestones", {
          origin: "timer",
          tempo_segundos: seconds,
        })
      }, seconds * 1000),
    )

    return () => {
      sectionObserver.disconnect()
      window.removeEventListener("scroll", handleScroll)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  return null
}
