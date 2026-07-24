# HAZ QUE VUELVA — checklist mestre

> Documento vivo e fonte de verdade do progresso.
>
> Estado em 24 de julho de 2026: **Gate 3 autorizado; frontend estático em
> implementação**.
>
> Backend, agente Python, Docker, integrações, migrações, credenciais e deploy
> estão congelados até autorização explícita.

## Sequência obrigatória

- [x] Resolver o checkout correto e versionar o estado inicial.
- [x] Gate 1: consolidar documentação.
- [x] Gate 2: validar system design e design system.
- [x] Gate 3: implementar frontend estático com mocks. **Concluído
  tecnicamente; aguarda aprovação visual.**
- [ ] Gate 4: obter aprovação explícita do frontend.
- [ ] Gate 5: implementar backend em fatias autorizadas.
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

## Produto

- [x] Interface pública inteiramente em espanhol.
- [x] Usar `Productos`, nunca cursos.
- [x] Suportar produto principal, order bumps e upsells.
- [x] Perfis previstos: `admin` e `member`.
- [x] Conteúdo inicial: PDF e anexos.
- [x] Vídeo fora da primeira entrega.
- [x] Comentários condicionados a feature flag e política de moderação.

## Pendências do usuário

- [ ] Confirmar domínio definitivo.
- [ ] Fornecer códigos, preços, nomes e links Perfect Pay.
- [ ] Definir qual produto libera a IA.
- [ ] Entregar conteúdos, capas e documentos de conhecimento.
- [ ] Enviar asset final da hero e arquivos oficiais da marca.
- [x] Definir baseline tipográfica aberta e licenças.
- [ ] Escolher modelo de IA, orçamento e limite de mensagens.
- [ ] Fornecer WhatsApp de suporte.
- [ ] Definir moderação de comentários.

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
- [x] Hero cinematográfica com slot configurável.
- [x] Wordmark no topo e conteúdo à esquerda.
- [x] Trilhos horizontais de produtos.
- [x] Cards em proporção editorial.

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

### IA, Perfil e Administración

- [x] Criar chat com identidade própria.
- [x] Criar variante IA bloqueada.
- [x] Simular estados vazio, pensando, erro e limite.
- [x] Criar perfil estático.
- [x] Criar esqueleto administrativo estático.
- [x] Não realizar qualquer chamada externa.

### Qualidade

- [x] Todo texto visível está em espanhol.
- [x] Desktop e mobile inspecionados visualmente.
- [x] Reflow a 320 CSS px e resize de texto a 200% verificados.
- [x] Navegação por teclado verificada.
- [x] Modal com focus trap, Escape e retorno de foco.
- [x] Foco não é encoberto por sidebar, dock ou overlays.
- [x] `prefers-reduced-motion` remove deslocamento não essencial.
- [x] Fontes são auto-hospedadas com licenças incluídas.
- [x] Estados não dependem apenas de cor.
- [x] Nenhuma imagem, marca, texto ou asset da referência foi copiado.

## Gate 4 — aprovação explícita do frontend

- [ ] Apresentar todas as telas e estados estáticos para revisão.
- [ ] Registrar os ajustes solicitados pelo usuário.
- [ ] Aplicar e revisar os ajustes autorizados.
- [ ] Obter aprovação explícita do frontend.
- [ ] Parar antes de qualquer backend, integração ou infraestrutura.

## Gate 5 — backend futuro

Este gate permanece congelado.

### Identidade e autorização

- [ ] Configurar Supabase Auth SSR.
- [ ] Criar perfis, papéis e RLS.
- [ ] Implementar convite expirável; a aluna define a própria senha.
- [ ] Implementar reset e troca de e-mail segura.
- [ ] Exigir MFA para admin antes da abertura pública.

### Catálogo, conteúdo e acesso

- [ ] Criar catálogo e entitlements.
- [ ] Criar conteúdo e regras de acesso.
- [ ] Fazer upload privado validado.
- [ ] Gerar URL temporária após autorização.
- [ ] Implementar leitura, progresso, download e watermark.

### Perfect Pay

- [ ] Validar webhook e idempotência.
- [ ] Mapear códigos para produtos internos.
- [ ] Conceder somente em `approved`.
- [ ] Revogar em `cancelled`, `refunded` e `charged_back`.
- [ ] Tratar duplicidade e eventos fora de ordem.
- [ ] Auditar e reprocessar com segurança.

### IA

- [ ] Verificar `agent_access` antes de responder.
- [ ] Persistir conversa canônica no Supabase.
- [ ] Recuperar base global aprovada.
- [ ] Recuperar memória exclusiva do membro.
- [ ] Impedir cruzamento entre membros.
- [ ] Tratar RAG como dado sem autoridade.
- [ ] Versionar, publicar e reverter prompt.
- [ ] Permitir que admin defina e publique limites de uso e custo.
- [ ] Gerenciar documentos PDF, TXT, MD, DOC e DOCX.
- [ ] Implementar limites, telemetria e falhas seguras.

## Gate 6 — integrações futuras

- [ ] Criar projetos Supabase próprios.
- [ ] Criar R2 privado e CORS mínimo.
- [ ] Criar Supermemory dedicado.
- [ ] Criar Resend e verificar subdomínio.
- [ ] Usar somente credenciais deste projeto.

## Gate 7 — infraestrutura e lançamento

- [ ] Criar Dockerfiles não-root e Compose.
- [ ] Configurar VPS, firewall, proxy e TLS.
- [ ] Configurar Cloudflare e DNS.
- [ ] Criar backups e testar restauração.
- [ ] Criar logs, métricas e alertas.
- [ ] Validar rollback.
- [ ] Testar autorização por objeto, compra, revogação, download e IA.
- [ ] Testar espanhol, desktop e celular.
- [ ] Criar admin inicial com MFA.

## Critérios finais de aceite

- Compra aprovada libera somente o produto comprado.
- Cancelamento, reembolso e chargeback revogam o acesso correto.
- Um membro não acessa conteúdo, compra, conversa ou memória de outro.
- A IA só atende quem possui a permissão e usa os escopos corretos.
- Administração gerencia conteúdo, permissões, convites e eventos.
- Arquivos permanecem privados e downloads são autorizados.
- Backup, restauração e rollback são verificados antes da venda.
