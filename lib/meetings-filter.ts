import type { Grupo, MeetingsResult, SessaoAtiva } from "@/lib/meetings"

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

function buildZoomLink(app: string, zoomId: string | null, senha: string | null): string | null {
  if (app !== "Zoom" || !zoomId) return null
  const id = zoomId.replace(/\s/g, "")
  const pwd = senha ? `?pwd=${senha}` : ""
  return `https://zoom.us/j/${id}${pwd}`
}

function normalizeWeekday(day: number): number | null {
  if (!Number.isInteger(day)) return null
  if (day === 0) return 7
  if (day >= 1 && day <= 7) return day
  return null
}

function normalizeWeekdays(days: number[]): number[] {
  const normalized = new Set<number>()
  for (const day of days) {
    const value = normalizeWeekday(day)
    if (value !== null) {
      normalized.add(value)
    }
  }
  return [...normalized].sort((a, b) => a - b)
}

export function getMeetingsFromGroupsAtTime(grupos: Grupo[], now: Date): MeetingsResult {
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
      const diasValidos = normalizeWeekdays(sessao.dias_semana)
      if (diasValidos.length === 0) continue

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

      const zoomLink = buildZoomLink(sessao.app, sessao.zoom_id, sessao.senha)

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
