# Execucao de contingencia de dados em producao

- Data: 2026-04-15
- Contexto: Next.js + Vercel, dominio canonico `na.reuniaovirtual.online`, endpoint critico `/api/reunioes-virtuais`.
- Escopo: descobrir causa raiz, mitigar indisponibilidade, aplicar correcao permanente, definir rollback e criterios de encerramento.

## 1. Diagnostico final (causa raiz + evidencias)

**Causa raiz principal (alta probabilidade):** falha de persistencia em runtime serverless (filesystem read-only/indisponivel) gerando degradacao intermitente.  
**Causa contribuinte:** confusao de host/alias (um alias antigo invalido), levando a leituras inconsistentes e percepcao de "vazio".

### Evidencias objetivas por fase/checklist

- **A) Dominio/TLS/redirect**
  - Comando: `curl.exe -sS -D - -o NUL https://reuniaovirtual.online/api/reunioes-virtuais`
  - Saida resumida: `HTTP/1.1 308` + `Location: https://na.reuniaovirtual.online/...` + `Strict-Transport-Security`.
  - Conclusao: redirect e TLS corretos no dominio raiz.

- **B) Payload API no canonico + alias producao**
  - Comando: `Invoke-RestMethod` em:
    - `https://na.reuniaovirtual.online/api/reunioes-virtuais`
    - `https://landing-impulsionamento-christian-m.vercel.app/api/reunioes-virtuais`
  - Saida resumida (pos-correcao): ambos `version=v1`, `sourceStatus=ok`, contagens iguais (`13/10/1`), `lastSyncAt` igual.
  - Conclusao: contrato e dados consistentes entre canonico e alias de producao ativo.

- **C) Logs runtime da rota (correlacao temporal)**
  - Comando: `vercel logs ... --since ... --json` (varias tentativas por ambiente/deployment/status 500).
  - Saida resumida: CLI retorna "Fetching logs..." sem linhas.
  - Conclusao: nao houve evidencia de 500 no retorno do CLI nesse intervalo, mas a coleta de log ficou inconclusiva por limitacao da API/CLI neste ambiente.

- **D) Env vars criticas**
  - Comando: `vercel env pull ...` + leitura filtrada.
  - Saida resumida: `MEETINGS_ENABLE_LEGACY_JSON_FALLBACK="true"`, `VERCEL="1"`, `VERCEL_ENV="production"`.
  - Conclusao: mitigacao de fallback local estava habilitada em producao.

- **E) Frontend (Network + erro client-side)**
  - Ferramenta: Playwright
  - Saida resumida: request `GET /api/reunioes-virtuais => 200`; console sem erro apos validacao final.
  - Conclusao: frontend consumindo API normalmente no canonico.

- **Evidencia de alias invalido/contribuinte**
  - Comando: `curl -I https://landing-impulsionamento-christian-main.vercel.app/api/reunioes-virtuais`
  - Saida resumida: `404 DEPLOYMENT_NOT_FOUND`.
  - Conclusao: esse host nao e alias produtivo valido e pode gerar percepcao de indisponibilidade se usado.

## 2. Plano de acao executavel (ordem exata de passos)

1. Blindar persistencia para nao derrubar request em erro de write (`EROFS/EACCES/...`).
2. Deploy imediato em producao.
3. Validar canonico + alias produtivo + frontend.
4. Rodar janela minima de estabilidade continua.
5. Definir rollback pronto (1 comando).

## 3. Execucao passo a passo

1. **Hardening aplicado**
   - Arquivo alterado: `lib/runtime-store.ts`
   - Mudancas:
     - fallback em memoria (`inMemoryStore`) para leituras/escritas.
     - `writeJsonFile` e `writeQualityReport` nao quebram request em falha de FS; logam e seguem.
     - protecao para `MEETINGS_RUNTIME_DIR` invalido em Vercel (`/var/task` -> forca `/tmp/na-runtime`).

2. **Build local**
   - Comando: `npm run build`
   - Saida resumida: build Next.js OK, rotas API compiladas.
   - Conclusao: patch integro.

3. **Deploy producao**
   - Comando: `vercel deploy --prod --yes --scope christian-goncalves-projects`
   - Saida resumida:
     - Deployment: `https://landing-impulsionamento-christian-main-5gzsj9qdb.vercel.app`
     - Aliases aplicados: `reuniaovirtual.online`, `na.reuniaovirtual.online`, `landing-impulsionamento-christian-m.vercel.app`.
   - Conclusao: correcao publicada.

4. **Validacao pos-deploy**
   - Redirect/TLS: OK.
   - Payload canonico + alias: iguais (`v1`, `ok`, contagens iguais).
   - Frontend: request API 200, console sem erros relevantes.

## 4. Resultado de validacao (antes/depois)

- **Antes**
  - Historico de incidente com fallback/erro bootstrap e episodios de inconsistencia por host/deployment.
  - Alias antigo invalido identificado (`DEPLOYMENT_NOT_FOUND`).

- **Depois**
  - Canonico e alias produtivo ativos respondendo mesmo contrato e mesmas contagens.
  - `sourceStatus=ok` estavel.
  - Janela de estabilidade executada (8 amostras/4 min, a cada 30s): **100% consistentes** (`equal=True` em todas).

## 5. Plano de rollback

Se houver regressao:

1. Executar rollback imediato para deployment anterior estavel:
   - `vercel rollback https://landing-impulsionamento-christian-main-lyxf9r0od.vercel.app --scope christian-goncalves-projects`
2. Revalidar:
   - `curl -I` no raiz/canonico
   - payload em canonico + alias
   - teste frontend `/api/reunioes-virtuais` 200
3. Criterio de rollback bem-sucedido:
   - `sourceStatus` sem erro critico e contagens nao vazias por janela minima de 10 min.

## 6. Proximos passos para remover workaround e evitar regressao

1. Ativar monitor sintetico de 1 min para `/api/reunioes-virtuais` (alerta em 5xx, payload invalido, ou contagens zeradas inesperadas).
2. Resolver definitivamente coleta de logs runtime (token/permissao/consulta) para fechar checklist C com evidencia direta de erro/ausencia.
3. Apos estabilidade observada (ex.: 7 dias), avaliar desligar fallback local de cliente (`MEETINGS_ENABLE_LEGACY_JSON_FALLBACK`) em etapa controlada.
4. Bloquear/documentar hosts nao canonicos para evitar trafego em aliases invalidos.
