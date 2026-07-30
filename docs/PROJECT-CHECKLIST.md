# HAZ QUE VUELVA — checklist mestre

> Documento vivo e fonte de verdade do progresso.
>
> Estado em 30 de julho de 2026: **frontend aprovado; marketing publicado;
> Gate 5 autorizado e em implementação incremental**.
>
> A área de membros, o agente e as integrações externas reais continuam
> bloqueados até seus pré-requisitos e gates próprios.

## Sequência obrigatória

- [x] Resolver o checkout correto e versionar o estado inicial.
- [x] Gate 1: consolidar documentação.
- [x] Gate 2: validar system design e design system.
- [x] Gate 3: implementar frontend estático com mocks.
- [x] Gate 4: obter aprovação explícita do frontend.
- [ ] Gate 5: implementar backend em fatias autorizadas. **Em andamento.**
- [ ] Gate 6: integrar fornecedores.
- [ ] Gate 7: infraestrutura, segurança operacional e lançamento.

Nenhum gate pode começar antes da conclusão registrada do anterior.

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
- [ ] Fornecer códigos, preços, nomes e links Perfect Pay.
- [x] Definir `vuelve_ia` como entitlement canônico da IA.
- [ ] Entregar conteúdos, capas e documentos de conhecimento.
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
- [x] Exigir MFA TOTP `aal2` para administração no BFF, nas políticas
  restritivas e nas RPCs sensíveis.
- [x] Implementar Google OAuth por PKCE para contas convidadas, desligado por
  padrão e sem reabrir cadastro público.
- [x] Implementar reautenticação administrativa e controles compensatórios em
  todas as mutações críticas.
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
- [ ] Validar migration, storage e geração com duas alunas no Supabase cloud.
- [x] Implementar progresso de leitura controlado pela aluna, persistido por
  produto e protegido por entitlement/RLS.

### Perfect Pay

- [x] Implementar entrada de webhook validada, limitada e idempotente.
- [ ] Mapear códigos reais para produtos internos após fixtures da conta.
- [x] Projetar `approved`, `authorized` e `completed` como concessão.
- [x] Projetar `cancelled`, `refunded` e `charged_back` como revogação.
- [x] Implementar deduplicação, reparo da outbox e ordem por ocorrência.
- [x] Implementar retry, dead-letter e reprocessamento idempotente.
- [ ] Validar projeções com fixtures reais redigidas e testes cloud.

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
  rascunho e publicação protegida por admin AAL2 e reautenticação.
- [ ] Permitir que admin defina e publique limites de uso e custo.
- [ ] Gerenciar documentos PDF, TXT, MD, DOC e DOCX.
- [ ] Implementar limites, telemetria e falhas seguras.
- [ ] Implementar ciclo de caso, importação, fatos, política, análise,
  validação, retenção e exclusão somente em gates autorizados.
- [ ] Manter controles críticos de acesso, segurança, limite e exclusão fora do
  LLM.

### Privacidade, segurança e auditoria

- [ ] Usar somente dados sintéticos até aprovação do gate jurídico.
- [ ] Versionar consentimentos separados.
- [ ] Manter conversa bruta fora de logs, analytics e suporte por padrão.
- [ ] Testar isolamento entre contas e casos.
- [ ] Testar exclusão em storage, dados derivados, cache, fila e backup.
- [ ] Permitir desligar VUELVE IA sem derrubar a biblioteca.

### Evidência local do Gate 5

- [x] `apps/web`: typecheck, lint, 54 testes e build de produção passam.
- [x] `apps/agent`: Ruff format/check e 12 testes passam em Python 3.12.
- [x] `apps/web` e `apps/marketing`: audit de dependências de produção sem
  vulnerabilidades conhecidas após overrides documentados.
- [x] Arquivos manuscritos novos permanecem abaixo do máximo de 400 linhas.
- [ ] Criar o projeto definitivo `haz-que-vuelva-members` no Supabase Cloud,
  aplicar migrações e executar pgTAP/RLS remotamente. O banco local não faz
  parte do gate. Bloqueado até a criação faturável do projeto ser autorizada.
- [ ] Executar smoke tests reais de Perfect Pay, Resend e Gemini. Bloqueado
  até existirem contas, credenciais, mappings e autorização do gate de
  integração.

## Gate 6 — integrações futuras

- [ ] Criar projetos Supabase próprios.
- [ ] Aplicar e validar Supabase Storage privado.
- [ ] Aplicar e validar RAG no PostgreSQL/pgvector.
- [ ] Criar Resend e verificar subdomínio.
- [ ] Criar projeto/chave Gemini próprios.
- [ ] Usar somente credenciais deste projeto.

## Gate 7 — infraestrutura e lançamento

- [x] Preparar Workers OpenNext de marketing e área de membros.
- [x] Validar build, bundle, dry-run e preview local dos dois Workers.
- [x] Criar Dockerfile não-root e Worker/Container do agente.
- [x] Validar typecheck e dry-run estático do agente.
- [ ] Construir e executar a imagem do agente para `linux/amd64`.
- [ ] Confirmar plano Cloudflare compatível com Containers.
- [x] Publicar `haz-que-vuelva-marketing` na conta correta.
- [x] Conectar DNS/TLS de `hazquevuelva.site`.
- [x] Validar em produção `/`, `/quiz`, imagens, áudio, idiomas e fluxo completo.
- [x] Iniciar o áudio no mesmo gesto do CTA inicial, manter loop e preservar o
  controle manual no cabeçalho.
- [x] Configurar CI de marketing, membros e agente no GitHub e comprovar os
  quatro jobs verdes.
- [x] Publicar canonical, metadata social, sitemap, manifesto, cache de assets e
  headers defensivos do marketing.
- [x] Forçar redirecionamento permanente de HTTP para HTTPS no Worker de
  marketing e comprovar a resposta pública.
- [x] Criar smoke sintético recorrente para a superfície pública do marketing.
- [ ] Configurar o checkout real no CTA do quiz.
- [ ] Conectar Workers Builds do marketing ao GitHub.
- [x] Criar o Worker da área de membros e versionar o contrato de variáveis,
  segredos obrigatórios e domínio exclusivo de produção.
- [ ] Cadastrar os valores reais das variáveis e segredos no Worker da área de
  membros. O inventário remoto continua vazio.
- [ ] Executar smoke tests remotos da área de membros sem domínio customizado.
- [ ] Configurar Service Binding privado entre BFF e agente.
- [ ] Conectar Cloudflare DNS/TLS a `miembros.hazquevuelva.site`.
- [ ] Criar backups e testar restauração.
- [ ] Criar logs, métricas e alertas.
- [ ] Validar rollback.
- [ ] Testar autorização por objeto, compra, revogação, download e IA.
- [ ] Testar espanhol, desktop e celular.
- [ ] Criar admin inicial pelo comando privado e revisar novamente a decisão
  de MFA antes da abertura pública.
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
