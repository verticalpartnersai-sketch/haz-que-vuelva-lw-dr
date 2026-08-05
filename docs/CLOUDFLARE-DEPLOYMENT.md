# Publicação no Cloudflare

> Smoke remoto, histórico de versões, rollback e pendências operacionais ficam
> na [continuação operacional](CLOUDFLARE-DEPLOYMENT-OPERATIONS.md).

## Estado

O site público e o quiz estão em produção no Worker
`haz-que-vuelva-marketing`.

O domínio customizado `hazquevuelva.site`, seu DNS e seu certificado TLS foram
criados pelo Cloudflare. Requisições HTTP são redirecionadas permanentemente
para HTTPS no Worker.

Em 30/07/2026, a área de membros foi publicada no domínio
`miembros.hazquevuelva.site` e o Container da VUELVE IA foi criado. O Supabase
Auth usa esse domínio como Site URL, permite somente callbacks explícitos,
mantém cadastro público fechado e restringe a administração ao proprietário
canônico, sem MFA obrigatório.

## Topologia escolhida

```mermaid
flowchart TD
  Visitor["Visitante"] --> Marketing["Worker haz-que-vuelva-marketing"]
  Member["Membro"] --> Web["Worker haz-que-vuelva-members"]
  Marketing --> Checkout["Checkout externo"]
  Web --> Supabase["Supabase Auth, Postgres e Storage"]
  Web --> Providers["Perfect Pay e Resend"]
  Web --> AgentEdge["Worker haz-que-vuelva-agent"]
  AgentEdge --> Container["Container FastAPI VUELVE IA"]
  Container --> Gemini["Gemini"]
  Container --> Supabase
```

- `apps/marketing` e `apps/web` usam Next.js no Workers Runtime por meio do
  OpenNext.
- `apps/agent` mantém a aplicação FastAPI existente em um Cloudflare Container.
  Um Worker pequeno valida rota e credencial antes de encaminhar a requisição.
- A infraestrutura privada da VUELVE IA está publicada, mas a geração permanece
  desligada por flag até o smoke real e o gate jurídico. BFF e Worker exigem o
  mesmo segredo interno; o banco aplica entitlement e cota.
- Supabase permanece como autoridade de identidade, dados, RLS, arquivos e
  memória vetorial.
- Não há motivo técnico para colocar os dois apps Next.js em Cloudflare Pages;
  a integração atual recomendada para Next.js full-stack é Workers + OpenNext.

## Aplicações e domínios

| Aplicação | Worker | Domínio | Estado |
|---|---|---|---|
| Marketing e quiz | `haz-que-vuelva-marketing` | `hazquevuelva.site` | produção |
| Área de membros e BFF | `haz-que-vuelva-members` | `miembros.hazquevuelva.site` | produção; login obrigatório |
| VUELVE IA | `haz-que-vuelva-agent` | sem rota pública | Container acessível somente pelo Service Binding |

Marketing e agente não expõem `workers.dev` nem Preview URL. O BFF chama o
agente por Service Binding; BFF, Worker do agente e FastAPI continuam exigindo
entitlement, cota e a credencial interna. O binding privado reduz superfície de
rede, mas não substitui autenticação entre serviços.

O GitHub executa CI em todo push de `main` e pull request. O run
[`30555070298`](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/actions/runs/30555070298)
validou os quatro jobs: marketing, área de membros, Worker do agente e agente
Python. A promoção do Worker continua deliberadamente separada do CI enquanto
Workers Builds não estiver conectado com suas permissões próprias.

Os deploys continuam manuais. A área de membros declara o ambiente
`production` e usa `wrangler deploy --env production`; marketing e agente não
possuem esse ambiente e devem usar `wrangler deploy` sem `--env production`.

O workflow `Production smoke` executa a cada 30 minutos e também sob demanda.
Ele valida o redirecionamento HTTPS, quiz, upsells, checkouts, headers
defensivos, metadata, assets críticos, login obrigatório e health da área de
membros. O teste de credencial Perfect Pay usa o probe
`x-hqv-auth-probe: 1`: mesmo se a autenticação regredir, a requisição não
projeta compra, acesso ou e-mail. Falhas ficam registradas no GitHub Actions;
o workflow abre ou atualiza um incidente persistente nas Issues e o encerra
automaticamente após a recuperação. O ciclo foi exercitado em 31 de julho de
2026: [criação](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/actions/runs/30666452244),
[atualização sem duplicata](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/actions/runs/30666526841)
e [recuperação](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/actions/runs/30666587531)
foram registradas na [Issue 1](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/issues/1).
Um canal de paging fora do GitHub ainda deve ser definido antes de escalar
tráfego.

O Browser Insights automático da zona tenta carregar o beacon do Cloudflare na
área de membros, mas a CSP deliberadamente restrita o bloqueia. Isso não quebra
o login. Antes de alterar a CSP, decidir se a telemetria é necessária e quais
dados poderão sair; caso contrário, desativar o Browser Insights para esse
host.

O executor canônico para a decisão aprovada é:

```bash
CLOUDFLARE_API_TOKEN='definido somente no shell local' \
CLOUDFLARE_ZONE_ID='<zone-id>' \
npm run cloudflare:rum
```

O comando é somente leitura por padrão. Ele valida o nome exato da zona e
mostra se criará, anexará ou reparará exclusivamente a regra com ref estável
`hqv_disable_members_rum`. Para executar, usar um token temporário limitado à
zona com leitura da zona e escrita de Select Configuration, definir a
confirmação exata exibida pelo plano e acrescentar `-- --execute`. Nunca colar
o token em chat, documentação, `.env` versionado ou histórico do shell.

O input manual `exercise_incident` força uma falha somente depois que o smoke
real termina com sucesso. Ele existe para provar criação, atualização e
encerramento do incidente sem falsificar indisponibilidade da aplicação.

## Artefatos versionados

### Marketing e área de membros

Cada app possui:

- `wrangler.jsonc`;
- `open-next.config.ts`;
- scripts de build, preview, upload e deploy;
- cache imutável para `/_next/static/*`;
- binding de Assets;
- binding de Cloudflare Images;
- observabilidade habilitada;
- `.dev.vars.example` sem credenciais.

`apps/web/src/middleware.ts` permanece intencionalmente no Edge Runtime. O
Next.js 16 prefere `proxy.ts`, mas o adaptador Cloudflare ainda não suporta
Node.js Middleware. Essa camada faz apenas refresh/redirect otimista; a
autorização real continua no DAL e no RLS.

### Agente

O agente possui:

- Dockerfile Python 3.12 não-root;
- Worker TypeScript de borda;
- Durable Object que administra o ciclo de vida do Container;
- health check interno em `/health`;
- allowlist de rota para `POST /v1/generations/stream`;
- comparação de credencial em tempo constante no Worker e novamente no
  FastAPI;
- `FEATURE_GENERATION=false` por padrão na publicação;
- limite de três instâncias `lite`.

O contêiner precisa ser construído para `linux/amd64`. Cloudflare Containers
exige plano compatível e deve ter custo e limites confirmados antes de
produção.

## Versões fixadas

| Dependência | Versão |
|---|---|
| Node.js | `>=22.0.0` |
| Next.js | `16.2.12` |
| `@opennextjs/cloudflare` | `1.20.2` |
| Wrangler | `4.115.0` |
| `@cloudflare/containers` | `0.3.7` |
| Python do agente | `3.12` |

A `compatibility_date` está fixada em `2026-07-29`, a data mais recente aceita
pelo `workerd` empacotado no Wrangler validado localmente.

## Configuração do Workers Builds

Conectar o mesmo repositório três vezes, uma para cada Worker.

### Marketing

- Root directory: `apps/marketing`
- Build command: `npm ci && npm run build:cloudflare`
- Deploy command: `npx wrangler deploy`
- Include paths: `apps/marketing/*`

### Área de membros

- Root directory: `apps/web`
- Build command: `npm ci && npm run build:cloudflare`
- Deploy command: `npx wrangler deploy --env production`
- Include paths: `apps/web/*`, `supabase/*`

### Agente

- Root directory: `apps/agent`
- Build command: `npm ci && npm run typecheck`
- Deploy command: `npx wrangler deploy`
- Include paths: `apps/agent/*`

O build deve usar Node 22. Mudanças que alterem contratos compartilhados ainda
devem disparar manualmente todos os consumidores até existir um workspace
compartilhado explícito.

## Variáveis e segredos

Não colocar valores reais em `wrangler.jsonc`, GitHub, arquivos `.env`,
comentários ou documentação.

### Marketing

O checkout do produto principal está versionado no módulo de configuração do
quiz. Os checkouts de Reconquista 30 e Diagnóstico VUELVE IA são injetados no
build por `NEXT_PUBLIC_UPSELL_1_ACCEPT_URL` e
`NEXT_PUBLIC_UPSELL_2_ACCEPT_URL`. Os checkouts dos downsells serão injetados
por `NEXT_PUBLIC_DOWNSELL_1_ACCEPT_URL` e
`NEXT_PUBLIC_DOWNSELL_2_ACCEPT_URL` depois da aprovação comercial; até lá, os
aceites de `/d1` e `/d2` permanecem sem cobrança. O smoke deve confirmar que
as URLs publicadas e seus redirecionadores preservam parâmetros de atribuição.

### Área de membros

Variáveis:

- `MEMBER_APP_MODE`
- `FEATURE_AUTH`
- `FEATURE_CONTENT`
- `FEATURE_PAYMENTS`
- `FEATURE_ADMIN`
- `FEATURE_VUELVE_IA`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `MEMBER_APP_URL`
- `MARKETING_APP_URL`
- `AGENT_SERVICE_BINDING`
- `RESEND_FROM`
- `AI_DAILY_TOKEN_BUDGET` — positiva e obrigatória antes de ativar a IA;
  define o teto de tokens totais em uma janela móvel de 24 horas.

Segredos:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `PERFECT_PAY_WEBHOOK_TOKEN`
- `RESEND_API_KEY`
- `AGENT_INTERNAL_SECRET`
- `WORKER_INTERNAL_SECRET`

### VUELVE IA

Variáveis:

- `ENVIRONMENT`
- `FEATURE_GENERATION`
- `GEMINI_MODEL`
- `EMBEDDING_MODEL`
- `EMBEDDING_DIMENSIONS`
- `DAILY_RESPONSE_LIMIT`
- `MAX_OUTPUT_TOKENS`
- `SUPABASE_URL`

Segredos:

- `INTERNAL_SECRET`
- `GEMINI_API_KEY`
- `SUPABASE_SECRET_KEY`

`AGENT_INTERNAL_SECRET` no BFF e `INTERNAL_SECRET` no agente precisam conter o
mesmo valor aleatório de pelo menos 32 caracteres. A rotação deve aceitar uma
janela controlada ou ocorrer em uma publicação coordenada.

## Sequência segura de publicação

1. Publicar primeiro a área de membros com o Service Binding declarado; a
   versão anterior do agente continua atendendo durante a transição.
2. Publicar o agente com `preview_urls=false`. O `workers_dev` permanece ativo
   exclusivamente como ponte autenticada para o Workers AI e para o backfill de
   embeddings; todas as rotas exigem `INTERNAL_SECRET` ou
   `PROVIDER_BACKFILL_SECRET` antes de processar qualquer payload. O tráfego da
   área de membros continua usando o Service Binding privado.
3. Publicar marketing e confirmar as saídas `/up1` → `/d1`, `/d1` →
   `/gracias`, `/up2` → `/d2` e `/d2` → `/gracias`.
4. Executar o smoke remoto de toda a superfície pública.
5. Preservar os IDs das versões anteriores para rollback independente.

## Comandos locais

Na raiz:

```bash
npm run check:cloudflare:marketing
npm run check:cloudflare:web
npm run check:cloudflare:agent
```

Preview fiel ao runtime:

```bash
cd apps/marketing
npm run preview

cd ../web
npm run preview
```

Criar uma versão para homologação, sem decidir tráfego de produção:

```bash
cd apps/web
npm run upload
```

O ambiente `production` da área de membros declara o Custom Domain, o Service
Binding, os segredos obrigatórios e falha fechado com `503` quando a
configuração real estiver incompleta.
