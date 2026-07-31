# Ativação do Supabase

## Estado atual

O projeto dedicado `haz-que-vuelva-members` está ativo no Supabase Cloud, com
as 21 migrações e testes de segurança aplicados. O catálogo possui cinco
produtos; os três produtos principais e os dois order bumps da Perfect Pay
estão mapeados.

O Auth usa `https://miembros.hazquevuelva.site` como Site URL, aceita os
callbacks de produção e desenvolvimento explicitamente cadastrados e mantém
cadastro público e login anônimo desabilitados. TOTP está habilitado; Google
OAuth permanece desligado até existirem credenciais próprias.

Antes de liberar venda real ainda são necessários:

1. primeiro admin convidado, promovido e inscrito em TOTP;
2. Client ID e Client Secret OAuth do Google, caso esse login seja mantido;
3. teste real de entrega do remetente Resend;
4. payloads Perfect Pay redigidos dos cinco produtos/itens;
5. aprovação comercial dos produtos no painel Perfect Pay;
6. teste de restauração e orçamento operacional.

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
- Comprovar que membros não leem dados entre si e que admin `aal1` não abre
  dados administrativos nem consome reautenticação.

### 4. Bootstrap administrativo

- Criar a primeira conta por convite.
- Promover a conta com `apps/web/scripts/promote-admin.mjs`.
- Configurar TOTP em `/auth/mfa`.
- Confirmar que `/administracion` redireciona admin `aal1` para MFA.
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

Uma flag nunca substitui RLS, papel, entitlement, MFA ou reautenticação.

## Critérios de aceite

- login por senha, recuperação e logout funcionam;
- Google funciona somente se for habilitado depois com credenciais próprias;
- cadastro público continua fechado;
- MFA TOTP eleva a sessão para `aal2`;
- painel admin carrega dados reais e audita cada mutação;
- convites chegam por outbox sem expor chave de serviço;
- compras idempotentes criam e revogam entitlements corretamente;
- dois membros não leem perfil, compra, acesso ou arquivo um do outro;
- conteúdo é privado e entregue somente após autorização;
- rollback do Worker foi testado antes de liberar tráfego.
