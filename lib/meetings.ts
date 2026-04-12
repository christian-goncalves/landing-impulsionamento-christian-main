import meetingsData from "@/data/na_meetings.json"
import { getMeetingsFromGroupsAtTime } from "@/lib/meetings-filter"

export interface Sessao {
  dias_semana: number[]
  horario_inicio: string
  horario_fim: string
  app: string
  zoom_id: string | null
  senha: string | null
  formatos: string[]
  tipo_acesso: "aberta" | "fechada" | "estudo"
  timezone: string
  notas: string | null
}

export interface Grupo {
  id: string
  nome: string
  cidade: string | null
  estado: string | null
  sessoes: Sessao[]
}

export interface SessaoAtiva {
  grupo: Grupo
  sessao: Sessao
  prioridade: 1 | 2 | 3 | 4
  statusLabel: string
  minutosParaInicio: number // negativo = já começou
  minutosParaFim: number
  zoomLink: string | null
}

export interface MeetingsResult {
  emAndamento: SessaoAtiva[] // acontecendo agora
  iniciandoEmBreve: SessaoAtiva[] // começa em até 60min
  proximas: SessaoAtiva[] // próximas (além de 60min, até 8h)
}

export type SourceStatus = "ok" | "fallback" | "stale"

export interface MeetingsFetchMeta {
  sourceStatus: SourceStatus
  lastSyncAt: string | null
  serverTime: string | null
  usingLocalFallback: boolean
  error: string | null
}

export interface MeetingsFetchResult {
  data: MeetingsResult
  meta: MeetingsFetchMeta
}

const EMPTY_MEETINGS_RESULT: MeetingsResult = {
  emAndamento: [],
  iniciandoEmBreve: [],
  proximas: [],
}

function isLegacyJsonFallbackEnabled(): boolean {
  return process.env.MEETINGS_ENABLE_LEGACY_JSON_FALLBACK === "true"
}

// Legacy compat
export type QueryResult = { mode: "active" | "upcoming"; sessions: SessaoAtiva[] }

function isSessaoAtivaArray(value: unknown): value is SessaoAtiva[] {
  return Array.isArray(value)
}

function mapApiPayloadToMeetingsResult(payload: unknown): MeetingsResult {
  const p = payload as Record<string, unknown>

  const emAndamento = p?.emAndamento
  const iniciandoEmBreve = p?.iniciandoEmBreve
  const proximas = p?.proximas

  if (
    !isSessaoAtivaArray(emAndamento) ||
    !isSessaoAtivaArray(iniciandoEmBreve) ||
    !isSessaoAtivaArray(proximas)
  ) {
    throw new Error("Payload da API inválido para reuniões.")
  }

  return {
    emAndamento,
    iniciandoEmBreve,
    proximas,
  }
}

export async function getMeetingsFromApi(
  fetchImpl: typeof fetch = fetch
): Promise<MeetingsFetchResult> {
  try {
    const response = await fetchImpl("/api/reunioes-virtuais", {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Falha HTTP ao buscar reuniões: ${response.status}`)
    }

    const payload = (await response.json()) as Record<string, unknown>
    const data = mapApiPayloadToMeetingsResult(payload)

    return {
      data,
      meta: {
        sourceStatus:
          payload.sourceStatus === "stale" || payload.sourceStatus === "fallback"
            ? (payload.sourceStatus as SourceStatus)
            : "ok",
        lastSyncAt:
          typeof payload.lastSyncAt === "string" ? payload.lastSyncAt : null,
        serverTime:
          typeof payload.serverTime === "string" ? payload.serverTime : null,
        usingLocalFallback: false,
        error: null,
      },
    }
  } catch (error) {
    return {
      data: getMeetings(),
      meta: {
        sourceStatus: "fallback",
        lastSyncAt: null,
        serverTime: null,
        usingLocalFallback: true,
        error: error instanceof Error ? error.message : "Falha ao buscar reuniões da API.",
      },
    }
  }
}

export function getMeetings(): MeetingsResult {
  if (!isLegacyJsonFallbackEnabled()) {
    return EMPTY_MEETINGS_RESULT
  }

  return getMeetingsFromGroups((meetingsData as { grupos: Grupo[] }).grupos)
}

export function getMeetingsFromGroups(grupos: Grupo[]): MeetingsResult {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  )
  return getMeetingsFromGroupsAtTime(grupos, now)
}
