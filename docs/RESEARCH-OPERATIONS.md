# Pesquisa e fontes — infraestrutura e operação

> Continuação de [Pesquisa e fontes](RESEARCH.md), com decisões de publicação,
> observabilidade, recuperação e limites operacionais.

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

## Registro de fontes — Gate 5, Auth, OAuth e MFA

Pesquisa realizada em 30 de julho de 2026 via Exa MCP, usando documentação
oficial do Supabase. O backend gratuito do Agent Reach também foi consultado,
mas respondeu `HTTP 429`; nenhuma decisão dependeu desse resultado incompleto.

- [Supabase — cliente SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client):
  documenta clientes browser/server por cookies e recomenda `getClaims()` para
  proteger dados no servidor, sem confiar em `getSession()` nesse limite.
- [Supabase — Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google):
  documenta `signInWithOAuth`, callback autorizado e troca do código PKCE por
  sessão no servidor.
- [Supabase — MFA](https://supabase.com/docs/guides/auth/auth-mfa):
  documenta TOTP, níveis `aal1`/`aal2` e aplicação do nível de garantia também
  por RLS.
- [Supabase — vinculação de identidades](https://supabase.com/docs/guides/auth/auth-identity-linking):
  documenta a vinculação automática de identidades com o mesmo e-mail
  verificado.

Decisão histórica: cadastro público permanece desabilitado. Google OAuth é
opt-in por configuração e serve para contas previamente convidadas; o callback
preserva somente um caminho interno seguro. O requisito `aal2` foi removido em
1 de agosto de 2026. Cada mutação sensível ainda exige a senha, recebe uma
credencial HttpOnly curta e a consome uma única vez dentro da transação
PostgreSQL. A função de consumo valida novamente o proprietário canônico,
impedindo bypass por chamada direta da Data API.

## Registro de fontes — Perfect Pay e Service Binding

Pesquisa realizada em 30 de julho de 2026 nas especificações oficiais
machine-readable dos fornecedores.

- [Perfect Pay — OpenAPI canônico](https://app.perfectpay.com.br/docs/api.json):
  documenta moedas BRL, USD e EUR, os estados do PostBack e `plan_itens` como a
  lista consolidada de itens/order bumps. Cada item possui `item_code`; os
  metadados auxiliares do item não são declarados obrigatórios.
- [Cloudflare — HTTP Service Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/http/):
  documenta a chamada privada entre Workers por `env.BINDING.fetch()`, sem
  resolver uma URL pública.
- [Cloudflare — configuração Wrangler](https://developers.cloudflare.com/workers/wrangler/configuration/):
  documenta `services`, `workers_dev` e `preview_urls`.

Decisão: cada `plan_itens[].item_code` vira um evento isolado com plano
`item:<código>`. Produtos de topo podem usar wildcard de plano; order bumps
exigem correspondência exata para impedir concessão pelo nome ou pela posição.
O parser exige `item_code`, mas tolera a ausência dos campos auxiliares que a
especificação não marca como obrigatórios. O BFF usa um Service Binding para o
agente. Preview URLs permanecem desligadas; `workers.dev` existe somente como
ponte autenticada para Workers AI e backfill. A credencial interna continua
obrigatória nas duas camadas como defesa em profundidade.

## Registro de fontes — Perfect Pay One Click

Pesquisa realizada em 31 de julho de 2026 via Agent Reach/Exa e leitura da
documentação oficial.

- [Perfect Pay — Upsell One Click](https://help.perfectpay.com.br/article/141-upsell-one-click):
  exige configurar no produto a página da oferta e a página de obrigado; para
  encadear uma nova oferta, a página de obrigado aponta para o próximo upsell.
  O checkout principal precisa incluir `upsell=true` para ativar a compra sem
  redigitar os dados.
- [Perfect Pay — área externa](https://help.perfectpay.com.br/article/593-como-cadastrar-meu-produto-na-perfect-pay):
  confirma que a entrega pode usar área de membros externa por webhook.
- [Perfect Pay — Postback/Webhook](https://help.perfectpay.com.br/article/72-como-integrar-via-postback-webhook-com-a-perfect-pay):
  documenta seleção de produtos, eventos, delay e formato do postback.
- [Perfect Pay — API canônica](https://app.perfectpay.com.br/docs/api):
  expõe a API de integração para consulta, não substitui a configuração do
  Upsell One Click no painel.

Decisão: o CTA principal usa `?upsell=true` e o smoke exige que o redirecionador
preserve esse parâmetro e a atribuição. `/up1`, `/up2` e `/gracias` continuam
dependendo da configuração correspondente no painel e de compra real para
provar o encadeamento. O webhook e o Resend permanecem necessários: a própria
Perfect Pay atribui ao produtor a responsabilidade pelo acesso quando a área de
membros é externa.

## Registro de fontes — Cloudflare Browser Insights e CSP

Pesquisa atualizada em 31 de julho de 2026 na documentação oficial da
Cloudflare.

- [Cloudflare Web Analytics — FAQ](https://developers.cloudflare.com/web-analytics/faq/):
  o modo automático injeta o beacon em todas as páginas e subdomínios da zona,
  salvo quando Rules limitam a medição. A própria documentação exige liberar
  `static.cloudflareinsights.com` em `script-src` e `'self'` em `connect-src`
  quando a aplicação usa CSP.
- [Cloudflare Speed — RUM beacon](https://developers.cloudflare.com/speed/observatory/rum-beacon/):
  documenta o beacon RUM associado ao Web Analytics e ao Speed Observatory.
- [Cloudflare Configuration Rules — settings](https://developers.cloudflare.com/rules/configuration-rules/settings/):
  oferece a propriedade `disable_rum=true`, com precedência sobre regras do Web
  Analytics, para desligar a injeção apenas no hostname autenticado.

Decisão recomendada: desativar a injeção automática em
`miembros.hazquevuelva.site`, preservando a CSP restritiva da área autenticada.
Não usar `Cache-Control: public, no-transform` como atalho: além de a própria
Cloudflare explicar que isso impede a injeção, cache público não é adequado
para respostas autenticadas. A alteração de zona continua pendente no painel
Cloudflare; o código não relaxará a CSP para acomodar analytics não essenciais.
O OAuth local do Wrangler conseguiu ler a zona, mas recebeu 403 tanto na API
de RUM quanto na API de Configuration Rules. A execução exige o painel ou um
token com permissão mínima de escrita em Configuration Rules; nenhum segredo
novo deve ser colado no repositório ou nesta conversa.

Atualização operacional em 31 de julho de 2026:

- [Cloudflare Rulesets API — regras](https://developers.cloudflare.com/api/resources/rulesets/subresources/rules/):
  permite criar uma regra individual com `POST` e atualizar somente a regra
  alvo com `PATCH`, evitando substituir regras paralelas da zona.
- [Cloudflare Configuration Rules — criação via API](https://developers.cloudflare.com/rules/configuration-rules/create-api/):
  confirma o ruleset de zona na fase `http_config_settings`, ação
  `set_config` e a necessidade de consultar o entry point antes da mutação.

Decisão: o executor versionado é somente leitura por padrão, valida que o ID
pertence exatamente a `hazquevuelva.site`, exige confirmação vinculada ao
hostname e ao ID da zona e usa operações por regra quando o entry point já
existe. Assim ele não sobrescreve regras existentes. A execução real requer um
API token temporário com `Zone:Read` e `Select Configuration:Write` limitado à
zona HAZ QUE VUELVA; o valor deve existir apenas no ambiente local.

## Registro de fontes — rollback de Workers

- [Cloudflare Workers — Rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/):
  `wrangler rollback <version-id>` cria imediatamente um novo deployment com a
  versão selecionada. Recursos externos vinculados não são revertidos e podem
  impedir ou tornar incompatível um rollback de código.
- [Cloudflare Wrangler — Workers commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/):
  documenta `deployments list`, o UUID opcional e `--message`, que evita prompts
  interativos quando a operação já foi confirmada por automação.

Decisão: o repositório fornece um executor fail-closed que é somente leitura
por padrão, exige confirmação exata para produção e roda o smoke após a troca.

## Registro de fontes — backup e restauração Supabase

- [Supabase — Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore):
  recomenda dumps separados de roles, schema e dados e restauração com
  `ON_ERROR_STOP`, transação única e triggers desabilitados durante a carga.
- [Supabase — Database Backups](https://supabase.com/docs/guides/platform/backups):
  backups do banco não contêm os objetos armazenados pelo Storage API.
- [Supabase — Restore to a new project](https://supabase.com/docs/guides/platform/clone-project):
  em planos elegíveis, restauração para projeto novo replica banco e chave de
  criptografia, mas não Storage, Auth settings, API keys ou Edge Functions.

Decisão: o backup lógico local será cifrado antes de sair do diretório
temporário; restore automatizado é permitido somente em project ref isolado.
Objetos do Storage terão manifesto e recuperação próprios antes da publicação.

## Registro de fontes — observabilidade das filas

- [Cloudflare Workers — Observability](https://developers.cloudflare.com/workers/observability/):
  métricas nativas incluem invocações, erros e duração; logs e traces podem ser
  exportados por OTLP para um destino externo.
- [Cloudflare Workers — Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/):
  mantém histórico das 100 invocações agendadas mais recentes e registra os
  eventos do Cron em Workers Logs.
- [Cloudflare Workers — Errors and exceptions](https://developers.cloudflare.com/workers/observability/errors/):
  exceções não tratadas aparecem como erro de invocação e podem ser filtradas
  nos logs por outcome ou metadata de erro.

Decisão: depois de processar as outboxes, o Cron consulta uma rota interna com
service key e lança erro se houver job morto, atrasado, lock preso ou webhook
sem processamento. Nenhum identificador de cliente entra no erro. O sinal
nativo não substitui paging; o destino externo ainda precisa ser escolhido.

## Registro de fontes — limites e telemetria do Gemini

Pesquisa atualizada em 31 de julho de 2026 na documentação oficial do Google.

- [Gemini API — GenerateContent](https://ai.google.dev/api/generate-content):
  documenta `generationConfig.maxOutputTokens` como limite máximo de tokens da
  resposta candidata e `usageMetadata` na resposta do provedor.
- [Gemini API — Tokens](https://ai.google.dev/api/tokens): documenta os campos
  de consumo do prompt, candidatos, cache, ferramentas, pensamento e total.

Decisão: limitar cada geração a 2.048 tokens de saída e validar o intervalo
configurável entre 256 e 4.096. Uma resposta com telemetria ausente, incompleta
ou negativa falha antes da conclusão transacional, liberando a reserva em vez
de consumir crédito sem contabilização. Os contadores e o modelo são
persistidos em `ai_generations.provider_usage`, mas não são enviados à aluna
no SSE. O cálculo monetário ficará fora do provider e dependerá de preço
versionado, orçamento e alerta ainda pendentes.

Complemento operacional: a ativação da feature exigirá um orçamento diário de
tokens explicitamente configurado. O health interno agrega uma janela móvel de
24 horas e falha quando o teto é alcançado ou quando uma geração concluída não
tem uso válido. Não foi escolhido um número arbitrário: o teto real depende do
volume contratado e precisa ser aprovado antes da ativação. O erro de Cron já
entra na observabilidade do Worker; o destino de paging externo permanece um
gate separado.
