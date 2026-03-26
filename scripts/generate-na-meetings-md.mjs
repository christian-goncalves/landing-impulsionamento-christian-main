#!/usr/bin/env node

import { promises as fs } from "node:fs"
import { watch } from "node:fs"
import path from "node:path"

const PRIMARY_INPUT_PATH = path.resolve(
  process.cwd(),
  "data",
  "runtime",
  "current_groups.json"
)
const LEGACY_INPUT_PATH = path.resolve(process.cwd(), "data", "na_meetings.json")
const OUTPUT_PATH = path.resolve(process.cwd(), "data", "na_meetings.md")
const WATCH_MODE = process.argv.includes("--watch")
const DEBOUNCE_MS = 400

const DAY_LABELS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
]

// Ordem de semana iniciando na segunda:
// Seg(1), Ter(2), Qua(3), Qui(4), Sex(5), Sab(6), Dom(0)
const WEEKDAY_SORT_ORDER = [1, 2, 3, 4, 5, 6, 0]

async function main() {
  await generateOnce()

  if (!WATCH_MODE) return

  console.log(
    `[na-meetings-md] watch ativo: ${PRIMARY_INPUT_PATH} (fallback legado: ${LEGACY_INPUT_PATH})`
  )

  let timer = null
  const watched = [PRIMARY_INPUT_PATH, LEGACY_INPUT_PATH]
  for (const filePath of watched) {
    if (!(await fileExists(filePath))) continue
    watch(filePath, () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        void generateOnce()
      }, DEBOUNCE_MS)
    })
  }
}

async function generateOnce() {
  try {
    const source = await resolveInput()
    const raw = await fs.readFile(source.inputPath, "utf8")
    const parsed = JSON.parse(raw)
    const rows = buildRows(parsed)
    const markdown = buildMarkdown(rows, source)

    let current = ""
    try {
      current = await fs.readFile(OUTPUT_PATH, "utf8")
    } catch {
      current = ""
    }

    if (current !== markdown) {
      await fs.writeFile(OUTPUT_PATH, markdown, "utf8")
      console.log(
        `[na-meetings-md] atualizado ${new Date().toISOString()} (${rows.length} ocorrências, fonte: ${source.mode})`
      )
    } else {
      console.log(
        `[na-meetings-md] sem mudanças ${new Date().toISOString()} (${rows.length} ocorrências, fonte: ${source.mode})`
      )
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido ao gerar na_meetings.md"
    console.error(`[na-meetings-md] erro: ${message}`)
  }
}

async function resolveInput() {
  if (await fileExists(PRIMARY_INPUT_PATH)) {
    return {
      inputPath: PRIMARY_INPUT_PATH,
      mode: "runtime",
    }
  }

  if (await fileExists(LEGACY_INPUT_PATH)) {
    return {
      inputPath: LEGACY_INPUT_PATH,
      mode: "legacy",
    }
  }

  throw new Error(
    `Nenhuma fonte encontrada. Esperado: ${PRIMARY_INPUT_PATH} ou ${LEGACY_INPUT_PATH}`
  )
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function buildRows(payload) {
  const grupos = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.grupos)
      ? payload.grupos
      : []
  const rows = []

  for (const grupo of grupos) {
    const nomeBruto = String(grupo?.nome ?? "").trim()
    if (!nomeBruto) continue

    const evento = normalizeEvento(nomeBruto)
    const sessoes = Array.isArray(grupo?.sessoes) ? grupo.sessoes : []

    for (const sessao of sessoes) {
      const dias = Array.isArray(sessao?.dias_semana) ? sessao.dias_semana : []
      const inicio = String(sessao?.horario_inicio ?? "").trim()
      const fim = String(sessao?.horario_fim ?? "").trim()
      const status = normalizeStatus(sessao?.tipo_acesso)
      const id = normalizeId(sessao?.zoom_id)

      for (const diaIndex of dias) {
        if (!Number.isInteger(diaIndex) || diaIndex < 0 || diaIndex > 6) continue
        rows.push({
          evento,
          diaIndex,
          dia: DAY_LABELS[diaIndex],
          inicio,
          fim,
          status,
          id,
        })
      }
    }
  }

  rows.sort((a, b) => {
    const byEvento = a.evento.localeCompare(b.evento, "pt-BR")
    if (byEvento !== 0) return byEvento

    const aDayPos = WEEKDAY_SORT_ORDER.indexOf(a.diaIndex)
    const bDayPos = WEEKDAY_SORT_ORDER.indexOf(b.diaIndex)
    if (aDayPos !== bDayPos) return aDayPos - bDayPos

    return a.inicio.localeCompare(b.inicio, "pt-BR")
  })

  return rows
}

function buildMarkdown(rows, source) {
  const generatedAt = new Date().toISOString()
  const lines = [
    "# na_meetings",
    "",
    `Gerado em: ${generatedAt}`,
    `Fonte: ${source.mode} (${source.inputPath})`,
    `Total de ocorrências: ${rows.length}`,
    "",
    "| Evento | Dia | Início | Fim | Status | ID |",
    "| --- | --- | --- | --- | --- | --- |",
  ]

  for (const row of rows) {
    lines.push(
      `| ${esc(row.evento)} | ${esc(row.dia)} | ${esc(row.inicio)} | ${esc(row.fim)} | ${esc(
        row.status
      )} | ${esc(row.id)} |`
    )
  }

  lines.push("")
  return lines.join("\n")
}

function normalizeEvento(value) {
  return value.replace(/^grupo\s+/i, "").trim()
}

function normalizeStatus(value) {
  const raw = String(value ?? "").trim().toLowerCase()
  if (raw === "aberta" || raw === "estudo" || raw === "fechada") return raw
  return "fechada"
}

function normalizeId(value) {
  const id = String(value ?? "").trim()
  return id.length > 0 && id.toLowerCase() !== "null" ? id : "-"
}

function esc(value) {
  return String(value).replace(/\|/g, "\\|")
}

void main()
