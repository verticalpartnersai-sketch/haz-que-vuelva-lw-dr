# HAZ QUE VUELVA — checklist mestre

> Documento vivo e fonte de verdade do progresso.
>
> Estado em 1 de agosto de 2026: **frontend aprovado; marketing e área de
> membros publicados; 29 migrações no Supabase Cloud; Container da VUELVE IA
> configurado com geração bloqueada por flag**.
>
> Gates 5–7 estão parcialmente executados por autorização explícita, mas
> continuam abertos até os testes reais, controles operacionais e dependências
> externas listados abaixo.
>
> A fronteira de lançamento e a ordem dos bloqueios estão registradas na
> [auditoria de prontidão para produção](PRODUCTION-READINESS-AUDIT.md).

## Sequência obrigatória

- [x] Resolver o checkout correto e versionar o estado inicial.
- [x] Gate 1: consolidar documentação.
- [x] Gate 2: validar system design e design system.
- [x] Gate 3: implementar frontend estático com mocks.
- [x] Gate 4: obter aprovação explícita do frontend.
- [ ] Gate 5: implementar backend em fatias autorizadas. **Em andamento.**
- [ ] Gate 6: integrar fornecedores.
- [ ] Gate 7: infraestrutura, segurança operacional e lançamento.

Esta ordem define dependências, não impede trabalho preparatório explicitamente
autorizado em gates posteriores. Um gate só pode ser marcado como concluído
quando todos os seus critérios obrigatórios tiverem evidência.

## Gate 1 — documentação

- [x] Criar índice documental.
- [x] Documentar produto, escopo, papéis e terminologia.
- [x] Documentar arquitetura modular e direção de dependências.
- [x] Documentar system design futuro e limites de confiança.
- [x] Documentar design system provisório e acessibilidade.
- [x] Documentar mapa de navegação e permissões.
- [x] Especificar telas e mocks do frontend.
- [x] Definir protocolo de pesquisa Exa e registrar fontes do Gate 1.
- [x] Registrar o documento canônico de cada contrato.
- [x] Corrigir os achados das revisões de padrões e especificação.
- [x] Revisar consistência entre todos os documentos.
- [x] Criar commit exclusivo de documentação.
- [x] Reportar conclusão à coordenação.
- [x] Ingerir as notas Oracle 00–04 com matriz de rastreabilidade.
- [x] Separar VUELVE IA, privacidade/segurança e integrações futuras da
  implementação atual.
- [x] Registrar conflitos Oracle sem sobrescrever decisões mais recentes.

## Produto

- [x] Espanhol como idioma padrão, com seletor local para português e inglês.
- [x] Usar `Productos`, nunca cursos.
- [x] Suportar produto principal, order bumps e upsells.
- [x] Perfis previstos: `admin` e `member`.
- [x] Conteúdo inicial: PDF e anexos.
- [x] Vídeo fora da primeira entrega.
- [x] Comentários condicionados a feature flag e política de moderação.

## Pendências do usuário

- [x] Confirmar `hazquevuelva.site` como domínio público do marketing.
- [x] Fornecer códigos, nomes e links Perfect Pay dos três produtos e códigos
  dos dois order bumps.
- [x] Confirmar produtos de upsell: `reconquista_30` e `vuelve_ia`.
- [x] Definir `vuelve_ia` como entitlement canônico da IA.
- [x] Entregar os quatro PDFs editoriais finais em espanhol e preparar versões
  web validadas abaixo do limite de upload.
- [x] Automatizar o preflight dos quatro PDFs contra bytes, hash, páginas,
  catálogo remoto e manifesto aprovado, sem publicar ou alterar o banco.
- [ ] Entregar documentos de conhecimento e prompt final da VUELVE IA.
- [x] Enviar a família final da hero para desktop, ultra-wide, tablet e mobile.
- [ ] Enviar os demais arquivos oficiais da marca.
- [x] Definir baseline tipográfica aberta e licenças.
- [x] Escolher modelos e limites de mensagens da IA.
- [ ] Aprovar orçamento e alertas de gasto da IA.
- [ ] Fornecer WhatsApp de suporte.
- [ ] Definir moderação de comentários.
- [ ] Confirmar duração dos produtos editoriais.
- [x] Definir leitura autenticada e download de cópia individual marcada.
- [ ] Validar base legal, consentimento, retenção e subprocessadores antes de
  qualquer dado real.

## Gate 2 — system design e design system

- [x] Reler checklist, system design, design system e fontes do gate.
- [x] Atualizar a pesquisa Exa das decisões atuais do gate.
- [x] Validar preto/carvão e vermelho como direção obrigatória da paleta.
- [x] Validar a escala provisória completa de vermelhos.
- [x] Validar superfícies escuras, textos neutros e estados semânticos.
- [x] Revalidar contraste dos pares provisórios.
- [x] Aprovar tokens provisórios de cor.
- [x] Confirmar que vermelho guia atenção sem dominar os componentes.
- [x] Validar que o resultado não tem aparência corporativa fria.
- [x] Aprovar direção tipográfica e obter fontes licenciadas.
- [x] Aprovar escala de espaçamento, raios, sombras e movimento.
- [x] Aprovar estados disponível, bloqueado, loading, vazio e erro.
- [x] Aprovar comportamento da sidebar no desktop.
- [x] Aprovar navegação mobile.
- [x] Validar contraste e requisitos WCAG 2.2 AA.
- [x] Aprovar contratos dos componentes reutilizáveis.
- [x] Confirmar que a referência foi traduzida sem cópia de marca ou assets.
- [x] Revisar independentemente padrões e aderência à especificação.
- [x] Corrigir achados e revalidar documentação.
- [x] Criar commit exclusivo do Gate 2.
- [x] Reportar conclusão à coordenação e bloquear o Gate 3.

A baseline visual v1 foi validada no Gate 2. Sua existência não autoriza
implementação: o Gate 3 depende de nova autorização explícita.

## Gate 3 — frontend estático

### Fundação

- [x] Scaffold Next.js TypeScript existente.
- [x] Definir módulos por feature.
- [x] Criar design tokens e primitivas.
- [x] Criar mocks explícitos e isolados.
- [x] Reler índice, checklist, Gates 1 e 2 e instruções locais do Next.js.
- [x] Registrar pesquisa atual do Gate 3 e revalidar fontes/licenças.
- [x] Configurar lint, typecheck e seams de teste acordados.

### Shell e Inicio

- [x] Sidebar com `Inicio`, `Productos`, `IA` e `Perfil`.
- [x] `Administración` somente no cenário admin.
- [x] `Cerrar sesión` fixo no rodapé.
- [x] Tooltips e nomes acessíveis.
- [x] Rail desktop reduzido a 56 px, sem monograma superior e com navegação
  centralizada nos dois eixos.
- [x] Seletor de idioma no rodapé da sidebar: espanhol padrão, português e
  inglês.
- [x] Padronizar o gatilho de idioma com os demais ícones e dispensar seu
  tooltip ao abrir ou selecionar uma opção.
- [x] Hero cinematográfica com família WebP responsiva por breakpoint.
- [x] Wordmark no topo e conteúdo à esquerda.
- [x] Trilhos horizontais de produtos.
- [x] Cards em proporção editorial.
- [x] Capas da Home exibem somente imagem/placeholder e badge semântico no
  canto superior esquerdo.

### Productos

- [x] Listar todos os produtos mock.
- [x] Diferenciar adquirido e bloqueado.
- [x] Abrir detalhe estático do produto adquirido.
- [x] Abrir modal do produto bloqueado.
- [x] Exibir CTA Perfect Pay simulado e não navegável.
- [x] Criar leitor PDF placeholder embutido.
- [x] Criar download simulado.
- [x] Mostrar painel lateral somente quando houver itens.
- [x] Ocultar comentários quando a flag estiver desligada.
- [x] Detalhes de produto com cabeçalho compacto no topo e título em Bebas
  Neue, preservando leitor, download e painel condicional.

### IA, Perfil e Administración

- [x] Criar chat com identidade própria.
- [x] Criar variante IA bloqueada.
- [x] Adaptar ao design do Oráculo em Relatórios: canvas único, orb, sugestões,
  bubble do membro, resposta da IA, composer e thinking por etapas.
- [x] Simular localmente estados vazio, conversa e pensando, sem API, modelo,
  memória ou persistência.
- [x] Criar perfil estático.
- [x] Criar esqueleto administrativo estático.
- [x] Não realizar qualquer chamada externa.
- [x] Posicionar cabeçalhos de Productos, Perfil e Administración no topo.
- [x] Remover kicker, título e subtítulo externos de `/ia`; manter apenas o
  chat central e o controle de acesso mock.
- [x] Manter `/ia` fixa no viewport, sem rolagem da página; somente o histórico
  interno pode rolar, com scrollbar oculta.

### Qualidade

- [x] Todo texto visível está em espanhol.
- [x] Desktop e mobile inspecionados visualmente.
- [x] Fontes mobile, tablet, desktop e ultra-wide verificadas no navegador.
- [x] WebPs finais inspecionados sem artefatos aparentes em rosto, mãos, vinho e
  gradientes.
- [x] Hero sem preload de imagem indevido; cada breakpoint seleciona sua WebP.
- [x] Evidências confirmadas como PNG real em 1680 × 950 e 390 × 844.
- [x] Reflow a 320 CSS px e resize de texto a 200% verificados.
- [x] Navegação por teclado verificada.
- [x] Modal com focus trap, Escape e retorno de foco.
- [x] Foco não é encoberto por sidebar, dock ou overlays.
- [x] `prefers-reduced-motion` remove deslocamento não essencial.
- [x] Fontes são auto-hospedadas com licenças incluídas.
- [x] Títulos de página usam Bebas Neue empacotada localmente.
- [x] Remover fontes serifadas da interface e aplicar Bebas Neue a títulos,
  destaques editoriais, leitor, painéis e dados de grande escala.
- [x] Botões e selects de todas as telas usam estados, bordas, ícones e foco
  customizados pelo design system.
- [x] Substituir selects nativos do protótipo por listboxes customizadas com
  navegação por setas, Home/End, Escape, retorno de foco e fechamento externo.
- [x] Revisar individualmente controles de Home, Productos, detalhe, modal
  bloqueado, IA, Perfil, Administración e sidebar.
- [x] Estados não dependem apenas de cor.
- [x] Nenhuma imagem, marca, texto ou asset da referência foi copiado.

## Gate 4 — aprovação explícita do frontend

- [ ] Apresentar todas as telas e estados estáticos para revisão.
- [x] Registrar os ajustes solicitados pelo usuário.
- [x] Aplicar e revisar sidebar compacta, idioma, cards da Home, cabeçalhos,
  Bebas Neue, controles e detalhe de produto.
- [x] Revisar todas as rotas e eliminar usos residuais de Bodoni/serif.
- [x] Remover tipo e título duplicados das capas dos cards em `/productos`.
- [x] Deixar a capa do modal bloqueado somente com imagem e remover o rótulo
  técnico de simulação.
- [x] Refatorar `/ia` com a linguagem visual do Oráculo e processamento
  estritamente simulado no navegador.
- [x] Substituir as esferas da IA por coração pulsante no mesmo sistema visual
  dos controles e manter `Nueva conversación` no extremo direito do cabeçalho.
- [x] Corrigir alinhamento e tooltip persistente do seletor de idioma.
- [x] Integrar as cinco capas reais em WebP e substituir o catálogo genérico
  pelos cinco produtos canônicos.
- [x] Exibir capas bloqueadas em preto e branco e com opacidade reduzida,
  restaurando a imagem no hover e no foco por teclado.
- [x] Obter aprovação explícita do frontend.
- [x] Preservar o frontend aprovado em commit próprio antes do backend.

## Gate 5 — backend autorizado

Código, migrações e testes locais estão autorizados. A ativação de fornecedores,
dados reais e o deploy dos serviços de backend ainda dependem de seus gates.

### Identidade e autorização

- [x] Preparar clientes Supabase Auth SSR atrás de feature flag.
- [x] Criar migração inicial de perfis, papéis e RLS.
- [x] Implementar provisionamento e entrega recuperável do convite por outbox.
- [x] Implementar confirmação do convite e definição de senha na UI.
- [x] Implementar recuperação e reset de senha pelo fluxo PKCE.
- [x] Implementar troca de e-mail segura com prova da senha atual, confirmação
  dupla, sincronização do perfil e auditoria sem registrar os endereços.
- [x] Restringir a administração ao proprietário canônico em allowlist privada,
  com validação no BFF, `is_admin()` e RLS. MFA obrigatório foi removido por
  decisão explícita; mutações críticas mantêm reautenticação por senha.
- [x] Implementar Google OAuth por PKCE para contas convidadas, desligado por
  padrão e sem reabrir cadastro público.
- [x] Implementar reautenticação administrativa e controles compensatórios em
  todas as mutações críticas.
  - [x] Limitar atomicamente a cinco provas de senha por janela de 15 minutos,
    bloquear a sexta, devolver `Retry-After` e limpar o limite somente quando a
    reautenticação owner-only é persistida com sucesso.
  - [x] Proteger a publicação de PDF com prova de senha, cookie HttpOnly,
    credencial aleatória hasheada, expiração de cinco minutos, consumo único,
    privilégio mínimo no Storage e auditoria.
  - [x] Remover escrita direta de catálogo, ofertas e prompts; concessão,
    revogação, transferência e publicação de prompt só executam por RPC que
    consome a mesma credencial curta na transação.
  - [x] Conectar painel administrativo real para membros, convites, catálogo,
    ofertas, acessos, compras, conteúdo, prompts e auditoria.

### Catálogo, conteúdo e acesso

- [x] Criar schema inicial de catálogo e ledger de entitlements.
- [x] Conectar Home, catálogo e detalhe ao catálogo ativo e aos entitlements
  da sessão quando `FEATURE_CONTENT=true`.
- [x] Impedir que o estado mock `available` autorize a página de detalhe no
  modo conectado.
- [x] Encaminhar `vuelve_ia` autorizado ao chat, sem tratá-lo como PDF.
- [x] Criar schema inicial de conteúdo e regras de leitura.
- [x] Fazer upload privado validado com tipo, assinatura, parse, páginas,
  tamanho, hash, versão e rollback do objeto em falha de metadados.
- [x] Conectar a publicação do PDF ao módulo `Contenido` do painel
  administrativo atrás de `FEATURE_ADMIN` e `FEATURE_CONTENT`.
- [x] Gerar URL temporária somente para cópia marcada após autorização.
- [x] Implementar fila, geração idempotente e retry da cópia com watermark.
- [x] Conectar o download da UI ao endpoint real atrás de `FEATURE_CONTENT`.
- [x] Agendar as outboxes no Custom Worker sem executar flags desligadas.
- [x] Validar migrations, isolamento entre duas alunas e Storage privado no
  Supabase Cloud. O teste real negou leitura cruzada de perfil/entitlement,
  negou RPC administrativa e negou download/URL assinada para duas contas sem
  autorização; a limpeza terminou com zero usuários e objetos sintéticos.
- [ ] Validar uma geração da VUELVE IA com duas alunas depois da aprovação dos
  gates jurídico, editorial, de orçamento e paging.
- [x] Aplicar as 29 migrações no projeto definitivo e executar as asserções
  pgTAP remotas de segurança, RLS, atomicidade da IA e administração.
- [x] Implementar progresso de leitura controlado pela aluna, persistido por
  produto e protegido por entitlement/RLS.

### Perfect Pay

- [x] Implementar entrada de webhook validada, limitada e idempotente.
- [x] Mapear os produtos `PPPBF7CC`, `PPPBF7E4` e `PPPBF7E7` para Haz Que
  Vuelva, Reconquista 30 e Vuelve IA, aceitando qualquer plano dos três
  produtos sem duplicar entitlement.
- [x] Normalizar `plan_itens` como linhas independentes e exigir mapeamento
  exato `item:<item_code>` para order bumps.
- [x] Cadastrar `PPPBF7EK` para `21_mensajes` e `PPPBF7EL` para `la_otra`
  como mapeamentos exatos `item:<item_code>`.
- [x] Projetar `approved`, `authorized` e `completed` como concessão.
- [x] Projetar `cancelled`, `refunded` e `charged_back` como revogação.
- [x] Implementar deduplicação, reparo da outbox e ordem por ocorrência.
- [x] Implementar retry, dead-letter e reprocessamento idempotente.
- [x] Aceitar BRL, USD e EUR conforme o enum documentado pela Perfect Pay.
- [ ] Validar projeções com fixtures reais redigidas e testes cloud.
- [ ] Confirmar aprovação comercial dos três produtos no painel Perfect Pay.
- [ ] Configurar no painel e provar o pós-compra: Haz Que Vuelva → `/up1`,
  Reconquista 30 → `/up2` e aceite/recusa do VUELVE IA → `/gracias`.
- [ ] Confirmar se existirão downsells; caso existam, cadastrar códigos,
  checkouts e mapeamentos para o mesmo entitlement sem duplicar acesso.

### IA

- [x] Modelar entitlement `vuelve_ia`, créditos, casos e conversas.
- [x] Criar serviço FastAPI privado e contrato SSE.
- [x] Conectar o chat ao BFF e ao SSE somente quando a feature flag estiver
  ativa, preservando o modo visual mock quando desligada.
- [x] Implementar adapters Supabase/Gemini atrás de feature flag desligada.
- [x] Implementar recuperação separada da base global aprovada.
- [x] Implementar recuperação da memória pelo `member_id` autenticado no BFF.
- [x] Restringir recuperação, persistência e RLS pelo `member_id` autenticado.
- [x] Tratar RAG como dado sem autoridade no prompt do provider.
- [x] Versionar, publicar e reverter prompt por RPC administrativa auditada.
- [x] Conectar a gestão de prompts ao painel administrativo, com leitura real,
  rascunho e publicação protegida por proprietário canônico e reautenticação.
- [ ] Permitir que admin defina e publique limites de uso e custo.
- [ ] Gerenciar documentos PDF, TXT, MD, DOC e DOCX.
- [ ] Implementar limites, telemetria e falhas seguras.
  - [x] Aplicar cota diária atômica e teto de 2.048 tokens de saída por geração.
  - [x] Persistir uso real de entrada, saída, cache, pensamento, ferramenta e
    total por geração, sem expor a telemetria privada no SSE.
  - [x] Falhar a ativação sem orçamento diário de tokens e sinalizar no health
    uso acima do teto ou geração concluída sem telemetria válida.
  - [ ] Publicar orçamento, alerta externo e limites administráveis antes de
    ativar as flags.
- [ ] Implementar ciclo de caso, importação, fatos, política, análise,
  validação, retenção e exclusão somente em gates autorizados.
- [ ] Manter controles críticos de acesso, segurança, limite e exclusão fora do
  LLM.

### Privacidade, segurança e auditoria

- [ ] Usar somente dados sintéticos até aprovação do gate jurídico.
- [ ] Versionar consentimentos separados.
- [ ] Manter conversa bruta fora de logs, analytics e suporte por padrão.
- [x] Testar isolamento entre contas para perfil, entitlement e Storage
  privado com duas usuárias sintéticas no Supabase Cloud.
- [ ] Repetir isolamento para casos, conversas, memória e telemetria da VUELVE
  IA quando a geração for deliberadamente habilitada.
- [ ] Testar exclusão em storage, dados derivados, cache, fila e backup.
- [ ] Permitir desligar VUELVE IA sem derrubar a biblioteca.

### Evidência local do Gate 5

- [x] `apps/web`: typecheck, lint, 104 testes e build de produção passam.
- [x] `apps/agent`: Ruff format/check e 20 testes passam em Python 3.12.
- [x] `apps/web` e `apps/marketing`: audit de dependências de produção sem
  vulnerabilidades conhecidas após overrides documentados.
- [ ] Reduzir os três módulos legados do quiz que ultrapassam 400 linhas sem
  alterar a experiência aprovada.
- [x] Criar o projeto definitivo `haz-que-vuelva-members` no Supabase Cloud,
  aplicar as 29 migrações e executar pgTAP/RLS remotamente.
- [x] Aplicar a migration 22 de health da IA depois do primeiro backup. A
  função foi registrada no histórico remoto, `anon` e `authenticated` não
  executam, `service_role` executa e o agregado retornou JSON válido sem uso.
- [x] Fechar cadastro público e login anônimo e cadastrar Site URL e redirects
  de produção no projeto definitivo.
- [x] Criar, promover e convidar o admin inicial pelo comando privado. A outbox
  concluiu o envio via Resend em uma tentativa, sem erro e sem entitlement.
- [x] Validar definição de senha, primeiro login, recuperação de senha e acesso
  owner-only do admin. Google OAuth permanece opcional e bloqueado até
  existirem credenciais próprias.
- [ ] Concluir smoke tests reais de Perfect Pay, Resend e Gemini. O webhook
  rejeita payload autenticado incorretamente, o agente responde health e nega
  credencial inválida, mas compra, convite e geração reais aguardam fixtures ou
  destinatários autorizados.

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
- [x] Publicar canonical, metadata social, sitemap, manifesto, cache de assets e
  headers defensivos do marketing.
- [x] Forçar redirecionamento permanente de HTTP para HTTPS no Worker de
  marketing e comprovar a resposta pública.
- [x] Criar smoke sintético recorrente para a superfície pública do marketing.
- [x] Configurar o checkout real no CTA do quiz.
- [x] Ativar `upsell=true` no checkout principal e comprovar que o
  redirecionador preserva o parâmetro e a atribuição.
- [x] Implementar páginas mobile-first `/up1`, `/up2` e `/gracias`, mantendo
  os links de aceitação externos configuráveis.
- [x] Configurar os checkouts de Reconquista 30 e Diagnóstico VUELVE IA nos
  CTAs de `/up1` e `/up2`.
- [x] Remover afirmações de compra confirmada de acessos diretos a `/up1`,
  `/up2` e `/gracias`; o smoke exige linguagem condicional sem contexto de
  transação verificada.
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
- [x] Configurar Service Binding privado entre BFF e agente e retirar
  `workers.dev`/Preview URL do agente.
- [x] Publicar e validar o rollout de 31/07/2026: marketing e login respondem
  200, health da área de membros responde `ready`, o smoke público passa e o
  endpoint `workers.dev` antigo do agente responde 404. O smoke completo foi
  reexecutado com sucesso após os controles de telemetria e orçamento da IA.
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
- [ ] Testar espanhol, desktop e celular.
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
