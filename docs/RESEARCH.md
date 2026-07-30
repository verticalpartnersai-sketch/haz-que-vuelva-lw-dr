# Pesquisa e fontes

## Regra permanente

Antes de uma decisão técnica, integração ou escolha de biblioteca/provedor:

1. Reler `PROJECT-CHECKLIST.md` e os documentos do gate.
2. Pesquisar o fato atual com Exa MCP.
3. Priorizar documentação oficial e fontes primárias.
4. Registrar a fonte no documento técnico e a decisão sustentada.
5. Implementar somente após a pesquisa.
6. Revisar resultado contra checklist, documentação e requisitos.

Pesquisa não substitui leitura do código. Fatos estáveis e triviais não exigem
churn; APIs, segurança, integrações e operação exigem verificação atual.

## Hierarquia de fontes

1. Documentação oficial do fornecedor ou padrão.
2. Especificação primária e repositório oficial.
3. Suporte oficial do fornecedor.
4. Fonte secundária somente quando a primária for insuficiente, com ressalva.

## Pesquisa obrigatória por gate

| Gate | Pesquisa mínima |
|---|---|
| Design system | WCAG atual, fontes/licenças e suporte do navegador necessário |
| Frontend | Documentação local do Next.js instalado e APIs atuais escolhidas |
| Identidade | Supabase Auth, SSR, MFA, RLS e cookies |
| Pagamentos | Perfect Pay webhook, autenticação, payload e estados |
| Arquivos | Supabase Storage, RLS, URLs temporárias e limites |
| E-mail | Resend, domínio, SPF, DKIM, DMARC e limites |
| IA | Gemini, pgvector, isolamento, structured output e limites |
| Infraestrutura | Docker, Hostinger VPS, Cloudflare, TLS, backup e hardening |

Cada gate deve repetir a pesquisa relevante; esta página não congela APIs.

## Registro de fontes — Gate 1

Pesquisa realizada via Exa MCP em 24 de julho de 2026.

### Supabase

- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security):
  sustenta autorização por linha combinada ao Supabase Auth.
- [Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa):
  sustenta exigir `aal2` e aplicar a regra também em backend e RLS.
- [Server-Side Rendering](https://supabase.com/docs/guides/auth/server-side):
  sustenta sessão SSR por cookies; a página informa que `@supabase/ssr` está em
  beta e pode sofrer breaking changes.

Decisão histórica: Auth SSR + RLS permanecem. MFA como gate obrigatório foi
posteriormente removido por decisão explícita e está registrado como risco
aceito no Gate 5.

### Perfect Pay

- [Integração via webhook](https://support.perfectpay.com.br/doc/perfectpay/postback/integracao-via-webhook-com-a-perfect-pay):
  confirma os estados `approved`, `cancelled`, `refunded` e `charged_back`.

Decisão: usar esses estados como contrato de concessão/revogação fornecido pelo
usuário. Autenticação do webhook, identificador idempotente e tratamento de
ordem permanecem `PENDENTE` até pesquisa específica do gate.

### Cloudflare R2

Pesquisa histórica. A decisão de Storage foi substituída por Supabase Storage
no Gate 5.

- [Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/):
  confirma acesso temporário a uma operação e objeto; a URL funciona como
  bearer token até expirar.
- [Configure CORS](https://developers.cloudflare.com/r2/buckets/cors/):
  confirma que uso no navegador exige CORS compatível com origem, método e
  headers.

Decisão: bucket privado, autorização antes da emissão, validade curta e CORS
mínimo. O prazo exato será decidido no gate de arquivos.

### Supermemory

Pesquisa histórica. A decisão de memória/RAG foi substituída por
PostgreSQL/pgvector no Gate 5.

- [Container Tags](https://supermemory.ai/docs/concepts/container-tags):
  confirma isolamento por `containerTag`; API v4 usa o campo singular e o
  plural é legado.
- [User Profiles](https://supermemory.ai/docs/user-profiles):
  confirma recuperação de perfil por `containerTag`.
- [Scoped API Keys](https://supermemory.ai/docs/authentication):
  confirma que chaves podem ser limitadas a um container.

Decisão: escopos global e por membro usam tags determinísticas e chamadas
separadas. Revalidar v4, limites e chaves com escopo no gate de IA.

### Resend

- [Add and verify a domain](https://resend.com/docs/add-a-domain):
  recomenda subdomínio e exige verificação; fornece registros SPF e DKIM.
- [Implementing DMARC](https://resend.com/docs/dashboard/domains/dmarc):
  sustenta adoção gradual de DMARC após SPF e DKIM.

Decisão: usar subdomínio próprio do projeto, verificar SPF/DKIM e endurecer
DMARC gradualmente após observar todos os remetentes legítimos.

### Acessibilidade

- [WCAG 2.2 — Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html):
  exige 4.5:1 para texto normal e 3:1 para texto grande no nível AA.
- [WCAG 2.2 — Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance):
  orienta área equivalente a perímetro de 2 px e mudança de contraste 3:1.
- [WCAG 2.2 — Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum):
  define mínimo AA de 24 × 24 CSS px, com exceções.

Decisão: manter alvo de projeto em 44 × 44 px como margem de usabilidade,
contraste AA para texto e foco visível de 2 px.

## Registro de fontes — Gate 2

Pesquisa realizada via Exa MCP em 24 de julho de 2026. Foram usadas fontes
primárias; a pesquisa não substituiu a leitura integral dos documentos do
repositório.

### Reflow, zoom e espaçamento

- [WCAG 2.2 — Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow):
  exige acesso ao conteúdo e funcionalidade, sem rolagem em dois eixos, na
  largura equivalente a 320 CSS px.
- [WCAG 2.2 — Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text):
  exige resize de texto até 200% sem perda.
- [WCAG 2.2 — Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing):
  exige que overrides de line-height, parágrafo, letras e palavras não causem
  perda de conteúdo ou função.

Decisão: grade content-driven, unidades relativas, ordem DOM preservada e
reflow a 320 CSS px. Trilhos são regiões horizontais deliberadas e contidas; a
página não rola horizontalmente. Texto e controles devem sobreviver a 200% e
aos overrides de espaçamento.

### Contraste e foco

- [WCAG 2.2 — Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast):
  exige 3:1 para informação necessária que identifica controles e estados.
- [WCAG 2.2 — Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html):
  exige no nível AA que conteúdo criado pelo autor não esconda totalmente o
  componente focado.
- [WCAG 2.2 — Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance):
  define no nível AAA requisitos mensuráveis de área e contraste para o
  indicador de foco.

Decisão: borda necessária de controle usa no mínimo 3:1; sidebar, dock e modal
não encobrem foco. O anel de 2 px e mudança de 3:1 permanece como padrão interno
mais forte, mas não será descrito incorretamente como requisito AA.

### Modal, tooltip, teclado e nomes acessíveis

- [ARIA APG — Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/):
  sustenta contenção de Tab, fechamento por Escape, foco inicial contextual,
  `aria-modal`, nome acessível, fundo inerte e retorno ao disparador.
- [WCAG 2.2 — Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus):
  exige que conteúdo adicional seja dispensável, hoverable e persistente.
- [ARIA APG — Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/):
  sustenta foco no disparador e fechamento por Escape.
- [ARIA APG — Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/):
  sustenta ordem previsível e semântica nativa antes de widgets compostos.
- [ARIA APG — Names and Descriptions](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/):
  sustenta nome acessível explícito e alerta que `title`/tooltip não é
  descoberta suficiente sem ponteiro.
- [ARIA APG — Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/):
  documenta a complexidade e os controles necessários quando há rotação.

Decisão: modal segue o padrão APG. Tooltip reforça, mas não substitui nome,
permanece aberto enquanto foco ou ponteiro estiverem no disparador/tooltip e
fecha por Escape. Trilho de produtos é lista horizontal controlada pelo usuário,
sem rotação automática e sem semântica de carousel desnecessária.

### Movimento

- [WCAG 2.2 — Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide):
  exige controle para movimento ou atualização automática não essencial nos
  casos normativos.
- [WCAG 2.2 — Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions):
  recomenda permitir desativar animação não essencial e reconhece
  `prefers-reduced-motion`; este critério é AAA.

Decisão: não usar autoplay, parallax ou movimento contínuo. Transições são
curtas e removidas ou reduzidas sob preferência de movimento reduzido.

### Tipografia e licença

- [Google Fonts — Bodoni Moda](https://fonts.google.com/specimen/Bodoni+Moda):
  descreve uma família display com pesos, itálicos, optical sizes e conjunto
  estendido.
- [Repositório oficial Bodoni](https://github.com/indestructible-type/Bodoni):
  identifica o projeto upstream e a licença SIL Open Font License 1.1.
- [Licença oficial de Bodoni Moda no Google Fonts](https://github.com/google/fonts/blob/main/ofl/bodonimoda/OFL.txt):
  confirma SIL Open Font License 1.1 para a família selecionada.
- [Google Fonts — Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3):
  descreve família criada para funcionar em interfaces.
- [Repositório oficial Google Fonts](https://github.com/google/fonts):
  informa que as famílias são redistribuíveis conforme a licença incluída e
  que cada diretório contém metadados/licença.
- [Licença oficial de Source Sans 3 no Google Fonts](https://github.com/google/fonts/blob/main/ofl/sourcesans3/OFL.txt):
  confirma SIL Open Font License 1.1.
- [Google Fonts para desenvolvedores](https://developers.google.com/fonts):
  informa que as fontes oferecidas possuem licenças open source para uso
  comercial e não comercial.

Decisão histórica do Gate 2, substituída em 26 de julho de 2026: `Bodoni Moda`
para display e `Source Sans 3` para UI/corpo. A pesquisa e as fontes permanecem
registradas para rastreabilidade; a implementação atual não carrega nem usa
Bodoni Moda.

## Registro de fontes — Gate 3

Pesquisa realizada via Exa MCP em 24 de julho de 2026 e complementada pela
documentação local da versão instalada. Não houve escolha de biblioteca de
ícones, modal ou tooltip: os componentes são locais e seguem os contratos já
aprovados.

### Next.js instalado

- Documentação local de Next.js `16.2.11` em
  `apps/web/node_modules/next/dist/docs/01-app`: foram lidos os guias de layouts
  e páginas, Server/Client Components, CSS, fontes locais, `use client` e rotas
  dinâmicas.

Decisão: manter páginas e layout como Server Components; criar limites client
somente para shell mock, trilhos, modal, chat e controles com estado. A rota
`/productos/[slug]` aguarda `params` e usa `generateStaticParams`. CSS global é
importado uma vez no layout e separado por responsabilidade.

### Arquivos e licença das fontes

- [Repositório oficial Google Fonts](https://github.com/google/fonts):
  informa que cada diretório de família contém binários e licença.
- [Bodoni Moda no repositório oficial](https://github.com/google/fonts/tree/main/ofl/bodonimoda):
  contém o variable font e a licença OFL 1.1 da família.
- [Source Sans 3 no repositório oficial](https://github.com/google/fonts/tree/main/ofl/sourcesans3):
  contém o variable font e a licença OFL 1.1 da família.

Decisão histórica do início do Gate 3, substituída em 26 de julho de 2026:
Source Sans 3 continua em `src/assets/fonts` e é carregada com
`next/font/local`; Bebas Neue é empacotada por `@fontsource/bebas-neue`.
Bodoni Moda não é carregada pela aplicação. O navegador não faz requisição de
fonte a terceiro.

## Refinamento visual do Gate 3 — 26 de julho de 2026

### Bebas Neue

- [Google Fonts — Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue):
  identifica a família display e o peso regular.
- [Bebas Neue no repositório oficial Google Fonts](https://github.com/google/fonts/tree/main/ofl/bebasneue):
  contém binário, metadados e licença OFL da família.
- [Fontsource — Bebas Neue](https://fontsource.org/fonts/bebas-neue):
  documenta o pacote usado para empacotar a fonte no bundle da aplicação.

Decisão revisada: títulos de página, títulos editoriais internos, leitor,
painéis e dados de destaque usam Bebas Neue 400 por
`@fontsource/bebas-neue`. Source Sans 3 permanece na interface e na leitura
contínua. Não existe requisição runtime ao Google Fonts nem uso de fonte
serifada no frontend.

## Registro de fontes — Gate 5

Pesquisa realizada via Exa MCP em 27 de julho de 2026, antes da fundação do
backend. Foram priorizadas fontes oficiais.

### Supabase

- [Auth SSR e clientes Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client):
  orienta clientes browser/server separados, refresh por Proxy e uso de
  `getClaims()` para validar identidade; alerta para não autorizar com o objeto
  de `getSession()` lido de cookies.
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security):
  exige RLS em tabelas de schemas expostos e mantém service keys fora do
  navegador.
- [Downloads em buckets privados](https://supabase.com/docs/guides/storage/serving/downloads):
  confirma acesso autenticado ou URL assinada temporária.
- [Busca semântica e pgvector](https://supabase.com/docs/guides/ai/semantic-search):
  sustenta vetores no Postgres e combinação futura com busca por palavras.
- [Auth Admin `generateLink`](https://supabase.com/docs/reference/javascript/auth-admin-generatelink):
  documenta links de convite e recuperação para envio por provedor próprio.
- [Implementação oficial do Supabase Auth](https://github.com/supabase/auth/blob/effd6624/internal/api/mail.go):
  confirma que um novo `invite` cria a identidade e que um novo convite para
  identidade ainda não confirmada rotaciona o token de confirmação.

Decisão: Supabase substitui R2 e Supermemory. Autorização é repetida no BFF e
em RLS; signed URL só é criada depois do entitlement. O Proxy renova sessão,
mas o DAL valida claims e perfil. O provisionamento cria uma identidade
pendente e a outbox gera um convite novo somente no momento do envio; nenhum
link tokenizado é persistido em payload, log ou tabela da aplicação.

### Perfect Pay

- [Webhook oficial](https://support.perfectpay.com.br/doc/perfect-pay/postback/integracao-via-webhook-com-a-perfect-pay):
  documenta token, `code`, produto, plano, `plan_itens` e enums de status.
- [API oficial de vendas](https://support.perfectpay.com.br/doc/perfectpay/perfectpay-api/vendas):
  documenta consulta autenticada, filtros por status e identificador de venda.

Decisão: `approved`, `authorized` e `completed` concedem de modo idempotente;
`cancelled`, `refunded` e `charged_back` revogam o grant correspondente.
Entrada persiste dados mínimos e enfileira projeção. A documentação não prova
como order bumps reais desta conta aparecerão; nenhum mapping será ativado sem
payloads redigidos e IDs reais.

### Gemini

- [Modelos Gemini](https://ai.google.dev/gemini-api/docs/models):
  lista `gemini-3.6-flash` como modelo estável.
- [Gemini 3.6 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash):
  confirma thinking e structured outputs.
- [Embeddings](https://ai.google.dev/gemini-api/docs/embeddings):
  lista `gemini-embedding-2` estável e recomenda 768, 1536 ou 3072 dimensões.
- [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output):
  confirma JSON Schema e streaming de saída estruturada.
- [REST `generateContent`](https://ai.google.dev/api/generate-content):
  confirma que a configuração REST usa `responseMimeType` e
  `responseSchema` dentro de `generationConfig`.

Decisão: geração `gemini-3.6-flash`, embeddings
`gemini-embedding-2`/768 e validação Pydantic. O adapter usa o contrato REST
oficial e permanece desligado até chave, orçamento, política de dados e testes
de falha. `generateContent` não recebe retry automático: sem idempotency key
documentada, uma repetição após falha ambígua pode duplicar custo.

### Resend

- [Idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys):
  confirma suporte em envio, validade de 24 horas e limite de 256 caracteres.
- [Domínios](https://resend.com/docs/dashboard/domains):
  exige domínio verificado e recomenda subdomínio para isolar reputação.

Decisão: e-mail sai por outbox própria e usa também idempotency key do Resend.
Domínio, remetente e smoke test continuam pendentes.

### Risco aceito — MFA administrativo

O usuário decidiu que MFA não será gate obrigatório do primeiro release. Isso
reduz a segurança de contas administrativas e não é equivalente a
reautenticação. Controles compensatórios previstos: sessão admin curta,
reautenticação em mutações críticas, rate limiting, privilégio mínimo e
auditoria append-only. A decisão deve ser revisitada antes de produção.

- [Supabase SSR para Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework):
  orienta usar o cliente de servidor com cookies e `getClaims` para proteger
  páginas e dados.
- [Supabase Auth no servidor](https://supabase.com/docs/reference/javascript/auth):
  documenta cliente sem persistência nem refresh automático para operações de
  autenticação isoladas no servidor e os rate limits do Auth.

Decisão: a senha administrativa é verificada em um cliente Auth isolado, sem
persistir a nova sessão. Após sucesso, somente o BFF com chave secreta registra
um token aleatório de 256 bits. O navegador recebe o valor em cookie HttpOnly,
`SameSite=Strict`; o banco guarda apenas SHA-256 por cinco minutos e o consome
na mesma transação da mutação. A sessão admin autenticada não recebe permissão
para criar essa autorização diretamente. O mesmo token é obrigatório para
publicar PDF, conceder ou revogar acesso, transferir compra e criar ou publicar
prompt. Catálogo, ofertas e prompts não aceitam mais DML direto da sessão
autenticada; módulos ainda sem BFF conectado permanecem fechados.

### Troca segura de e-mail

- [Supabase Auth — `updateUser`](https://supabase.com/docs/reference/javascript/auth-updateuser):
  documenta a alteração de e-mail da identidade autenticada.
- [Supabase CLI — `double_confirm_changes`](https://supabase.com/docs/guides/local-development/cli/config#auth-email-double-confirm-changes):
  confirma que o modo seguro exige confirmação nos endereços antigo e novo.
- [Supabase — templates de e-mail](https://supabase.com/docs/guides/auth/auth-email-templates):
  documenta o template de troca e a notificação de endereço alterado.

Decisão: o BFF confirma a senha atual antes de pedir `updateUser`, usa redirect
permitido para o callback PKCE e nunca atualiza `profiles.email` antecipadamente.
Um trigger em `auth.users` sincroniza o perfil somente após o Auth efetivar a
mudança e registra auditoria sem duplicar o endereço antigo ou novo no log.

### Iconografia

- [Phosphor Icons — repositório oficial React](https://github.com/phosphor-icons/react):
  documenta o pacote React, pesos e uso por componente.
- [Pacote oficial `@phosphor-icons/react`](https://www.npmjs.com/package/@phosphor-icons/react):
  confirma o pacote atual e sua distribuição.

Decisão: substituir desenhos de ícone locais por Phosphor Icons através de um
mapa interno tipado. A aplicação importa o entrypoint SSR e expõe apenas os
ícones necessários a navegação, controles, badges e placeholders.

### Dependências de build e imagem

- [PostCSS GHSA-6g55-p6wh-862q](https://github.com/postcss/postcss/security/advisories/GHSA-6g55-p6wh-862q):
  corrige leitura arbitrária de arquivo nas versões atuais da série 8.5.
- [Sharp GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj):
  versões anteriores a 0.35.0 herdam vulnerabilidades do libvips; a fonte
  recomenda a versão 0.35.3.
- [Issue oficial do Next.js sobre Sharp](https://github.com/vercel/next.js/issues/96064):
  registra o transitivo vulnerável no Next 16.2 e o uso de override como
  mitigação enquanto o pacote estável não eleva a dependência.

Decisão: `apps/web` e `apps/marketing` usam Next 16.2.12 e overrides exatos
`postcss@8.5.23` e `sharp@0.35.3`. Builds passam e o otimizador de imagem foi
exercitado em runtime com resposta 200. `npm audit --omit=dev` retorna zero
vulnerabilidades nos dois apps. O audit completo ainda aponta advisories
somente na cadeia de ferramentas do `eslint-config-next`; não foi aplicado o
downgrade incorreto sugerido pelo npm.

## Registro de fontes — Gate 7

Pesquisa realizada em 30 de julho de 2026. A consulta Exa MCP foi tentada
primeiro, mas expirou sem resposta; a decisão foi então verificada diretamente
nas documentações oficiais do Cloudflare, OpenNext e Next.js.

### Next.js no Cloudflare

- [Cloudflare — Next.js no Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/):
  confirma OpenNext como adaptador, App Router, SSR, streaming, middleware,
  otimização de imagens e preview no runtime `workerd`. A mesma matriz informa
  que Node.js Middleware ainda não é suportado.
- [OpenNext — configuração de app existente](https://opennext.js.org/cloudflare/get-started):
  documenta `wrangler.jsonc`, `open-next.config.ts`, `.dev.vars`, scripts,
  cache de assets e `.open-next` ignorado.
- [Next.js 16 — guia de atualização](https://nextjs.org/docs/app/guides/upgrading/version-16):
  documenta a preferência por `proxy.ts` e a depreciação de `middleware.ts`.

Decisão: publicar `apps/marketing` e `apps/web` como Workers separados com
OpenNext `1.20.2` e Wrangler `4.115.0`. A área de membros usa
`middleware.ts` como exceção consciente para permanecer no Edge Runtime;
autorização continua no DAL e no RLS. Migrar de volta para `proxy.ts` somente
quando Node.js Middleware estiver suportado pelo adaptador.

### Cloudflare Containers

- [Cloudflare Containers — getting started](https://developers.cloudflare.com/containers/get-started/):
  confirma Dockerfile/imagem, arquitetura `linux/amd64`, Durable Object com
  `new_sqlite_classes`, `defaultPort`, `sleepAfter` e `envVars`.
- [Containers — variáveis e segredos](https://developers.cloudflare.com/containers/examples/env-vars-and-secrets/):
  confirma que bindings do Worker podem ser repassados ao contêiner por
  `envVars`.

Decisão: preservar FastAPI em um Container gerenciado por Worker e Durable
Object. O Worker expõe somente health e geração, valida o segredo antes de
iniciar o contêiner e mantém geração desligada. O build real da imagem permanece
pendente porque Docker não está instalado na máquina atual.

### Monorepo e CI/CD

- [Workers Builds — monorepos](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/):
  orienta conectar cada Worker ao mesmo repositório e configurar root directory,
  build/deploy próprios e watch paths.
- [Workers Builds — watch paths](https://developers.cloudflare.com/workers/ci-cd/builds/build-watch-paths/):
  documenta includes/excludes para evitar builds de apps não afetados.

Decisão: três projetos Cloudflare, com raízes `apps/marketing`, `apps/web` e
`apps/agent`. A primeira publicação deve criar versões/Preview URLs sem domínio
customizado. Domínio e tráfego entram somente após smoke test e rollback
verificados. A configuração completa está em
[Publicação no Cloudflare](CLOUDFLARE-DEPLOYMENT.md).

### Domínio customizado do Worker

- [Cloudflare — Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/):
  documenta `routes[].custom_domain=true` e confirma que o Cloudflare cria o
  registro DNS e emite o certificado quando o Worker é a origem do hostname.

Decisão e prova em 30 de julho de 2026: `hazquevuelva.site` foi vinculado
diretamente ao Worker `haz-que-vuelva-marketing`. A publicação gerou a versão
`1ce98941-9cd2-4746-9fff-e6b30305914c`. O DNS público retornou endereços
Cloudflare, `/` respondeu `307` para `/quiz`, `/quiz` respondeu `200`, áudio e
WebP responderam `200`, e o fluxo completo foi percorrido em navegador real. A
página final aprovada foi confirmada sem badge de preview e com CTA computado em
`rgb(88, 229, 141)`. O checkout continua pendente porque a URL comercial ainda
não foi fornecida.

### Dependência transitiva do OpenNext

`@opennextjs/cloudflare@1.20.2` depende de `@node-minify/core@8.0.6`, cuja faixa
antiga aceita versões vulneráveis de `glob`. Atualizar o pacote core inteiro
para 9 ou 10 quebra interfaces consumidas pelo OpenNext. A mitigação compatível
fixa somente `glob@12.0.0` dentro de `@node-minify/core`. Build OpenNext e audit
de produção passaram nos dois apps. O audit completo ainda mantém nove
advisories altos exclusivamente na cadeia de lint já documentada.

### Metadata, descoberta e compartilhamento

- [Next.js — Metadata e imagens Open Graph](https://nextjs.org/docs/app/getting-started/metadata-and-og-images):
  documenta metadata configurável, arquivos de ícone, Open Graph, robots e
  sitemap no App Router.
- [Next.js — `generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata):
  documenta `metadataBase`, canonical, Open Graph, Twitter e regras para
  crawlers.

Decisão: o quiz declara canonical absoluto, metadata localizada, Open Graph,
Twitter Card, robots, sitemap e manifesto. A imagem social é um JPEG progressivo
1200 × 630 de 47 KB produzido a partir dos assets aprovados do próprio quiz.

### Headers defensivos

- [Next.js — configuração `headers`](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers):
  documenta headers de resposta associados a padrões de rota.
- [MDN — cabeçalhos HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers):
  documenta HSTS, `X-Content-Type-Options`, `Permissions-Policy` e os demais
  controles de navegador usados.

Decisão: respostas do marketing recebem HSTS, bloqueio de MIME sniffing,
negação de framing, referrer policy restritiva e desativação de câmera,
geolocalização e microfone. CSP não foi adicionada sem nonces porque uma policy
incompleta quebraria scripts inline do Next.js e não seria um controle real.
O deploy inicial comprovou que os headers do `next.config` não chegavam à
resposta SSR transformada pelo adaptador. Foi adotado o
[Custom Worker oficial do OpenNext](https://opennext.js.org/cloudflare/howtos/custom-worker)
como entrypoint, reutilizando o handler gerado e endurecendo sua resposta. Os
assets continuam no binding estático, com cache e `nosniff` definidos por
`_headers`.

### Integração contínua no GitHub

- [GitHub — build e teste de Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs):
  recomenda `setup-node`, instalação determinística com `npm ci` e execução dos
  scripts reais de build/teste.

Decisão: todo push em `main` e pull request valida marketing, área de membros,
Worker do agente e serviço Python. O workflow usa Node 22, Python 3.12, caches
por lockfile, permissões somente de leitura e concorrência cancelável. Deploy
permanece separado do CI para não conceder credenciais de produção ao GitHub
antes da conexão deliberada do Workers Builds.

## Registro de fontes — Gate 5, cópia individual de conteúdo

Pesquisa realizada em 30 de julho de 2026. O backend Exa do `agent-reach` foi
consultado primeiro, mas retornou `HTTP 429` por limite gratuito. As decisões
abaixo foram então verificadas diretamente nas fontes oficiais.

### Supabase Storage privado

- [Supabase — upload com JavaScript](https://supabase.com/docs/reference/javascript/file-buckets-upload):
  documenta upload de `ArrayBuffer`, `contentType` explícito e a opção `upsert`.
- [Supabase — downloads e buckets privados](https://supabase.com/docs/guides/storage/serving/downloads):
  confirma que objetos privados não possuem URL pública e devem ser servidos
  por download autenticado ou URL assinada.
- [Supabase — standard uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads):
  recomenda upload padrão para arquivos de até 6 MB e TUS para arquivos
  maiores, embora o endpoint aceite arquivos maiores.

Decisão: o arquivo-fonte permanece em `product-content`; somente a cópia
individual final entra em `member-sensitive`. O worker usa a chave de serviço,
grava em caminho determinístico por membro e arquivo, e o navegador recebe
apenas uma URL assinada curta depois que a linha de auditoria existe. O fluxo
rejeita fontes que não sejam PDF e limita o tamanho processado no Worker para
não transformar uma requisição em consumo de memória sem limite.

Para a publicação administrativa, o navegador envia `multipart/form-data` ao
BFF autenticado. O BFF rejeita origem divergente, MIME, assinatura, parse,
criptografia, contagem de páginas e tamanho inválidos antes do upload. A
chamada padrão grava `ArrayBuffer` com `upsert=false`; a RPC versiona os
metadados e audita a ação. Se a RPC falhar, o BFF remove o objeto recém-criado.
O limite operacional de 12 MiB é mais alto que a faixa recomendada de 6 MB
para upload padrão pelo Supabase; por isso precisa ser medido com o PDF real
em homologação antes de ativar a feature.

### Mutação do PDF

- [`pdf-lib` — `PDFDocument`](https://pdf-lib.js.org/docs/api/classes/pdfdocument):
  documenta `load` a partir de `Uint8Array`/`ArrayBuffer`, desenho em páginas e
  `save` para `Uint8Array`.
- [`pdf-lib` — repositório oficial](https://github.com/Hopding/pdf-lib):
  confirma execução em ambientes JavaScript, modificação de PDFs existentes e
  uso do pacote publicado no npm.

Decisão: usar `pdf-lib` atrás de um port de aplicação, sem acoplar domínio ou
orquestração ao pacote. A marca visível contém somente `HAZ QUE VUELVA` e um
identificador opaco; e-mail ou nome da cliente não são impressos no arquivo. A
mesma marca é salva em `watermarked_files` e `download_events` para auditoria.

### Limites do Cloudflare Worker

- [Cloudflare Workers — limites](https://developers.cloudflare.com/workers/platform/limits/):
  documenta 128 MB de memória por isolate, CPU de 10 ms no plano gratuito e até
  5 minutos no plano pago, além de recomendar mover processamento pesado para
  outro mecanismo quando necessário.
- [OpenNext — Custom Worker](https://opennext.js.org/cloudflare/howtos/custom-worker):
  documenta a reutilização do handler gerado junto de um handler `scheduled`.
- [Cloudflare — Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/):
  documenta `scheduled()`, a configuração `triggers.crons` no Wrangler e o
  endpoint local de teste do evento.

Decisão: a geração nunca ocorre na requisição pública de download. O acesso
enfileira uma operação idempotente e retorna estado pendente; uma rota interna,
protegida por segredo, processa lotes unitários. O lote pequeno e os limites de
tamanho/páginas protegem o Worker. Antes da ativação real, a conta deverá usar
plano compatível com processamento de PDF ou o mesmo port deverá ser conectado
a um worker dedicado com mais memória; a entrega jamais deve cair para o PDF
original sem marca. O Worker customizado da área de membros chama as outboxes a
cada minuto e não faz chamadas quando a feature ou as credenciais associadas
estão desligadas.
