import meetingsData from "@/data/na_meetings.json"

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

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

function buildZoomLink(sessao: Sessao): string | null {
  if (sessao.app !== "Zoom" || !sessao.zoom_id) return null
  const id = sessao.zoom_id.replace(/\s/g, "")
  const pwd = sessao.senha ? `?pwd=${sessao.senha}` : ""
  return `https://zoom.us/j/${id}${pwd}`
}

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

  const diaSemana = now.getDay() === 0 ? 7 : now.getDay()
  const ontem = diaSemana === 1 ? 7 : diaSemana - 1
  const nowMin = now.getHours() * 60 + now.getMinutes()

  const emAndamento: SessaoAtiva[] = []
  const iniciandoEmBreve: SessaoAtiva[] = []
  const proximas: SessaoAtiva[] = []

  for (const grupo of grupos) {
    for (const sessao of grupo.sessoes) {
      const inicio = toMinutes(sessao.horario_inicio)
      const fim = toMinutes(sessao.horario_fim)
      const cruzouMeiaNoite = fim <= inicio
      const diasValidos = sessao.dias_semana

      let ativo = false
      let minutosParaInicio = inicio - nowMin
      let minutosParaFim = fim - nowMin

      if (!cruzouMeiaNoite) {
        if (!diasValidos.includes(diaSemana)) continue

        if (nowMin >= inicio && nowMin < fim) {
          ativo = true
        }
      } else {
        if (diasValidos.includes(diaSemana) && nowMin >= inicio) {
          ativo = true
          minutosParaFim = 1440 - nowMin + fim
        } else if (diasValidos.includes(ontem) && nowMin < fim) {
          ativo = true
          minutosParaInicio = -(1440 - inicio + nowMin)
          minutosParaFim = fim - nowMin
        }
      }

      const zoomLink = buildZoomLink(sessao)

      if (ativo) {
        const minDecorridos = Math.abs(minutosParaInicio)

        let prioridade: 1 | 2 | 3 | 4
        let statusLabel: string

        if (minDecorridos <= 10) {
          prioridade = 1
          statusLabel = "Começando agora"
        } else if (minDecorridos <= 60) {
          prioridade = 2
          statusLabel = "Em andamento"
        } else {
          prioridade = 3
          statusLabel = "Em andamento"
        }

        emAndamento.push({
          grupo,
          sessao,
          prioridade,
          statusLabel,
          minutosParaInicio,
          minutosParaFim,
          zoomLink,
        })

        continue
      }

      if (!diasValidos.includes(diaSemana)) continue

      if (minutosParaInicio > 0 && minutosParaInicio <= 60) {
        iniciandoEmBreve.push({
          grupo,
          sessao,
          prioridade: 2,
          statusLabel:
            minutosParaInicio <= 5 ? "Iniciando agora" : `Em ${minutosParaInicio} min`,
          minutosParaInicio,
          minutosParaFim,
          zoomLink,
        })
      } else if (minutosParaInicio > 60 && minutosParaInicio <= 480) {
        proximas.push({
          grupo,
          sessao,
          prioridade: 4,
          statusLabel: sessao.horario_inicio,
          minutosParaInicio,
          minutosParaFim,
          zoomLink,
        })
      }
    }
  }

  emAndamento.sort((a, b) => a.minutosParaInicio - b.minutosParaInicio)
  iniciandoEmBreve.sort((a, b) => a.minutosParaInicio - b.minutosParaInicio)
  proximas.sort((a, b) => a.minutosParaInicio - b.minutosParaInicio)

  if (emAndamento.length === 0 && iniciandoEmBreve.length === 0) {
    return {
      emAndamento: [],
      iniciandoEmBreve: [],
      proximas: proximas.slice(0, 6),
    }
  }

  return {
    emAndamento,
    iniciandoEmBreve,
    proximas,
  }
}
