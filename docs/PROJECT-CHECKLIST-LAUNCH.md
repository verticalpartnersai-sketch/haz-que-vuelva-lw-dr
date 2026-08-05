# HAZ QUE VUELVA — checklist de integrações e lançamento

> Continuação do [checklist mestre](PROJECT-CHECKLIST.md). Este documento contém
> os Gates 6–7 e os critérios finais de aceite.

## Gate 6 — integrações futuras

- [x] Criar projeto Supabase próprio.
- [x] Aplicar e validar Supabase Storage privado. Os três buckets estão
  privados; duas contas foram impedidas de baixar o objeto sintético e de criar
  URL assinada, e a limpeza terminou sem objetos residuais.
- [ ] Aplicar e validar RAG no PostgreSQL/pgvector.
- [x] Criar Resend e publicar DKIM, SPF e MX no subdomínio
  `mail.hazquevuelva.site`.
- [x] Confirmar `mail.hazquevuelva.site` como `Verified` no painel Resend e
  configurar `Haz Que Vuelva <acceso@mail.hazquevuelva.site>` no Worker.
- [x] Publicar DMARC no domínio raiz em modo de monitoramento (`p=none`).
- [x] Criar projeto/chave Gemini próprios.
- [x] Usar somente credenciais deste projeto.

## Gate 7 — infraestrutura e lançamento

- [x] Preparar Workers OpenNext de marketing e área de membros.
- [x] Validar build, bundle, dry-run e preview local dos dois Workers.
- [x] Criar Dockerfile não-root e Worker/Container do agente.
- [x] Validar typecheck e dry-run estático do agente.
- [x] Construir e publicar a imagem do agente para `linux/amd64`.
- [x] Confirmar na prática que a conta Cloudflare cria e executa Containers.
- [x] Publicar `haz-que-vuelva-marketing` na conta correta.
- [x] Conectar DNS/TLS de `hazquevuelva.site`.
- [x] Validar em produção `/`, `/quiz`, imagens, áudio, idiomas e fluxo completo.
- [x] Iniciar no CTA o áudio em loop e ainda mudo, preservando o controle
  manual para a usuária ativá-lo; comprovado em produção com reprodução ativa,
  `muted=true` e zero erro no console.
- [x] Configurar CI de marketing, membros e agente no GitHub e comprovar os
  cinco jobs verdes, incluindo recuperação sintética fail-closed.
- [x] Habilitar alertas e correções de segurança do Dependabot e executar no CI
  `npm audit --omit=dev` nos três apps e `pip-audit` no agente Python.
- [x] Corrigir o alerta moderado `CVE-2025-71176` do `pytest`, atualizar para
  `9.1.1` e comprovar o estado `fixed` com os cinco jobs da CI verdes.
- [x] Publicar canonical, metadata social, sitemap, manifesto, cache de assets e
  headers defensivos do marketing.
- [x] Forçar redirecionamento permanente de HTTP para HTTPS no Worker de
  marketing e comprovar a resposta pública.
- [x] Criar smoke sintético recorrente para a superfície pública do marketing.
- [x] Incluir no smoke negativo recorrente a negação de reautenticação e mutação
  administrativa para sessão anônima, sem executar escrita.
- [x] Configurar o checkout real no CTA do quiz.
- [x] Ativar `upsell=true` no checkout principal e comprovar que o
  redirecionador preserva o parâmetro e a atribuição.
- [x] Implementar páginas mobile-first `/up1`, `/d1`, `/up2`, `/d2` e
  `/gracias`, mantendo os links de aceitação externos configuráveis.
- [x] Alinhar `/up1` e `/d1` ao sistema visual da página final do quiz,
  reutilizar o carrossel manual de Camila, Valentina e Sofía, usar o mockup
  multidevice de Reconquista 30 e manter o valor fora da hero de UP1. D1
  compara na hero o preço anterior de US$6,90 com o preço final de US$4,90.
- [x] Confirmar no contrato canônico que D2 mantém o mesmo Diagnóstico VUELVE
  IA, acesso e limites por US$15; implementar `/d2` com recusa para `/gracias`
  e UP2 com recusa para `/d2`. UP2 mantém o valor fora da hero; D2 compara o
  preço anterior de US$20 com o preço final de US$15.
- [x] Reconstruir UP2/D2 com o sistema visual `r30-*` aprovado na página final,
  em UP1 e em D1; usar capturas reais da VUELVE IA com conversa sintética de
  três turnos e incluir o mesmo carrossel manual de depoimentos nas duas páginas.
- [x] Publicar a primeira versão do redesign de UP2/D2 e comprovar no domínio
  público as capturas reais, os depoimentos e, naquele rollout, a ausência de
  preço nas heroes, além da cadeia de recusas, preservação da query e
  responsividade em 390 × 844 e 1440 × 900.
- [x] Publicar o refinamento com conversa sintética multietapa nos três
  dispositivos de UP2/D2, remoção da seção secundária de mockup e comparação
  de preço nas heroes de D1/D2; comprovar em produção 200, query preservada,
  ausência de overflow e console limpo em 390 × 844 e 1440 × 900.
- [x] Publicar UP2/D2 no Worker de marketing e comprovar em produção a cadeia
  de recusas `D1 → /gracias`, `UP2 → /d2` e `D2 → /gracias`, com query
  preservada, ausência de overflow e console limpo.
- [ ] Configurar `NEXT_PUBLIC_DOWNSELL_2_ACCEPT_URL` com o checkout aprovado do
  Downsell 2; até lá, o aceite de `/d2` permanece sem cobrança.
- [x] Configurar os checkouts de Reconquista 30 e Diagnóstico VUELVE IA nos
  CTAs de `/up1` e `/up2`.
- [ ] Configurar `NEXT_PUBLIC_DOWNSELL_1_ACCEPT_URL` com o checkout aprovado do
  Downsell 1; até lá, o aceite de `/d1` permanece sem cobrança.
- [x] Remover afirmações de compra confirmada de acessos diretos a `/up1`,
  `/up2` e `/gracias`; o smoke exige linguagem condicional sem contexto de
  transação verificada.
- [x] Usar a mesma linguagem neutra em `/d1`; a verificação local foi
  concluída e o smoke remoto manual passou. A rota ainda precisa entrar no
  smoke recorrente versionado.
- [ ] Conectar Workers Builds do marketing ao GitHub.
- [ ] Aplicar em Cloudflare uma Configuration Rule com `disable_rum=true` para
  `miembros.hazquevuelva.site`. A decisão de preservar a CSP e desligar o beacon
  foi aprovada; o OAuth atual do Wrangler não tem permissão para escrever essa
  regra e a API respondeu 403. Um executor fail-closed agora valida a zona,
  preserva regras existentes e exige token temporário de privilégio mínimo;
  falta executar e comprovar a regra no edge.
- [x] Criar o Worker da área de membros e versionar o contrato de variáveis,
  segredos obrigatórios e domínio exclusivo de produção.
- [x] Cadastrar variáveis e segredos reais no Worker da área de membros sem
  versionar seus valores.
- [x] Publicar a área de membros e comprovar redirecionamento anônimo de `/` e
  `/productos` para `/login`.
- [x] Configurar Service Binding privado entre BFF e agente, desativar Preview
  URLs e manter `workers.dev` somente como ponte autenticada para Workers AI e
  backfill; chamadas anônimas são recusadas com 401 antes do payload.
- [x] Publicar e validar o rollout de 31/07/2026: marketing e login respondem
  200, health da área de membros responde `ready` e o smoke completo passa
  após os controles de telemetria, orçamento da IA e autenticação da ponte.
- [x] Publicar a detecção operacional das outboxes e do webhook, comprovar 401
  sem credencial na rota interna e observar o Cron de produção concluir com
  status `Ok` na versão `637aef83-8f4a-4132-bde3-5cb4c1592302`.
- [x] Conectar Cloudflare DNS/TLS a `miembros.hazquevuelva.site`.
- [x] Publicar o Container VUELVE IA e exigir a credencial interna no Worker e
  novamente no FastAPI.
- [x] Corrigir no Supabase Auth a Site URL, redirects e cadastro público.
- [x] Criar e validar o primeiro backup lógico criptografado. O pacote de
  01/08/2026 foi gerado por clientes PostgreSQL nativos, validado sem abrir
  conexão de restauração e registrado pelo SHA-256
  `43d33744da64091eae85d19a5808b66cb4576e58d72b3bb88f17e6e14a4908ac`.
- [ ] Testar a restauração em projeto isolado e cronometrar o drill. O projeto
  de produção permanece explicitamente proibido pelo executor.
- [x] Exercitar criação, atualização e encerramento do incidente persistente no
  GitHub para o smoke público recorrente ([Issue 1](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/issues/1)).
- [ ] Concluir métricas e alertas. Fila morta/travada, webhook atrasado,
  telemetria inválida e teto diário da IA já geram erro observável; faltam
  aprovar o valor do orçamento e configurar/exercitar um canal de paging.
- [ ] Executar o drill real de rollback. O executor defensivo foi versionado e
  validado em modo somente planejamento; falta promover uma versão anterior,
  passar o smoke e restaurar a versão atual em janela controlada.
- [ ] Rotacionar antes da venda as credenciais reais compartilhadas durante a
  configuração, atualizar os Workers e comprovar revogação dos valores antigos.
- [ ] Testar autorização por objeto, compra, revogação, download e IA.
- [x] Testar em espanhol, desktop e celular o quiz público, o checkout externo,
  o login e a recuperação anônima. O fluxo foi percorrido em produção a
  390x844 e 1440x900 sem overflow; a validação das telas autenticadas permanece
  aberta no P1 da auditoria de produção.
- [x] Impedir `/up1`, `/up2` e `/gracias` de afirmar compra confirmada sem
  contexto verificável; o smoke falha se a linguagem antiga reaparecer.
- [ ] Religar a Supabase CLI com a conta que enxerga o projeto definitivo; o
  app e as migrações remotas estão ativos, mas o token CLI local atual não tem
  acesso administrativo ao projeto.
- [x] Criar, promover e convidar o admin inicial pelo comando privado.
- [x] Concluir senha do admin e comprovar que somente o proprietário canônico
  obtém o papel administrativo efetivo.
- [x] Exigir Auth real no modo `production`, impedir catálogo/sessão mock,
  proteger também `/`, publicar health check sem dados sensíveis, request ID e
  CSP restrita ao próprio app e ao projeto Supabase configurado.

## Critérios finais de aceite

- Compra aprovada libera somente o produto comprado.
- Cancelamento, reembolso e chargeback revogam o acesso correto.
- Um membro não acessa conteúdo, compra, conversa ou memória de outro.
- A IA só atende quem possui a permissão e usa os escopos corretos.
- Administração gerencia conteúdo, permissões, convites e eventos.
- Arquivos permanecem privados e downloads são autorizados.
- Backup, restauração e rollback são verificados antes da venda.
