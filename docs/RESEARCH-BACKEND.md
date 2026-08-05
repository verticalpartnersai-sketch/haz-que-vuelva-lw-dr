# Pesquisa e fontes — backend e integrações

> Continuação de [Pesquisa e fontes](RESEARCH.md), com decisões de backend,
> autenticação e fornecedores.

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

O usuário decidiu que MFA não será obrigatório. Isso reduz a proteção contra
roubo simultâneo de senha e sessão. Os controles compensatórios implementados
são: proprietário único em allowlist privada, autorização repetida no BFF e em
RLS, reautenticação nas mutações críticas, credencial curta de uso único,
privilégio mínimo e auditoria append-only. Rate limiting e alertas externos
continuam como trabalho operacional separado.

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
