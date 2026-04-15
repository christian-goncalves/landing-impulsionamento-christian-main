"use client"

import { useEffect, useState } from "react"
import { Radio, Clock, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react"
import { MeetingCard } from "./meeting-card"
import {
  getMeetingsFromApi,
  type MeetingsResult,
  type MeetingsFetchMeta,
} from "@/lib/meetings"

function useMeetings(interval = 30000) {
  const [result, setResult] = useState<MeetingsResult>({
    emAndamento: [],
    iniciandoEmBreve: [],
    proximas: [],
  })
  const [meta, setMeta] = useState<MeetingsFetchMeta>({
    sourceStatus: "ok",
    lastSyncAt: null,
    serverTime: null,
    usingLocalFallback: false,
    error: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function update() {
      const next = await getMeetingsFromApi()
      if (!active) return

      setResult(next.data)
      setMeta(next.meta)
      setLoading(false)
    }

    void update()
    const i = setInterval(() => void update(), interval)
    return () => {
      active = false
      clearInterval(i)
    }
  }, [interval])

  return { result, meta, loading }
}

function StatusIndicator({ meta }: { meta: MeetingsFetchMeta }) {
  if (meta.sourceStatus === "ok") return null

  const fallbackText = meta.usingLocalFallback
    ? "Dados em contingência local temporária."
    : "Dados em contingência."
  const staleText = "Dados desatualizados no momento. Exibindo último snapshot válido."

  const isStale = meta.sourceStatus === "stale"

  return (
    <div
      className={`mb-4 rounded-xl border px-3 py-2 text-sm ${
        isStale
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : "border-blue-200 bg-blue-50 text-blue-900"
      }`}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span>{isStale ? staleText : fallbackText}</span>
      </div>
    </div>
  )
}

// ── Legenda de tipos — componente único reutilizável ───────────────────────
function LegendaTipos() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Tipos:</span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 text-[11px] font-bold">
        <i className="fa-solid fa-user-group text-[0.62rem]" aria-hidden="true"></i>
        <span>Aberta - público em geral</span>
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold">
        <i className="fa-solid fa-lock text-[0.62rem]" aria-hidden="true"></i>
        <span>Fechada - que tem ou acha que tem problema com drogas</span>
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-bold">
        <i className="fa-solid fa-book-open text-[0.62rem]" aria-hidden="true"></i>
        <span>Estudo - estudo de literatura</span>
      </span>
    </div>
  )
}

export function EmAndamento({
  emAndamento,
}: {
  emAndamento: MeetingsResult["emAndamento"]
}) {
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
        <span className="ml-auto text-xs font-semibold bg-blue-100 text-[hsl(var(--na-blue))] px-2.5 py-1 rounded-full">
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

export function IniciandoEmBreve({
  iniciandoEmBreve,
}: {
  iniciandoEmBreve: MeetingsResult["iniciandoEmBreve"]
}) {
  return (
    <div id="iniciando">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground font-display">
          Iniciando em Breve
        </h2>
        <span className="ml-auto text-xs font-semibold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">
          {iniciandoEmBreve.length} próximos 60 min
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

export function ProximasReunioes({
  proximas,
}: {
  proximas: MeetingsResult["proximas"]
}) {
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
            : <><ChevronDown className="w-4 h-4" /> Ver todas </>}
        </button>
      )}
    </div>
  )
}

export function ReunioesSection() {
  const { result, meta, loading } = useMeetings()

  return (
    <div className="flex flex-col gap-10">
      <StatusIndicator meta={meta} />
      {loading ? (
        <div className="text-center py-5 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          Carregando reuniões...
        </div>
      ) : null}
      <EmAndamento emAndamento={result.emAndamento} />
      <IniciandoEmBreve iniciandoEmBreve={result.iniciandoEmBreve} />
      <ProximasReunioes proximas={result.proximas} />
    </div>
  )
}

// Legacy
export function HeroCards() { return null }
export function MeetingsList() { return <ReunioesSection /> }
