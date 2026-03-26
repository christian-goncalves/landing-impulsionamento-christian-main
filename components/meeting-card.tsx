"use client"

import { Video, BookOpen, Users, Lock } from "lucide-react"
import { ShareButton } from "./share-button"
import type { SessaoAtiva } from "@/lib/meetings"
import { trackZoomClick } from "@/lib/pixel"

interface MeetingCardProps {
  sessao: SessaoAtiva
  variant?: "andamento" | "embreve" | "proxima"
}

// ── Estilos por prioridade ──────────────────────────────────────────────────
const priorityStyles = {
  1: {
    border: "border-l-4 border-l-red-500 border border-red-200",
    badge: "bg-red-500 text-white",
    btn: "bg-red-500 hover:bg-red-600 text-white",
    label: "Entrar Agora",
    glow: "shadow-md shadow-red-100",
  },
  2: {
    border: "border-l-4 border-l-orange-400 border border-orange-200",
    badge: "bg-orange-400 text-white",
    btn: "bg-[hsl(var(--na-blue))] hover:bg-[hsl(var(--na-light-blue))] text-white",
    label: "Entrar",
    glow: "shadow-sm shadow-orange-50",
  },
  3: {
    border: "border-l-4 border-l-[hsl(var(--na-blue))] border border-blue-100",
    badge: "bg-[hsl(var(--na-blue))] text-white",
    btn: "bg-[hsl(var(--na-blue))] hover:bg-[hsl(var(--na-light-blue))] text-white",
    label: "Entrar",
    glow: "",
  },
  4: {
    border: "border border-border",
    badge: "bg-muted text-muted-foreground",
    btn: "bg-[hsl(var(--na-blue))] hover:bg-[hsl(var(--na-light-blue))] text-white",
    label: "Entrar",
    glow: "",
  },
}

// ── Detecta tipo da reunião ─────────────────────────────────────────────────
type TipoReuniao = "estudo" | "aberta" | "fechada"

function getTipo(sessao: SessaoAtiva["sessao"]): TipoReuniao {
  const temEstudo = sessao.formatos.some(
    f => f.toLowerCase().startsWith("estudo") || f === "Estudos"
  )
  if (temEstudo) return "estudo"
  return sessao.tipo_acesso === "aberta" ? "aberta" : "fechada"
}

// ── Badge de tipo ───────────────────────────────────────────────────────────
function TipoBadge({ sessao }: { sessao: SessaoAtiva["sessao"] }) {
  const tipo = getTipo(sessao)

  if (tipo === "estudo") return (
    <span title="Reunião de Estudo" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap">
      <BookOpen className="w-2.5 h-2.5" />Estudo
    </span>
  )
  if (tipo === "aberta") return (
    <span title="Aberta ao público em geral" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
      <Users className="w-2.5 h-2.5" />Aberta
    </span>
  )
  return (
    <span title="Para quem tem ou pensa que tem problemas com drogas" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
      <Lock className="w-2.5 h-2.5" />Fechada
    </span>
  )
}

// ── "termina em X" com cor por urgência ────────────────────────────────────
function TerminaEm({ minutos }: { minutos: number }) {
  let texto: string
  let cor: string
  if (minutos <= 10) { texto = `termina em ${minutos} min`; cor = "text-red-500 font-bold" }
  else if (minutos <= 20) { texto = `termina em ${minutos} min`; cor = "text-orange-500 font-semibold" }
  else if (minutos < 60) { texto = `termina em ${minutos} min`; cor = "text-amber-500 font-medium" }
  else {
    const h = Math.floor(minutos / 60); const m = minutos % 60
    texto = m > 0 ? `termina em ${h}h ${m}min` : `termina em ${h}h`
    cor = "text-muted-foreground font-medium"
  }
  return <span className={`text-[11px] ${cor}`}>{texto}</span>
}

// ── Componente principal ────────────────────────────────────────────────────
export function MeetingCard({ sessao, variant = "andamento" }: MeetingCardProps) {
  const style = priorityStyles[sessao.prioridade]
  const tipo = getTipo(sessao.sessao)
  const formatos = sessao.sessao.formatos
    .filter(f => f !== "Reunião Virtual" && !f.toLowerCase().startsWith("estudo") && f !== "Estudos")
    .join(", ")

  // Botão Entrar reutilizável com tracking
  function BotaoEntrar({ className, label }: { className: string; label: string }) {
    if (!sessao.zoomLink) return (
      <span className="flex-1 text-center py-2.5 rounded-lg text-xs font-bold bg-muted text-muted-foreground">
        {sessao.sessao.app}
      </span>
    )
    return (
      <a
        href={sessao.zoomLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackZoomClick(sessao.grupo.nome, tipo, sessao.sessao.horario_inicio)}
        className={className}
      >
        <Video className="w-3.5 h-3.5" />
        {label}
      </a>
    )
  }

  // ── Em Breve — lista compacta ─────────────────────────────────────────────
  if (variant === "embreve") {
    return (
      <div className={`flex items-center gap-3 bg-card rounded-xl p-3 transition-all hover:shadow-md ${style.border}`}>
        <div className="text-center min-w-[56px]">
          <div className="text-base font-bold text-[hsl(var(--na-blue))] font-display leading-none">{sessao.sessao.horario_inicio}</div>
          <div className="text-[10px] font-semibold text-orange-500 mt-0.5">{sessao.statusLabel}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground truncate mb-1">{sessao.grupo.nome}</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <TipoBadge sessao={sessao.sessao} />
            {formatos && <span className="text-xs text-muted-foreground truncate">{formatos}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {sessao.zoomLink && (
            <a
              href={sessao.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackZoomClick(sessao.grupo.nome, tipo, sessao.sessao.horario_inicio)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[hsl(var(--na-blue))] text-white hover:bg-[hsl(var(--na-light-blue))] transition-colors"
            >
              <Video className="w-3 h-3" />Entrar
            </a>
          )}
          <ShareButton
            title={sessao.grupo.nome}
            text={`Reunião às ${sessao.sessao.horario_inicio} - ${sessao.sessao.app}${sessao.sessao.zoom_id ? ` ID: ${sessao.sessao.zoom_id}` : ""}${sessao.sessao.senha ? ` Senha: ${sessao.sessao.senha}` : ""}`}
          />
        </div>
      </div>
    )
  }

  // ── Próximas — linha de lista ─────────────────────────────────────────────
  if (variant === "proxima") {
    return (
      <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 hover:border-[hsl(var(--na-blue))]/40 hover:shadow-sm transition-all">
        <div className="text-base font-bold text-[hsl(var(--na-blue))] min-w-[52px] font-display">{sessao.sessao.horario_inicio}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground truncate mb-1">{sessao.grupo.nome}</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <TipoBadge sessao={sessao.sessao} />
            {formatos && <span className="text-xs text-muted-foreground">{formatos}</span>}
          </div>
        </div>
        {sessao.zoomLink && (
          <a
            href={sessao.zoomLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackZoomClick(sessao.grupo.nome, tipo, sessao.sessao.horario_inicio)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[hsl(var(--na-blue))] text-white hover:bg-[hsl(var(--na-light-blue))] transition-colors flex-shrink-0"
          >
            Entrar
          </a>
        )}
        <ShareButton
          title={sessao.grupo.nome}
          text={`Reunião às ${sessao.sessao.horario_inicio} - ${sessao.sessao.app}${sessao.sessao.zoom_id ? ` ID: ${sessao.sessao.zoom_id}` : ""}${sessao.sessao.senha ? ` Senha: ${sessao.sessao.senha}` : ""}`}
        />
      </div>
    )
  }

  // ── Em Andamento — card completo ──────────────────────────────────────────
  return (
    <div className={`bg-card rounded-xl p-4 flex flex-col gap-2 transition-all hover:shadow-lg ${style.border} ${style.glow}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {sessao.prioridade === 1 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${style.badge}`}>{sessao.statusLabel}</span>
        </div>
        <TerminaEm minutos={sessao.minutosParaFim} />
      </div>

      <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">{sessao.grupo.nome}</h3>

      <div className="flex items-center gap-1.5 flex-wrap">
        <TipoBadge sessao={sessao.sessao} />
        {formatos && <span className="text-[11px] text-muted-foreground/80">{formatos}</span>}
      </div>

      <div className="text-sm font-bold text-[hsl(var(--na-blue))] font-display">
        {sessao.sessao.horario_inicio} – {sessao.sessao.horario_fim}
      </div>

      <div className="text-xs text-muted-foreground leading-relaxed">
        {sessao.sessao.app}
        {sessao.sessao.zoom_id && <> · ID: {sessao.sessao.zoom_id}</>}
        {sessao.sessao.senha && <> · Senha: {sessao.sessao.senha}</>}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-1">
        <BotaoEntrar
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all hover:-translate-y-0.5 ${style.btn}`}
          label={style.label}
        />
        <ShareButton
          title={sessao.grupo.nome}
          text={`${sessao.sessao.horario_inicio} – ${sessao.sessao.horario_fim} | ${sessao.sessao.app}${sessao.sessao.zoom_id ? ` ID: ${sessao.sessao.zoom_id}` : ""}${sessao.sessao.senha ? ` Senha: ${sessao.sessao.senha}` : ""}`}
        />
      </div>
    </div>
  )
}
