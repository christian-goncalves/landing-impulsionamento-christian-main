# CHECKLIST_GTM_GA4_FUNIL_2026-04-15

## Objetivo e escopo
- Objetivo: validar instrumentação de analytics via `GA4` governado por `GTM`.
- Estratégia: `GA4 via GTM` (sem envio direto do frontend para GA4).
- Escopo: funil completo de engajamento e conversão instrumentado no frontend.
- Consentimento LGPD nesta fase: não aplicado (adiado por decisão explícita).

## Pré-requisitos
- [ ] Container correto selecionado no GTM: `GTM-P2FG5NBH`.
- [ ] Tag `GA4 Configuration` criada e/ou confirmada no container.
- [ ] Measurement ID do GA4 confirmado na tag de configuração.
- [ ] Site carregando com script GTM ativo em produção/preview.

## Data Layer Variables obrigatórias
- [ ] `origin`
- [ ] `grupo_nome`
- [ ] `tipo_acesso`
- [ ] `horario`
- [ ] `page_path`
- [ ] `cta`
- [ ] `canal`
- [ ] `section_id`
- [ ] `scroll_percent`
- [ ] `tempo_segundos`

## Mapeamento `evento -> trigger -> parâmetros`

| Evento | Trigger (Custom Event) | Parâmetros obrigatórios |
| --- | --- | --- |
| `call_click` | `ce_call_click` (`event = call_click`) | `origin`, `page_path` |
| `presenciais_click` | `ce_presenciais_click` (`event = presenciais_click`) | `origin`, `page_path` |
| `site_na_click` | `ce_site_na_click` (`event = site_na_click`) | `origin`, `page_path` |
| `zoom_click` | `ce_zoom_click` (`event = zoom_click`) | `origin`, `grupo_nome`, `tipo_acesso`, `horario`, `page_path` |
| `cta_click` | `ce_cta_click` (`event = cta_click`) | `origin`, `cta`, `page_path` |
| `share_click` | `ce_share_click` (`event = share_click`) | `origin`, `canal`, `page_path` |
| `section_view` | `ce_section_view` (`event = section_view`) | `origin`, `section_id`, `page_path` |
| `scroll_depth` | `ce_scroll_depth` (`event = scroll_depth`) | `origin`, `scroll_percent`, `page_path` |
| `time_on_page_milestones` | `ce_time_on_page_milestones` (`event = time_on_page_milestones`) | `origin`, `tempo_segundos`, `page_path` |

## Validação no GTM Preview (Tag Assistant)
1. Abrir `Preview` no container `GTM-P2FG5NBH`.
2. Conectar a URL do site e iniciar sessão de debug.
3. Executar fluxo real de navegação e cliques:
   - clique em CTA de reuniões online;
   - clique em ligar (`call_click`);
   - clique em reuniões presenciais (`presenciais_click`);
   - clique em site oficial (`site_na_click`);
   - clique em entrar na reunião (`zoom_click`);
   - clique em compartilhar WhatsApp e copiar link (`share_click`);
   - navegação por seções (`section_view`);
   - rolagem de página (`scroll_depth`);
   - permanência em página para marcos de tempo (`time_on_page_milestones`).
4. Em cada evento, validar:
   - trigger correta disparada;
   - tag GA4 Event correspondente disparada;
   - parâmetros obrigatórios preenchidos.

## Validação no GA4 (Realtime + DebugView)
1. Abrir `Realtime` e `DebugView` da propriedade GA4.
2. Repetir fluxo de teste com sessão em debug.
3. Validar recebimento de todos os eventos instrumentados.
4. Confirmar preenchimento dos parâmetros enviados via GTM.

## Critério explícito de aceite
- [ ] `page_view` aparece sem duplicidade por carregamento de página.
- [ ] Todos os eventos do mapeamento são recebidos no GA4.
- [ ] Eventos chegam com os parâmetros obrigatórios definidos neste checklist.

## Evidência de execução (preenchimento manual)
- Data/hora da validação:
- Responsável:
- Versão publicada do container GTM:

### Resultado por evento (OK/NOK)
- `call_click`:
- `presenciais_click`:
- `site_na_click`:
- `zoom_click`:
- `cta_click`:
- `share_click`:
- `section_view`:
- `scroll_depth`:
- `time_on_page_milestones`:

### Observações finais
- Incidentes encontrados:
- Ajustes aplicados:
- Status final: `GO` / `NO-GO`
