# API_PAYLOAD_V1

## Propósito
Definir o contrato único de dados esperado pelo frontend para renderização das seções de reuniões.

## Estrutura canônica
```ts
type ApiPayloadV1 = {
  version: "v1"
  serverTime: string // ISO-8601
  lastSyncAt: string | null // ISO-8601
  sourceStatus: "ok" | "fallback" | "stale"
  emAndamento: SessaoAtiva[]
  iniciandoEmBreve: SessaoAtiva[]
  proximas: SessaoAtiva[]
}

type SessaoAtiva = {
  grupo: {
    id: string
    nome: string
    cidade: string | null
    estado: string | null
  }
  sessao: {
    dias_semana: number[] // 0..6 (0=Dom)
    horario_inicio: string // HH:mm
    horario_fim: string // HH:mm
    app: string
    zoom_id: string | null
    senha: string | null
    formatos: string[]
    tipo_acesso: "aberta" | "fechada" | string
    timezone: string
    notas: string | null
  }
  prioridade: 1 | 2 | 3 | 4
  statusLabel: string
  minutosParaInicio: number
  minutosParaFim: number
  zoomLink: string | null
}
```

## Regras de validação (campo a campo)
- `version`: obrigatório, literal `v1`.
- `serverTime`: obrigatório, string ISO-8601 válida.
- `lastSyncAt`: opcional nulo, quando presente deve ser ISO-8601 válida.
- `sourceStatus`: obrigatório, enum `ok|fallback|stale`.
- `emAndamento`, `iniciandoEmBreve`, `proximas`: sempre presentes, nunca `null`.

### Regras por item `SessaoAtiva`
- `grupo.id` e `grupo.nome`: obrigatórios e não vazios.
- `sessao.horario_inicio` e `sessao.horario_fim`: obrigatórios no formato `HH:mm`.
- `sessao.dias_semana`: obrigatório; cada item entre `0` e `6`.
- `prioridade`: obrigatório; intervalo fechado `1..4`.
- `statusLabel`: obrigatório; string não vazia.
- `zoomLink`: deve ser coerente com `sessao.app` e `sessao.zoom_id`.

## Invariantes de ordenação e janela
- `emAndamento`: ordenado por `minutosParaInicio` ascendente (mais recente primeiro).
- `iniciandoEmBreve`: `minutosParaInicio > 0` e `<= 60`, ordenado asc.
- `proximas`: `minutosParaInicio > 60` e `<= 480`, ordenado asc.

## Casos de borda obrigatórios
1. Sessões que cruzam meia-noite (`horario_fim <= horario_inicio`).
2. Sessões sem Zoom (`zoom_id=null`) devem manter `zoomLink=null`.
3. Estado sem itens em `emAndamento` e `iniciandoEmBreve` deve manter `proximas` limitado conforme regra de UI.
4. `sourceStatus=fallback` com `lastSyncAt` antigo deve manter contrato íntegro.

## Compatibilidade
- Não remover campos de V1.
- Campos novos em V1 devem ser opcionais e backward-compatible.
- Breaking change exige nova versão (`v2`) + registro no `DECISION_LOG.md`.

## Exemplos válidos
### Estado `ok`
```json
{
  "version": "v1",
  "serverTime": "2026-03-26T15:20:00-03:00",
  "lastSyncAt": "2026-03-26T15:10:00-03:00",
  "sourceStatus": "ok",
  "emAndamento": [],
  "iniciandoEmBreve": [],
  "proximas": []
}
```

### Estado `fallback`
```json
{
  "version": "v1",
  "serverTime": "2026-03-26T15:30:00-03:00",
  "lastSyncAt": "2026-03-26T14:50:00-03:00",
  "sourceStatus": "fallback",
  "emAndamento": [],
  "iniciandoEmBreve": [],
  "proximas": []
}
```

### Estado `stale`
```json
{
  "version": "v1",
  "serverTime": "2026-03-26T18:30:00-03:00",
  "lastSyncAt": "2026-03-26T12:00:00-03:00",
  "sourceStatus": "stale",
  "emAndamento": [],
  "iniciandoEmBreve": [],
  "proximas": []
}
```
