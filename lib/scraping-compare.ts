import type { Grupo } from "@/lib/meetings"
import type { ScrapeNormalizedResult } from "@/lib/na-virtual-scraper"
import type { ApiPayloadV1 } from "@/lib/payload-v1"

type MissingReason =
  | "outside_time_window"
  | "parse_discarded"
  | "deduplicated"
  | "status_mismatch"
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
  status: "aberta" | "fechada" | "estudo"
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
  normalized_runtime_summary: {
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
    source_sessions_total: number
    runtime_sessions_total: number
    sessions_in_window: number
    status_mismatches: number
    sessions: Array<{
      day: number
      start: string
      end: string
      source_status: "aberta" | "fechada" | "estudo" | null
      runtime_status: "aberta" | "fechada" | "estudo" | null
      in_window: boolean
      status_match: boolean
    }>
  }>
  missing_reasons: MissingReason[]
}

export function buildScrapingComparisonReport(
  scrape: ScrapeNormalizedResult,
  runtimeGroups: Grupo[],
  payload: ApiPayloadV1,
  options: CompareOptions
): ComparisonReport {
  const reference = resolveReferenceDate(options)
  const sourceSessions = flattenFromGroups(scrape.groups)
  const runtimeSessions = flattenFromGroups(runtimeGroups)
  const window = computeWindowFromGroups(runtimeGroups, reference)

  const qNorm = normalizeQuery(options.q)
  const sourceMatch = qNorm
    ? sourceSessions.filter((s) => normalizeText(s.groupName).includes(qNorm))
    : sourceSessions
  const runtimeMatch = qNorm
    ? runtimeSessions.filter((s) => normalizeText(s.groupName).includes(qNorm))
    : runtimeSessions

  const sourceMap = new Map(sourceMatch.map((s) => [s.key, s]))
  const runtimeMap = new Map(runtimeMatch.map((s) => [s.key, s]))
  const windowKeySet = new Set(window.all.map((s) => s.key))
  const allKeys = new Set<string>([...sourceMap.keys(), ...runtimeMap.keys()])

  const grouped = new Map<string, Array<ComparisonReport["matches"][number]["sessions"][number]>>()
  for (const key of allKeys) {
    const source = sourceMap.get(key)
    const runtime = runtimeMap.get(key)
    const groupName = source?.groupName ?? runtime?.groupName
    if (!groupName) continue

    const row = {
      day: source?.day ?? runtime?.day ?? 0,
      start: source?.start ?? runtime?.start ?? "00:00",
      end: source?.end ?? runtime?.end ?? "00:00",
      source_status: source?.status ?? null,
      runtime_status: runtime?.status ?? null,
      in_window: windowKeySet.has(key),
      status_match: Boolean(source?.status && runtime?.status && source.status === runtime.status),
    }

    const arr = grouped.get(groupName) ?? []
    arr.push(row)
    grouped.set(groupName, arr)
  }

  const matches = [...grouped.entries()]
    .map(([groupName, sessions]) => {
      const sourceTotal = sessions.filter((s) => s.source_status !== null).length
      const runtimeTotal = sessions.filter((s) => s.runtime_status !== null).length
      const inWindow = sessions.filter((s) => s.in_window).length
      const statusMismatches = sessions.filter(
        (s) =>
          s.source_status !== null &&
          s.runtime_status !== null &&
          s.source_status !== s.runtime_status
      ).length

      return {
        group_name: groupName,
        source_sessions_total: sourceTotal,
        runtime_sessions_total: runtimeTotal,
        sessions_in_window: inWindow,
        status_mismatches: statusMismatches,
        sessions: sessions.sort(byDayThenTime),
      }
    })
    .sort((a, b) => a.group_name.localeCompare(b.group_name, "pt-BR"))

  const reasons = classifyMissingReasons({
    queryNorm: qNorm,
    matches,
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
    normalized_runtime_summary: {
      total_groups: runtimeGroups.length,
      total_sessions: runtimeSessions.length,
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
  matches: ComparisonReport["matches"]
  rawCounts: Record<string, number>
  dedupCounts: Record<string, number>
  discardedCounts: Record<string, number>
}): MissingReason[] {
  if (!input.queryNorm) {
    return []
  }

  const reasons = new Set<MissingReason>()
  const totalSource = input.matches.reduce((acc, m) => acc + m.source_sessions_total, 0)
  const totalWindow = input.matches.reduce((acc, m) => acc + m.sessions_in_window, 0)
  const totalMismatches = input.matches.reduce((acc, m) => acc + m.status_mismatches, 0)

  if (totalSource === 0) {
    reasons.add("not_found_in_source")
  } else if (totalWindow === 0) {
    reasons.add("outside_time_window")
  }

  if (totalMismatches > 0) {
    reasons.add("status_mismatch")
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
          status: sessao.tipo_acesso,
          key: buildSessionKey(group.nome, day, sessao.horario_inicio, sessao.horario_fim),
        })
      }
    }
  }
  return out
}

function computeWindowFromGroups(groups: Grupo[], reference: Date): { all: SessionRef[] } {
  const day = reference.getDay()
  const yesterday = day === 0 ? 6 : day - 1
  const nowMin = reference.getHours() * 60 + reference.getMinutes()
  const all: SessionRef[] = []

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

      if (
        ativo ||
        (dias.includes(day) && minutosParaInicio > 0 && minutosParaInicio <= 60) ||
        (dias.includes(day) && minutosParaInicio > 60 && minutosParaInicio <= 480)
      ) {
        all.push({
          groupName: group.nome,
          day,
          start: sessao.horario_inicio,
          end: sessao.horario_fim,
          status: sessao.tipo_acesso,
          key: buildSessionKey(group.nome, day, sessao.horario_inicio, sessao.horario_fim),
        })
      }
    }
  }

  return { all }
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

function byDayThenTime(
  a: ComparisonReport["matches"][number]["sessions"][number],
  b: ComparisonReport["matches"][number]["sessions"][number]
): number {
  if (a.day !== b.day) return a.day - b.day
  if (a.start !== b.start) return a.start.localeCompare(b.start, "pt-BR")
  return a.end.localeCompare(b.end, "pt-BR")
}
