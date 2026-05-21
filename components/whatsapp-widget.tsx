import { FaWhatsapp } from "react-icons/fa"

const WHATSAPP_NUMBER = "557330035222"
const WHATSAPP_MESSAGE = "Olá, preciso de ajuda. Vim pelo site de reuniões virtuais de NA."

export function WhatsAppWidget() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir conversa no WhatsApp"
      title="Falar pelo WhatsApp"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-50 flex h-12 w-12 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#1ebe57] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-whatsapp active:scale-95 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:right-[calc(1.5rem+env(safe-area-inset-right))] sm:h-14 sm:w-14"
    >
      <FaWhatsapp className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" focusable="false" />
    </a>
  )
}
