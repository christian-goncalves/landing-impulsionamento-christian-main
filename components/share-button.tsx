"use client"

import { Share2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface ShareButtonProps {
  title: string
  text: string
  url?: string
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")
  const encodedText = encodeURIComponent(`${title}\n${text}\n${shareUrl}`)

  const shareLinks = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}`,
      color: "bg-[#25D366] text-white hover:bg-[#1EBE57]",
    },
    {
      label: "Copiar Link",
      href: "#",
      color: "bg-muted text-foreground hover:bg-border",
      onClick: () => {
        navigator.clipboard.writeText(`${title}\n${text}\n${shareUrl}`)
        setOpen(false)
      },
    },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground hover:bg-border transition-colors"
        aria-label="Compartilhar"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 bottom-full mb-2 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[140px] overflow-hidden">
          {shareLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href !== "#" ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={(e) => {
                if (link.onClick) {
                  e.preventDefault()
                  link.onClick()
                }
              }}
              className={`block px-3 py-2 text-xs font-medium transition-colors ${link.color}`}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
