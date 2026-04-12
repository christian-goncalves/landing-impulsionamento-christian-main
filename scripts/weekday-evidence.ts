import { getMeetingsFromGroupsAtTime } from "../lib/meetings-filter.ts"

type AccessType = "aberta" | "fechada" | "estudo"

interface GrupoLike {
  id: string
  nome: string
  cidade: string | null
  estado: string | null
  sessoes: Array<{
    dias_semana: number[]
    horario_inicio: string
    horario_fim: string
    app: string
    zoom_id: string | null
    senha: string | null
    formatos: string[]
    tipo_acesso: AccessType
    timezone: string
    notas: string | null
  }>
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

function oldActiveCount(grupos: GrupoLike[], now: Date): number {
  const diaSemana = now.getDay() === 0 ? 7 : now.getDay()
  const ontem = diaSemana === 1 ? 7 : diaSemana - 1
  const nowMin = now.getHours() * 60 + now.getMinutes()
  let count = 0

  for (const grupo of grupos) {
    for (const sessao of grupo.sessoes) {
      const inicio = toMinutes(sessao.horario_inicio)
      const fim = toMinutes(sessao.horario_fim)
      const cruzouMeiaNoite = fim <= inicio
      const diasValidos = sessao.dias_semana
      let ativo = false

      if (!cruzouMeiaNoite) {
        if (!diasValidos.includes(diaSemana)) continue
        if (nowMin >= inicio && nowMin < fim) ativo = true
      } else {
        if (diasValidos.includes(diaSemana) && nowMin >= inicio) {
          ativo = true
        } else if (diasValidos.includes(ontem) && nowMin < fim) {
          ativo = true
        }
      }

      if (ativo) count += 1
    }
  }

  return count
}

function buildGroup(day: number, start: string, end: string): GrupoLike[] {
  return [
    {
      id: "g1",
      nome: "Grupo Evidencia",
      cidade: null,
      estado: null,
      sessoes: [
        {
          dias_semana: [day],
          horario_inicio: start,
          horario_fim: end,
          app: "Zoom",
          zoom_id: "123456789",
          senha: null,
          formatos: [],
          tipo_acesso: "aberta",
          timezone: "America/Sao_Paulo",
          notas: null,
        },
      ],
    },
  ]
}

const sunday = new Date("2026-04-12T19:00:00-03:00")
const monday = new Date("2026-04-13T19:00:00-03:00")
const midnight = new Date("2026-04-13T00:15:00-03:00")

const sundayGroupLegacy = buildGroup(0, "18:30", "19:30")
const sundayGroupCanonical = buildGroup(7, "18:30", "19:30")
const mondayGroup = buildGroup(1, "18:30", "19:30")
const midnightGroup = buildGroup(0, "23:30", "00:30")

const evidence = {
  generatedAt: new Date().toISOString(),
  scenarios: {
    sundayLegacyEncoding: {
      reference: sunday.toISOString(),
      beforeFixActiveCount: oldActiveCount(sundayGroupLegacy, sunday),
      afterFixActiveCount: getMeetingsFromGroupsAtTime(sundayGroupLegacy, sunday).emAndamento.length,
    },
    sundayCanonicalEncoding: {
      reference: sunday.toISOString(),
      afterFixActiveCount:
        getMeetingsFromGroupsAtTime(sundayGroupCanonical, sunday).emAndamento.length,
    },
    mondayExpected: {
      reference: monday.toISOString(),
      beforeFixActiveCount: oldActiveCount(mondayGroup, monday),
      afterFixActiveCount: getMeetingsFromGroupsAtTime(mondayGroup, monday).emAndamento.length,
    },
    overnightSundayToMonday: {
      reference: midnight.toISOString(),
      afterFixActiveCount: getMeetingsFromGroupsAtTime(midnightGroup, midnight).emAndamento.length,
    },
  },
  apiContractKeys: [
    "version",
    "serverTime",
    "lastSyncAt",
    "sourceStatus",
    "emAndamento",
    "iniciandoEmBreve",
    "proximas",
  ],
}

console.log(JSON.stringify(evidence, null, 2))
