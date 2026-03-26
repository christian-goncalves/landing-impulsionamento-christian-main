# VALIDATION_EVIDENCE_2026-03-26

## Escopo executado
Validação operacional da Fase 05 no contexto atual do projeto `landing-impulsionamento-main`.

## Evidências coletadas

### 1) Build de produção
- Comando: `npm run build`
- Resultado final: **SUCESSO** (com permissão de rede para baixar Google Fonts)
- Evidência resumida:
  - Compiled successfully
  - Static pages geradas: `/` e `/_not-found`

### 2) Lint
- Situação inicial: script `next lint` inválido no contexto atual.
- Ação executada:
  - Configuração de ESLint adicionada (`eslint.config.mjs`).
  - Script ajustado para `eslint .`.
  - Dependências de lint instaladas.
  - Erros bloqueantes corrigidos em código.
- Comando final: `npm run lint`
- Resultado final: **SUCESSO** (0 errors, warnings não bloqueantes).

### 3) Sanidade dos dados locais (`data/na_meetings.json`)
- Validação executada via Node script.
- Resultado:
  - grupos: 125
  - sessoes: 275
  - invalidDias: 0
  - invalidHora: 0

### 4) Presença de seções principais no frontend
- Arquivo validado: `components/meetings-client.tsx`
- IDs encontrados:
  - `id="andamento"`
  - `id="iniciando"`
  - `id="proximas"`
- Mensagens de vazio encontradas:
  - "Nenhuma reunião em andamento agora."
  - "Nenhuma reunião iniciando nos próximos 60 minutos."

## Conclusão parcial
- Build: aprovado.
- Lint: aprovado.
- Estrutura mínima de frontend: aprovada.
- Fallback/stale fim-a-fim: aprovado.

## Rodada extra - integração frontend com API interna

### 1) Migração de consumo de dados
- `components/meetings-client.tsx` passou a consumir dados assíncronos via `getMeetingsFromApi`.
- `lib/meetings.ts` passou a expor:
  - `getMeetingsFromApi` (fonte primária: `/api/reunioes-virtuais`)
  - fallback local temporário baseado em `data/na_meetings.json`.
- Indicador de status operacional implementado:
  - `ok`: sem aviso.
  - `fallback`: aviso discreto de contingência.
  - `stale`: aviso de desatualização.

### 2) Validação runtime pós-integração
- Evidência técnica: `checklists/RUNTIME_SYNC_FALLBACK_EVIDENCE_2026-03-26.json`
- Resultado:
  - `sync_manual.ok = true`
  - `after_sync.sourceStatus = ok`
  - `after_fallback.sourceStatus = fallback`
  - `after_stale.sourceStatus = stale`
  - `after_recover.sourceStatus = ok`

## Conclusão final
- Integração do frontend com API interna concluída sem mudança de stack.
- Build/lint aprovados (warnings não bloqueantes remanescentes fora do escopo desta entrega).
- Fluxos `ok`, `fallback`, `stale` e `recover` validados em runtime.

## Rodada extra - correção cirúrgica de status (Fênix/Largo)

### 1) Fonte operacional e legado
- Fonte única operacional definida: data/runtime/current_groups.json.
- lib/meetings.ts atualizado para fallback legado apenas por flag MEETINGS_ENABLE_LEGACY_JSON_FALLBACK=true.
- scripts/generate-na-meetings-md.mjs atualizado para priorizar runtime (fallback legado temporário).

### 2) Diagnóstico expandido
- GET /api/diagnostics/scraping-compare agora compara source_raw x 
ormalized_runtime x payload_window.
- Novo motivo explícito: status_mismatch.

### 3) Evidência dirigida
- data/na_meetings.md regenerado com fonte untime.
- Fênix: Seg-Sáb echada, Dom berta.
- Largo do Machado: Dom 10:00 berta; demais ocorrências sem marcador de aberta = echada.

### 4) Qualidade técnica
- 
pm run lint: sucesso (warnings não bloqueantes preexistentes).
- 
pm run build: sucesso.
