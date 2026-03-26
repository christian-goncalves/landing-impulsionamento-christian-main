import meetingsData from "@/data/na_meetings.json"

export interface Sessao {
  dias_semana: number[]
  horario_inicio: string
  horario_fim: string
  app: string
  zoom_id: string | null
  senha: string | null
  formatos: string[]
  tipo_acesso: string
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
  minutosParaInicio: number   // negativo = já começou
  minutosParaFim: number
  zoomLink: string | null
}

export interface MeetingsResult {
  emAndamento: SessaoAtiva[]       // acontecendo agora
  iniciandoEmBreve: SessaoAtiva[]  // começa em até 60min
  proximas: SessaoAtiva[]          // próximas (além de 60min, até 8h)
}

// Legacy compat
export type QueryResult = { mode: 'active' | 'upcoming'; sessions: SessaoAtiva[] }

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

export function getMeetings(): MeetingsResult {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  )

  const diaSemana = now.getDay() === 0 ? 7 : now.getDay()
  const ontem = diaSemana === 1 ? 7 : diaSemana - 1

  const nowMin = now.getHours() * 60 + now.getMinutes()

  const emAndamento: SessaoAtiva[] = []
  const iniciandoEmBreve: SessaoAtiva[] = []
  const proximas: SessaoAtiva[] = []

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

  for (const grupo of (meetingsData as { grupos: Grupo[] }).grupos) {
    for (const sessao of grupo.sessoes) {
      const inicio = toMinutes(sessao.horario_inicio)
      const fim = toMinutes(sessao.horario_fim)
      const cruzouMeiaNoite = fim <= inicio

      const diasValidos = sessao.dias_semana

      let ativo = false
      let minutosParaInicio = inicio - nowMin
      let minutosParaFim = fim - nowMin

      // 🔥 CASO NORMAL (não cruza meia-noite)
      if (!cruzouMeiaNoite) {
        if (!diasValidos.includes(diaSemana)) continue

        if (nowMin >= inicio && nowMin < fim) {
          ativo = true
        }
      }

      // 🔥 CASO CRUZANDO MEIA-NOITE
      else {
        // Parte antes da meia-noite
        if (diasValidos.includes(diaSemana) && nowMin >= inicio) {
          ativo = true
          minutosParaFim = (1440 - nowMin) + fim
        }

        // Parte depois da meia-noite
        else if (diasValidos.includes(ontem) && nowMin < fim) {
          ativo = true
          minutosParaInicio = -( (1440 - inicio) + nowMin )
          minutosParaFim = fim - nowMin
        }
      }

      const zoomLink = buildZoomLink(sessao)

      // 🔴 EM ANDAMENTO
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
          zoomLink
        })

        continue
      }

      // 🔵 FUTURAS (somente hoje)
      if (!diasValidos.includes(diaSemana)) continue

      if (minutosParaInicio > 0 && minutosParaInicio <= 60) {
        iniciandoEmBreve.push({
          grupo,
          sessao,
          prioridade: 2,
          statusLabel:
            minutosParaInicio <= 5
              ? "Iniciando agora"
              : `Em ${minutosParaInicio} min`,
          minutosParaInicio,
          minutosParaFim,
          zoomLink
        })
      } else if (minutosParaInicio > 60 && minutosParaInicio <= 480) {
        proximas.push({
          grupo,
          sessao,
          prioridade: 4,
          statusLabel: sessao.horario_inicio,
          minutosParaInicio,
          minutosParaFim,
          zoomLink
        })
      }
    }
  }

  // 🔥 ORDENAÇÃO
  emAndamento.sort((a, b) => a.minutosParaInicio - b.minutosParaInicio)
  iniciandoEmBreve.sort((a, b) => a.minutosParaInicio - b.minutosParaInicio)
  proximas.sort((a, b) => a.minutosParaInicio - b.minutosParaInicio)

  // 💡 FALLBACK INTELIGENTE (NUNCA VAZIO)
  if (emAndamento.length === 0 && iniciandoEmBreve.length === 0) {
    return {
      emAndamento: [],
      iniciandoEmBreve: [],
      proximas: proximas.slice(0, 6)
    }
  }

  return {
    emAndamento,
    iniciandoEmBreve,
    proximas
  }
}
