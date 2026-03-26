"use client"

import { useEffect, useState } from "react"
import { Radio, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { MeetingCard } from "./meeting-card"
import { getMeetings, type MeetingsResult } from "@/lib/meetings"

function useMeetings(interval = 30000) {
  const [result, setResult] = useState<MeetingsResult>({
    emAndamento: [],
    iniciandoEmBreve: [],
    proximas: [],
  })
  useEffect(() => {
    function update() { setResult(getMeetings()) }
    update()
    const i = setInterval(update, interval)
    return () => clearInterval(i)
  }, [interval])
  return result
}

// ── Legenda de tipos — componente único reutilizável ───────────────────────
function LegendaTipos() {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 text-[11px] text-muted-foreground">
      <span className="font-semibold">Tipos:</span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 font-bold">
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
        </svg>
        Aberta — público em geral
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold">
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
        Fechada — quem tem ou acha que tem problemas com drogas
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-bold">
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
        Estudos — estudo de literatura
      </span>
    </div>
  )
}

// ── Seção 1 — Em Andamento ──────────────────────────────────────────────────
export function EmAndamento() {
  const { emAndamento } = useMeetings()

  if (emAndamento.length === 0) {
    return (
      <div id="andamento" className="text-center py-6 text-muted-foreground text-sm">
        Nenhuma reunião em andamento agora.
      </div>
    )
  }

  return (
    <div id="andamento">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-5 h-5 text-red-500 animate-pulse flex-shrink-0" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground font-display">
          Reuniões em Andamento
        </h2>
        <span className="ml-auto text-xs font-semibold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
          {emAndamento.length} em andamento
        </span>
      </div>
      <LegendaTipos />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {emAndamento.map((s, i) => (
          <MeetingCard
            key={`${s.grupo.id}-${s.sessao.horario_inicio}-${i}`}
            sessao={s}
            variant="andamento"
          />
        ))}
      </div>
    </div>
  )
}

// ── Seção 2 — Iniciando em Breve (≤ 90 min) ────────────────────────────────
export function IniciandoEmBreve() {
  const { iniciandoEmBreve } = useMeetings()

  // Mostra a seção mesmo vazia, com estado informativo
  return (
    <div id="iniciando">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground font-display">
          Iniciando em Breve
        </h2>
        <span className="ml-auto text-xs font-semibold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">
          próximos 60 min
        </span>
      </div>

      {iniciandoEmBreve.length === 0 ? (
        <div className="text-center py-5 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          Nenhuma reunião iniciando nos próximos 60 minutos.
        </div>
      ) : (
        <>
          <LegendaTipos />
          <div className="flex flex-col gap-2">
            {iniciandoEmBreve.map((s, i) => (
              <MeetingCard
                key={`${s.grupo.id}-${s.sessao.horario_inicio}-${i}`}
                sessao={s}
                variant="embreve"
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Seção 3 — Próximas Reuniões ────────────────────────────────────────────
export function ProximasReunioes() {
  const { proximas } = useMeetings()
  const [expanded, setExpanded] = useState(false)

  if (proximas.length === 0) return null

  const LIMITE = 8
  const visiveis = expanded ? proximas : proximas.slice(0, LIMITE)
  const temMais = proximas.length > LIMITE

  return (
    <div id="proximas">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-[hsl(var(--na-blue))] flex-shrink-0" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground font-display">
          Próximas Reuniões
        </h2>
        <span className="ml-auto text-xs font-semibold bg-blue-100 text-[hsl(var(--na-blue))] px-2.5 py-1 rounded-full">
          {proximas.length} reuniões
        </span>
      </div>
      <LegendaTipos />

      <div className="flex flex-col gap-2">
        {visiveis.map((s, i) => (
          <MeetingCard
            key={`${s.grupo.id}-${s.sessao.horario_inicio}-${i}`}
            sessao={s}
            variant="proxima"
          />
        ))}
      </div>

      {temMais && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 mt-3 py-3 text-sm font-semibold text-[hsl(var(--na-blue))] hover:bg-muted/40 rounded-xl border border-border transition-colors"
        >
          {expanded
            ? <><ChevronUp className="w-4 h-4" /> Mostrar menos</>
            : <><ChevronDown className="w-4 h-4" /> Ver todas </>
          }
        </button>
      )}
    </div>
  )
}

// ── Bloco completo ─────────────────────────────────────────────────────────
export function ReunioesSection() {
  return (
    <div className="flex flex-col gap-10">
      <EmAndamento />
      <IniciandoEmBreve />
      <ProximasReunioes />
    </div>
  )
}

// Legacy
export function HeroCards() { return null }
export function MeetingsList() { return <ReunioesSection /> }
