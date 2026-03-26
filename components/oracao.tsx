"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

export function Oracao() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <section id="oracao" className="py-12 px-4 bg-[hsl(var(--na-blue))]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-display">
          Oração da Serenidade
        </h2>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-10 mb-6">
          <blockquote className="text-white text-lg md:text-xl leading-relaxed font-medium text-balance">
            Deus conceda-me serenidade para aceitar as coisas que não posso modificar, coragem para modificar aquelas que posso e sabedoria para reconhecer a diferença.
          </blockquote>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-block cursor-pointer group"
          aria-label="Ampliar imagem da Oração da Serenidade"
        >
          <Image
            src="/images/oracao.png"
            alt="Oração da Serenidade - Narcóticos Anônimos"
            width={500}
            height={400}
            className="rounded-xl shadow-lg mx-auto group-hover:opacity-90 transition-opacity max-w-full h-auto"
          />
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-label="Imagem ampliada"
        >
          <button
            onClick={() => setModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors z-10"
            aria-label="Fechar"
          >
            <X className="w-8 h-8" />
          </button>
          <Image
            src="/images/oracao.png"
            alt="Oração da Serenidade - Ampliada"
            width={800}
            height={640}
            className="rounded-xl shadow-2xl max-w-[90vw] max-h-[90vh] object-contain animate-in zoom-in-90 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
