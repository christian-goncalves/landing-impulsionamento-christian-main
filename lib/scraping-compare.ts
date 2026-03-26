import type { Grupo } from "@/lib/meetings"
import type { ScrapeNormalizedResult } from "@/lib/na-virtual-scraper"
import type { ApiPayloadV1 } from "@/lib/payload-v1"

type MissingReason =
  | "outside_time_window"
  | "parse_discarded"
  | "deduplicated"
  | "not_found_in_source"

interface CompareOptions {
  q: string | null
  day: number | null
  hour: string | null
  tz: string
}

interface SessionRef {
  groupName: string
  day: number
  start: string
  end: string
  key: string
}

export interface ComparisonReport {
  generated_at: string
  query: {
    q: string | null
    day: number | null
    hour: string | null
    tz: string
    reference_iso: string
  }
  source_raw_summary: {
    total_raw_sessions: number
    total_parsed_sessions: number
    parse_errors: number
    deduplicated: number
    discarded: number
    raw_groups_count: number
  }
  normalized_summary: {
    total_groups: number
    total_sessions: number
  }
  payload_window_summary: {
    em_andamento: number
    iniciando_em_breve: number
    proximas: number
    total_window_sessions: number
  }
  matches: Array<{
    group_name: string
    sessions_total: number
    sessions_in_window: number
    sessions: Array<{
      day: number
      start: string
      end: string
      in_window: boolean
    }>
  }>
  missing_reasons: MissingReason[]
}

export function buildScrapingComparisonReport(
  scrape: ScrapeNormalizedResult,
  payload: ApiPayloadV1,
  options: CompareOptions
): ComparisonReport {
  const reference = resolveReferenceDate(options)
  const window = computeWindowFromGroups(scrape.groups, reference)
  const normalizedSessions = flattenFromGroups(scrape.groups)

  const qNorm = normalizeQuery(options.q)
  const sourceMatch = qNorm
    ? normalizedSessions.filter((s) => normalizeText(s.groupName).includes(qNorm))
    : normalizedSessions

  const windowKeySet = new Set(window.all.map((s) => s.key))

  const groupsByName = new Map<string, SessionRef[]>()
  for (const session of sourceMatch) {
    const key = session.groupName
    const arr = groupsByName.get(key) ?? []
    arr.push(session)
    groupsByName.set(key, arr)
  }

  const matches = [...groupsByName.entries()].map(([groupName, sessions]) => ({
    group_name: groupName,
    sessions_total: sessions.length,
    sessions_in_window: sessions.filter((s) => windowKeySet.has(s.key)).length,
    sessions: sessions.map((s) => ({
      day: s.day,
      start: s.start,
      end: s.end,
      in_window: windowKeySet.has(s.key),
    })),
  }))

  const reasons = classifyMissingReasons({
    queryNorm: qNorm,
    matchesCount: matches.length,
    sessionsInWindow: matches.reduce((acc, item) => acc + item.sessions_in_window, 0),
    rawCounts: scrape.debug.raw_group_counts,
    dedupCounts: scrape.debug.dedup_group_counts,
    discardedCounts: scrape.debug.discarded_group_counts,
  })

  return {
    generated_at: new Date().toISOString(),
    query: {
      q: options.q,
      day: options.day,
      hour: options.hour,
      tz: options.tz,
      reference_iso: reference.toISOString(),
    },
    source_raw_summary: {
      total_raw_sessions: scrape.metrics.raw_total,
      total_parsed_sessions: scrape.metrics.parsed_ok,
      parse_errors: scrape.metrics.parse_errors,
      deduplicated: scrape.metrics.deduplicated,
      discarded: scrape.metrics.discarded,
      raw_groups_count: Object.keys(scrape.debug.raw_group_counts).length,
    },
    normalized_summary: {
      total_groups: scrape.groups.length,
      total_sessions: normalizedSessions.length,
    },
    payload_window_summary: {
      em_andamento: payload.emAndamento.length,
      iniciando_em_breve: payload.iniciandoEmBreve.length,
      proximas: payload.proximas.length,
      total_window_sessions:
        payload.emAndamento.length + payload.iniciandoEmBreve.length + payload.proximas.length,
    },
    matches,
    missing_reasons: reasons,
  }
}

function classifyMissingReasons(input: {
  queryNorm: string | null
  matchesCount: number
  sessionsInWindow: number
  rawCounts: Record<string, number>
  dedupCounts: Record<string, number>
  discardedCounts: Record<string, number>
}): MissingReason[] {
  const reasons = new Set<MissingReason>()

  if (!input.queryNorm) return []

  if (input.matchesCount === 0) {
    reasons.add("not_found_in_source")
  } else if (input.sessionsInWindow === 0) {
    reasons.add("outside_time_window")
  }

  const rawCount = sumByNormalizedName(input.rawCounts, input.queryNorm)
  const dedupCount = sumByNormalizedName(input.dedupCounts, input.queryNorm)
  const discardedCount = sumByNormalizedName(input.discardedCounts, input.queryNorm)

  if (rawCount > dedupCount) {
    reasons.add("deduplicated")
  }
  if (discardedCount > 0) {
    reasons.add("parse_discarded")
  }

  return [...reasons]
}

function sumByNormalizedName(counts: Record<string, number>, queryNorm: string): number {
  return Object.entries(counts).reduce((acc, [name, count]) => {
    return normalizeText(name).includes(queryNorm) ? acc + count : acc
  }, 0)
}

function flattenFromGroups(groups: Grupo[]): SessionRef[] {
  const out: SessionRef[] = []
  for (const group of groups) {
    for (const sessao of group.sessoes) {
      for (const day of sessao.dias_semana) {
        out.push({
          groupName: group.nome,
          day,
          start: sessao.horario_inicio,
          end: sessao.horario_fim,
          key: buildSessionKey(group.nome, day, sessao.horario_inicio, sessao.horario_fim),
        })
      }
    }
  }
  return out
}

function computeWindowFromGroups(groups: Grupo[], reference: Date): {
  emAndamento: SessionRef[]
  iniciandoEmBreve: SessionRef[]
  proximas: SessionRef[]
  all: SessionRef[]
} {
  const day = reference.getDay()
  const yesterday = day === 0 ? 6 : day - 1
  const nowMin = reference.getHours() * 60 + reference.getMinutes()

  const emAndamento: SessionRef[] = []
  const iniciandoEmBreve: SessionRef[] = []
  const proximas: SessionRef[] = []

  for (const group of groups) {
    for (const sessao of group.sessoes) {
      const inicio = toMinutes(sessao.horario_inicio)
      const fim = toMinutes(sessao.horario_fim)
      const cruzouMeiaNoite = fim <= inicio
      const dias = sessao.dias_semana

      let ativo = false
      let minutosParaInicio = inicio - nowMin

      if (!cruzouMeiaNoite) {
        if (!dias.includes(day)) continue
        if (nowMin >= inicio && nowMin < fim) {
          ativo = true
        }
      } else {
        if (dias.includes(day) && nowMin >= inicio) {
          ativo = true
        } else if (dias.includes(yesterday) && nowMin < fim) {
          ativo = true
          minutosParaInicio = -(1440 - inicio + nowMin)
        }
      }

      const ref: SessionRef = {
        groupName: group.nome,
        day,
        start: sessao.horario_inicio,
        end: sessao.horario_fim,
        key: buildSessionKey(group.nome, day, sessao.horario_inicio, sessao.horario_fim),
      }

      if (ativo) {
        emAndamento.push(ref)
      } else if (dias.includes(day) && minutosParaInicio > 0 && minutosParaInicio <= 60) {
        iniciandoEmBreve.push(ref)
      } else if (dias.includes(day) && minutosParaInicio > 60 && minutosParaInicio <= 480) {
        proximas.push(ref)
      }
    }
  }

  return {
    emAndamento,
    iniciandoEmBreve,
    proximas,
    all: [...emAndamento, ...iniciandoEmBreve, ...proximas],
  }
}

function resolveReferenceDate(options: CompareOptions): Date {
  const tzDate = new Date(new Date().toLocaleString("en-US", { timeZone: options.tz }))
  const date = new Date(tzDate)

  if (options.day !== null && options.day >= 0 && options.day <= 6) {
    const diff = options.day - date.getDay()
    date.setDate(date.getDate() + diff)
  }

  if (options.hour) {
    const [hhRaw, mmRaw] = options.hour.split(":", 2)
    const hh = Number(hhRaw)
    const mm = Number(mmRaw)
    if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
      date.setHours(hh, mm, 0, 0)
    }
  }

  return date
}

function normalizeQuery(value: string | null): string | null {
  if (!value) return null
  const normalized = normalizeText(value)
  return normalized.length > 0 ? normalized : null
}

function buildSessionKey(groupName: string, day: number, start: string, end: string): string {
  return `${normalizeText(groupName)}|${day}|${start}|${end}`
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

