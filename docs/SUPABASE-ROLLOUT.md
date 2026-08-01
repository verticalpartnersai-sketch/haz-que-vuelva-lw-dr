# Ativação do Supabase

## Estado atual

O projeto dedicado `haz-que-vuelva-members` está ativo no Supabase Cloud, com
as 28 migrações e testes de segurança aplicados. O catálogo possui cinco
produtos; os três produtos principais e os dois order bumps da Perfect Pay
estão mapeados.

Um teste cloud com duas contas sintéticas comprovou isolamento de perfil e
entitlement, negação da RPC administrativa e negação de leitura cruzada. Outro
teste confirmou que os três buckets são privados e que duas contas sem
autorização não conseguem baixar um objeto nem criar URL assinada. Os usuários,
concessões e objetos sintéticos foram removidos ao final.

As migrações foram aplicadas e verificadas por conexão direta ao banco. A CLI
local não está atualmente vinculada ao projeto por uma conta com acesso: o
token disponível enxerga apenas outro projeto e a Management API do HAZ QUE
VUELVA responde 403. Isso não derruba o app, mas precisa ser corrigido antes de
tratar a CLI como caminho confiável de manutenção, diff e rollback.

O Auth usa `https://miembros.hazquevuelva.site` como Site URL, aceita os
callbacks de produção e desenvolvimento explicitamente cadastrados e mantém
cadastro público e login anônimo desabilitados. A administração é restrita ao
proprietário canônico em allowlist privada e não exige MFA. Google OAuth
permanece desligado até existirem credenciais próprias.

Antes de liberar venda real ainda são necessários:

1. primeiro admin convidado, promovido, com senha definida e acesso owner-only
   comprovado;
2. Client ID e Client Secret OAuth do Google, caso esse login seja mantido;
3. confirmar recebimento do convite real; o domínio
   `mail.hazquevuelva.site` já está `Verified` e o Worker usa
   `acceso@mail.hazquevuelva.site`; a outbox concluiu o primeiro envio sem erro;
4. payloads Perfect Pay redigidos dos cinco produtos/itens;
5. aprovação comercial dos produtos no painel Perfect Pay;
6. teste de restauração e orçamento operacional.
7. recuperar o acesso da conta correta na Supabase CLI e vincular novamente o
   projeto sem reutilizar token de outra organização.

O primeiro backup lógico cifrado foi criado antes da migration 22. A migration
foi então aplicada por conexão PostgreSQL direta, registrada no histórico e
validada com execução exclusiva por `service_role`.

## Ordem segura de ativação

### 1. Criar e confirmar o projeto

- Nome sugerido: `haz-que-vuelva-members`.
- Confirmar organização, região, plano e referência do projeto.
- Registrar um backup inicial antes de aplicar migrações.
- Vincular a CLI somente depois de conferir nome, organização e referência.

### 2. Configurar Auth

- Manter cadastro público e login anônimo desabilitados.
- Manter confirmação dupla na troca de e-mail.
- Autorizar os callbacks:
  - `https://miembros.hazquevuelva.site/auth/confirm`
  - `http://127.0.0.1:3000/auth/confirm`
- Definir Site URL como `https://miembros.hazquevuelva.site`.
- Habilitar Google somente após cadastrar Client ID e Client Secret.
- Não expor Client Secret do Google no Next.js ou no Cloudflare.

### 3. Aplicar e testar o banco

- Revisar o diff remoto antes de `db push`.
- Aplicar todas as migrações na ordem versionada.
- Executar os quatro arquivos pgTAP em `supabase/tests` contra o projeto
  vinculado com `supabase test db supabase/tests --linked`.
- Testar com anônimo, dois membros separados e um administrador.
- Comprovar que membros não leem dados entre si e que somente o proprietário
  canônico abre dados administrativos ou consome reautenticação.

### 4. Bootstrap administrativo

- Carregar `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SECRET_KEY` somente no shell
  confiável, sem registrar os valores no histórico.
- Validar o plano com `npm --prefix apps/web run admin:bootstrap --
  admin@example.com`.
- Para executar, definir `HQV_ADMIN_BOOTSTRAP_CONFIRM` exatamente como
  `BOOTSTRAP_ADMIN:admin@example.com` e repetir com `--execute`. O comando
  recusa outro projeto, recusa criar um segundo admin e enfileira o convite na
  outbox Resend canônica.
- Confirmar que `/administracion` rejeita membro comum mesmo que seu perfil
  tenha sido adulterado e aceita somente o proprietário canônico.
- Executar convite, concessão e revogação com motivo e senha novamente.

### 5. Configurar o Worker

Segredos:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `PERFECT_PAY_WEBHOOK_TOKEN`
- `RESEND_API_KEY`
- `AGENT_INTERNAL_SECRET`
- `WORKER_INTERNAL_SECRET`

Variáveis não secretas:

- `MEMBER_APP_MODE=production`
- `MEMBER_APP_URL`
- `MARKETING_APP_URL`
- `AGENT_SERVICE_BINDING=true`
- `RESEND_FROM`

`FEATURE_AUTH`, `FEATURE_ADMIN`, `FEATURE_CONTENT` e `FEATURE_PAYMENTS` estão
ativos no Worker de produção. `FEATURE_VUELVE_IA` permanece falso até o smoke
real e o gate jurídico.
`NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` permanece falso.

Uma flag nunca substitui RLS, papel, entitlement ou reautenticação.

## Critérios de aceite

- login por senha, recuperação e logout funcionam;
- Google funciona somente se for habilitado depois com credenciais próprias;
- cadastro público continua fechado;
- somente o proprietário canônico obtém administração efetiva;
- painel admin carrega dados reais e audita cada mutação;
- convites chegam por outbox sem expor chave de serviço;
- compras idempotentes criam e revogam entitlements corretamente;
- dois membros não leem perfil, compra, acesso ou arquivo um do outro;
- conteúdo é privado e entregue somente após autorização;
- rollback do Worker foi testado antes de liberar tráfego.
