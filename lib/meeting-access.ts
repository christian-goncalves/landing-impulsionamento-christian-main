export type MeetingAccessType = "aberta" | "fechada" | "estudo"

export function resolveTipoAcesso(
  isOpen: number | boolean,
  isStudy: number | boolean
): MeetingAccessType {
  const open = isOpen === true || isOpen === 1
  const study = isStudy === true || isStudy === 1

  if (study) return "estudo"
  if (open) return "aberta"
  return "fechada"
}

