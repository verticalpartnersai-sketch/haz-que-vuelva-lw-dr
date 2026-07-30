# Ativação do Supabase

## Estado atual

O backend e o frontend estão implementados localmente. Nenhuma migração desta
operação foi aplicada em projeto remoto. O projeto Supabase visível com nome
genérico `App` não deve ser usado sem comprovação explícita de que pertence ao
HAZ QUE VUELVA.

O gate de banco será executado exclusivamente no Supabase Cloud. Não haverá
bootstrap, migração ou pgTAP em Docker ou banco local.

## Dependências externas

Antes da ativação são necessários:

1. projeto Supabase dedicado e região escolhida;
2. senha do banco guardada fora do repositório;
3. Client ID e Client Secret OAuth do Google;
4. domínio e remetente Resend verificados;
5. token e códigos reais da Perfect Pay;
6. URLs definitivas da área de membros e do marketing;
7. plano Cloudflare compatível com o processamento de PDF definido.

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
- `RESEND_FROM`
- `AGENT_INTERNAL_SECRET`
- `WORKER_INTERNAL_SECRET`

Variáveis não secretas:

- `MEMBER_APP_MODE=production`
- `MEMBER_APP_URL`
- `MARKETING_APP_URL`
- `AGENT_INTERNAL_URL`

Ativar gradualmente `FEATURE_AUTH`, `FEATURE_ADMIN`, `FEATURE_CONTENT`,
`FEATURE_PAYMENTS`, `FEATURE_VUELVE_IA` e, por último,
`NEXT_PUBLIC_AUTH_GOOGLE_ENABLED`.

Uma flag nunca substitui RLS, papel, entitlement, MFA ou reautenticação.

## Critérios de aceite

- login por senha, Google, recuperação e logout funcionam;
- cadastro público continua fechado;
- MFA TOTP eleva a sessão para `aal2`;
- painel admin carrega dados reais e audita cada mutação;
- convites chegam por outbox sem expor chave de serviço;
- compras idempotentes criam e revogam entitlements corretamente;
- dois membros não leem perfil, compra, acesso ou arquivo um do outro;
- conteúdo é privado e entregue somente após autorização;
- rollback do Worker foi testado antes de liberar tráfego.
