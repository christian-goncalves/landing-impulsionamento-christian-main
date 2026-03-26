import type { Grupo, Sessao } from "@/lib/meetings"
import { getMeetingsFromGroups, type MeetingsResult } from "@/lib/meetings"
import { resolveTipoAcesso } from "@/lib/meeting-access"

const AJAX_URL = "https://www.na.org.br/wp-admin/admin-ajax.php"
const SOURCE_URL = "https://www.na.org.br/virtual/"
const TIMEZONE = "America/Sao_Paulo"

const WEEKDAY_TO_INDEX: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
}

const PLATFORM_LABEL: Record<string, string> = {
  zoom: "Zoom",
  zello: "Zello",
  "google-meet": "Google Meet",
  teams: "Teams",
  jitsi: "Jitsi",
  skype: "Skype",
}

interface RawMeetingEntry {
  groupName: string
  weekdayIndex: number
  startAt: string
  endAt: string | null
  app: string
  meetingUrl: string | null
  meetingId: string | null
  meetingPassword: string | null
  formatos: string[]
  isOpen: number
  isStudy: number
  tipoAcesso: "aberta" | "fechada" | "estudo"
  cidade: string | null
  estado: string | null
}

export interface ScrapeMetrics {
  raw_total: number
  parsed_ok: number
  parse_errors: number
  deduplicated: number
  discarded: number
}

export interface ScrapeNormalizedResult {
  sourceUrl: string
  groups: Grupo[]
  meetingsResult: MeetingsResult
  metrics: ScrapeMetrics
  debug: {
    raw_group_counts: Record<string, number>
    dedup_group_counts: Record<string, number>
    discarded_group_counts: Record<string, number>
  }
  generatedAt: string
}

export async function scrapeNaVirtualMeetings(
  fetchImpl: typeof fetch = fetch
): Promise<ScrapeNormalizedResult> {
  const payload = await downloadPayload(fetchImpl)
  const [, html] = splitPayload(payload)
  const tableBlocks = extractByRegex(html, /<table\b[^>]*id=["']copy[^"']*["'][^>]*>[\s\S]*?<\/table>/gi)

  const rawEntries: RawMeetingEntry[] = []
  const discardedByGroup: Record<string, number> = {}
  let parseErrors = 0
  let discarded = 0

  for (const tableHtml of tableBlocks) {
    try {
      const groupName = extractGroupName(tableHtml)
      if (!groupName) {
        continue
      }

      const tableLocation = extractLocationFromTable(tableHtml)
      const rows = extractByRegex(tableHtml, /<tr\b[^>]*>[\s\S]*?<\/tr>/gi)
      for (const rowHtml of rows) {
        const cells = extractTableCells(rowHtml)
        if (cells.length < 2) {
          continue
        }

        const weekday = normalizeWeekday(stripHtml(cells[0]))
        if (!weekday) {
          continue
        }
        const weekdayIndex = WEEKDAY_TO_INDEX[weekday]
        if (weekdayIndex === undefined) {
          continue
        }

        const detailsCellHtml = cells[1]
        const entries = extractEntriesFromDetailsCell(detailsCellHtml)

        for (const entry of entries) {
          if (!entry.startAt) {
            discarded += 1
            discardedByGroup[groupName] = (discardedByGroup[groupName] ?? 0) + 1
            continue
          }

          const detailsBase = `${entry.detailsText} ${entry.meetingUrl ?? ""}`.trim()
          const formatos = extractFormatos(detailsBase)
          const isOpen = containsAny(detailsBase, ["aberta", "aberto", "visitantes"]) ? 1 : 0
          const isStudy = containsAny(detailsBase, [
            "estudo",
            "literatura",
            "guia de passos",
            "texto basico",
            "texto básico",
          ])
            ? 1
            : 0
          const tipoAcesso = resolveTipoAcesso(isOpen, isStudy)
          const appCode = extractPlatform(detailsBase, entry.meetingUrl, detailsCellHtml)
          const app = PLATFORM_LABEL[appCode] ?? "Reunião Online"
          const zoomId = appCode === "zoom" ? entry.meetingId ?? extractZoomIdFromUrl(entry.meetingUrl) : null

          rawEntries.push({
            groupName,
            weekdayIndex,
            startAt: entry.startAt,
            endAt: entry.endAt,
            app,
            meetingUrl: entry.meetingUrl,
            meetingId: zoomId,
            meetingPassword: entry.meetingPassword,
            formatos,
            isOpen,
            isStudy,
            tipoAcesso,
            cidade: tableLocation.city,
            estado: tableLocation.state,
          })
        }
      }
    } catch {
      parseErrors += 1
    }
  }

  const deduped = deduplicateRows(rawEntries)
  const groups = toGroupedModel(deduped)
  const meetingsResult = getMeetingsFromGroups(groups)
  const rawGroupCounts = countByGroup(rawEntries)
  const dedupGroupCounts = countByGroup(deduped)

  return {
    sourceUrl: SOURCE_URL,
    groups,
    meetingsResult,
    generatedAt: new Date().toISOString(),
    metrics: {
      raw_total: rawEntries.length,
      parsed_ok: deduped.length,
      parse_errors: parseErrors,
      deduplicated: Math.max(0, rawEntries.length - deduped.length),
      discarded,
    },
    debug: {
      raw_group_counts: rawGroupCounts,
      dedup_group_counts: dedupGroupCounts,
      discarded_group_counts: discardedByGroup,
    },
  }
}

async function downloadPayload(fetchImpl: typeof fetch): Promise<string> {
  const url = new URL(AJAX_URL)
  url.searchParams.set("action", "get_service_grupos")
  url.searchParams.set("estado", "")
  url.searchParams.set("cidade", "")
  url.searchParams.set("bairro", "")
  url.searchParams.set("A", "1")
  url.searchParams.set("B", "1")
  url.searchParams.set("formatos", "")
  url.searchParams.set("periodo", "all")
  url.searchParams.set("ic_formato", "virtual")
  url.searchParams.set("weekdays", "all")

  const response = await fetchImpl(url.toString(), { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`Falha no scraping NA virtual. Status HTTP ${response.status}.`)
  }
  const payload = await response.text()
  if (!payload.trim()) {
    throw new Error("Origem NA virtual retornou payload vazio.")
  }
  return payload
}

function splitPayload(payload: string): [string, string] {
  const [mapJson = "", html = ""] = payload.split("||", 2)
  if (!html.trim()) {
    throw new Error("Payload do scraping não contém bloco HTML de reuniões.")
  }
  return [mapJson, html]
}

function extractGroupName(tableHtml: string): string | null {
  const firstRow = extractByRegex(tableHtml, /<tr\b[^>]*>[\s\S]*?<\/tr>/i)[0]
  if (!firstRow) return null
  const firstCell = extractTableCells(firstRow)[0]
  if (!firstCell) return null
  const raw = normalizeText(stripHtml(firstCell)).replace("Reunião Verificada", "").trim()
  return raw || null
}

function extractLocationFromTable(tableHtml: string): { city: string | null; state: string | null } {
  const locationCellMatch = tableHtml.match(/<td\b[^>]*colspan=["']2["'][^>]*>([\s\S]*?)<\/td>/i)
  if (!locationCellMatch) return { city: null, state: null }
  const text = normalizeText(stripHtml(locationCellMatch[1]))
  if (!text.includes("/")) return { city: null, state: null }

  const [cityRaw, stateRaw] = text.split("/", 2)
  const city = normalizeText(cityRaw ?? "")
  const state = normalizeText(stateRaw ?? "")
  return {
    city: city || null,
    state: state || null,
  }
}

function extractEntriesFromDetailsCell(detailsCellHtml: string): Array<{
  detailsText: string
  meetingUrl: string | null
  meetingId: string | null
  meetingPassword: string | null
  startAt: string | null
  endAt: string | null
}> {
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  const anchors: Array<{ href: string | null; text: string; index: number; full: string }> = []

  let match: RegExpExecArray | null
  while ((match = anchorRegex.exec(detailsCellHtml)) !== null) {
    anchors.push({
      href: normalizeUrl(match[1]),
      text: normalizeText(stripHtml(match[2])),
      index: match.index,
      full: match[0],
    })
  }

  if (anchors.length === 0) {
    const detailsText = normalizeText(stripHtml(detailsCellHtml))
    const [startAt, endAt] = extractTimeRange(detailsText)
    return [
      {
        detailsText,
        meetingUrl: null,
        meetingId: extractMeetingId(detailsText),
        meetingPassword: extractMeetingPassword(detailsText),
        startAt,
        endAt,
      },
    ]
  }

  const entries: Array<{
    detailsText: string
    meetingUrl: string | null
    meetingId: string | null
    meetingPassword: string | null
    startAt: string | null
    endAt: string | null
  }> = []

  for (let i = 0; i < anchors.length; i += 1) {
    const current = anchors[i]
    const next = anchors[i + 1]
    const segmentStart = current.index + current.full.length
    const segmentEnd = next ? next.index : detailsCellHtml.length
    const afterHtml = detailsCellHtml.slice(segmentStart, segmentEnd)
    const afterText = normalizeText(stripHtml(afterHtml))
    const detailsText = normalizeText(`${current.text} ${afterText}`.trim())
    const [startAt, endAt] = extractTimeRange(current.text || detailsText)
    const idSource = afterText || detailsText

    entries.push({
      detailsText,
      meetingUrl: current.href,
      meetingId: extractMeetingId(idSource),
      meetingPassword: extractMeetingPassword(idSource),
      startAt,
      endAt,
    })
  }

  return entries
}

function extractPlatform(detailsText: string, meetingUrl: string | null, detailsCellHtml: string): string {
  const iconSrc = extractByRegex(detailsCellHtml, /<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi)
    .map((v) => v.replace(/.*src=["']([^"']+)["'].*/i, "$1"))
    .join(" ")

  const combined = normalizeAscii(`${detailsText} ${meetingUrl ?? ""} ${iconSrc}`).toLowerCase()
  if (combined.includes("zoom")) return "zoom"
  if (combined.includes("zello")) return "zello"
  if (combined.includes("meet.google") || combined.includes("google meet")) return "google-meet"
  if (combined.includes("teams.microsoft") || combined.includes("microsoft teams")) return "teams"
  if (combined.includes("jitsi")) return "jitsi"
  if (combined.includes("skype")) return "skype"
  return "online"
}

function extractMeetingId(text: string): string | null {
  const match = text.match(
    /(?:meeting\s*id|id(?:\s*da\s*reuni[aã]o)?|id)\s*[:\-]?\s*([0-9][0-9\s\-]{5,})/iu
  )
  if (!match?.[1]) return null
  const onlyDigits = match[1].replace(/\D+/g, "")
  return onlyDigits || null
}

function extractMeetingPassword(text: string): string | null {
  const match = text.match(/(?:senha|passcode|password)\s*[:\-]?\s*([a-z0-9@#\-\._]{3,})/iu)
  return match?.[1] ?? null
}

function extractZoomIdFromUrl(url: string | null): string | null {
  if (!url) return null
  const match = url.match(/\/j\/(\d{6,})/i)
  return match?.[1] ?? null
}

function normalizeWeekday(value: string): keyof typeof WEEKDAY_TO_INDEX | null {
  const normalized = normalizeAscii(value).toLowerCase()
  const map: Array<[string, keyof typeof WEEKDAY_TO_INDEX]> = [
    ["domingo", "domingo"],
    ["dom", "domingo"],
    ["segunda", "segunda"],
    ["seg", "segunda"],
    ["terca", "terca"],
    ["ter", "terca"],
    ["quarta", "quarta"],
    ["qua", "quarta"],
    ["quinta", "quinta"],
    ["qui", "quinta"],
    ["sexta", "sexta"],
    ["sex", "sexta"],
    ["sabado", "sabado"],
    ["sab", "sabado"],
  ]

  for (const [needle, weekday] of map) {
    if (normalized.includes(needle)) {
      return weekday
    }
  }
  return null
}

function extractTimeRange(text: string): [string | null, string | null] {
  const rangeMatch = text.match(
    /\b([01]?\d|2[0-3])[:hH]([0-5]\d)\s*(?:às|as|a)\s*([01]?\d|2[0-3])[:hH]([0-5]\d)\b/iu
  )
  if (rangeMatch) {
    const start = `${rangeMatch[1].padStart(2, "0")}:${rangeMatch[2].padStart(2, "0")}`
    const end = `${rangeMatch[3].padStart(2, "0")}:${rangeMatch[4].padStart(2, "0")}`
    return [start, end]
  }

  const times = [...text.matchAll(/\b([01]?\d|2[0-3])[:hH]([0-5]\d)\b/giu)]
  if (times.length === 0) return [null, null]

  const start = `${String(times[0][1]).padStart(2, "0")}:${String(times[0][2]).padStart(2, "0")}`
  const end =
    times[1] !== undefined
      ? `${String(times[1][1]).padStart(2, "0")}:${String(times[1][2]).padStart(2, "0")}`
      : null
  return [start, end]
}

function extractFormatos(text: string): string[] {
  const labels = new Set<string>(["Reunião Virtual"])
  const parentheses = text.match(/\(([^)]*)\)/u)
  if (parentheses?.[1]) {
    for (const part of parentheses[1].split(",")) {
      const label = normalizeText(part)
      if (label) labels.add(label)
    }
  }

  const candidates = [
    "aberta",
    "fechada",
    "estudo",
    "tematica",
    "temática",
    "hibrida",
    "híbrida",
    "presencial",
    "online",
    "virtual",
  ]
  const normalized = normalizeAscii(text).toLowerCase()
  for (const candidate of candidates) {
    if (normalized.includes(normalizeAscii(candidate).toLowerCase())) {
      labels.add(candidate)
    }
  }
  return [...labels]
}

function deduplicateRows(entries: RawMeetingEntry[]): RawMeetingEntry[] {
  const map = new Map<string, RawMeetingEntry>()
  for (const entry of entries) {
    const key = [
      normalizeAscii(entry.groupName).toLowerCase(),
      entry.weekdayIndex,
      entry.startAt,
      entry.endAt ?? "",
      entry.app,
      entry.meetingId ?? "",
      entry.meetingPassword ?? "",
      entry.meetingUrl ?? "",
      entry.tipoAcesso,
    ].join("|")
    map.set(key, entry)
  }
  return [...map.values()]
}

function countByGroup(entries: RawMeetingEntry[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const entry of entries) {
    counts[entry.groupName] = (counts[entry.groupName] ?? 0) + 1
  }
  return counts
}

function toGroupedModel(entries: RawMeetingEntry[]): Grupo[] {
  const groupMap = new Map<string, Grupo>()
  const sessionMap = new Map<string, Sessao>()

  for (const entry of entries) {
    const groupId = slugify(entry.groupName)
    if (!groupMap.has(groupId)) {
      groupMap.set(groupId, {
        id: groupId,
        nome: entry.groupName,
        cidade: entry.cidade,
        estado: entry.estado,
        sessoes: [],
      })
    }

    const group = groupMap.get(groupId)!
    if (!group.cidade && entry.cidade) group.cidade = entry.cidade
    if (!group.estado && entry.estado) group.estado = entry.estado

    const sessionKey = [
      groupId,
      entry.startAt,
      entry.endAt ?? "",
      entry.app,
      entry.meetingId ?? "",
      entry.meetingPassword ?? "",
      entry.tipoAcesso,
      normalizeAscii(entry.formatos.join("|")).toLowerCase(),
    ].join("|")

    const existing = sessionMap.get(sessionKey)
    if (existing) {
      if (!existing.dias_semana.includes(entry.weekdayIndex)) {
        existing.dias_semana.push(entry.weekdayIndex)
        existing.dias_semana.sort((a, b) => a - b)
      }
      continue
    }

    const sessao: Sessao = {
      dias_semana: [entry.weekdayIndex],
      horario_inicio: entry.startAt,
      horario_fim: entry.endAt ?? inferEndTime(entry.startAt),
      app: entry.app,
      zoom_id: entry.meetingId ? spacedMeetingId(entry.meetingId) : null,
      senha: entry.meetingPassword,
      formatos: entry.formatos,
      tipo_acesso: entry.tipoAcesso,
      timezone: TIMEZONE,
      notas: null,
    }

    group.sessoes.push(sessao)
    sessionMap.set(sessionKey, sessao)
  }

  return [...groupMap.values()]
}

function inferEndTime(startAt: string): string {
  const [hour, minute] = startAt.split(":").map(Number)
  const totalMinutes = hour * 60 + minute + 120
  const endMinutes = totalMinutes % 1440
  const endHour = Math.floor(endMinutes / 60)
  const endMin = endMinutes % 60
  return `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`
}

function normalizeUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!/^https?:\/\//i.test(trimmed)) return null
  return trimmed
}

function extractTableCells(rowHtml: string): string[] {
  return [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => m[1])
}

function extractByRegex(text: string, regex: RegExp): string[] {
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`
  const safeRegex = new RegExp(regex.source, flags)
  return [...text.matchAll(safeRegex)].map((m) => m[0])
}

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function normalizeAscii(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function slugify(value: string): string {
  return normalizeAscii(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_")
    .slice(0, 120)
}

function containsAny(text: string, needles: string[]): boolean {
  const haystack = normalizeAscii(text).toLowerCase()
  return needles.some((needle) => haystack.includes(normalizeAscii(needle).toLowerCase()))
}

function spacedMeetingId(value: string): string {
  const digits = value.replace(/\D+/g, "")
  if (digits.length < 10) return value
  if (digits.length === 11) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return digits
}
