import assert from "node:assert/strict"
import { getMeetingsFromGroupsAtTime } from "../lib/meetings-filter.ts"

type AccessType = "aberta" | "fechada" | "estudo"

function buildGroup(day: number, start: string, end: string, tipo: AccessType = "aberta") {
  return [
    {
      id: "g1",
      nome: "Grupo Teste",
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
          tipo_acesso: tipo,
          timezone: "America/Sao_Paulo",
          notas: null,
        },
      ],
    },
  ]
}

function run(): void {
  const sunday1900 = new Date("2026-04-12T19:00:00-03:00")
  const monday1900 = new Date("2026-04-13T19:00:00-03:00")
  const sundayLate = new Date("2026-04-12T23:45:00-03:00")
  const mondayEarly = new Date("2026-04-13T00:15:00-03:00")

  const sunday0to6 = getMeetingsFromGroupsAtTime(buildGroup(0, "18:30", "19:30"), sunday1900)
  assert.equal(sunday0to6.emAndamento.length, 1, "domingo 0..6 deveria retornar sessão ativa")

  const sunday1to7 = getMeetingsFromGroupsAtTime(buildGroup(7, "18:30", "19:30"), sunday1900)
  assert.equal(sunday1to7.emAndamento.length, 1, "domingo 1..7 deveria retornar sessão ativa")

  const monday = getMeetingsFromGroupsAtTime(buildGroup(1, "18:30", "19:30"), monday1900)
  assert.equal(monday.emAndamento.length, 1, "segunda deveria manter sessão ativa")

  const overnightGroups = buildGroup(0, "23:30", "00:30")
  const overnightSunday = getMeetingsFromGroupsAtTime(overnightGroups, sundayLate)
  const overnightMonday = getMeetingsFromGroupsAtTime(overnightGroups, mondayEarly)
  assert.equal(overnightSunday.emAndamento.length, 1, "domingo 23:45 deveria estar ativa")
  assert.equal(overnightMonday.emAndamento.length, 1, "segunda 00:15 deveria permanecer ativa")

  console.log("PASS weekday-filter-check")
}

run()
