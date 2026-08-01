# Testes Supabase

- `001_security_contracts.sql` valida invariantes estruturais, RLS e
  privilégios mínimos de `anon` e `authenticated`.
- `002_rls_isolation.sql` prova o isolamento negativo entre duas alunas.
- `003_ai_generation_atomicity.sql` prova conclusão idempotente da IA: resposta
  e consumo são confirmados na mesma transação e o replay não duplica crédito.
- `004_admin_owner_workspace.sql` valida o contrato atual sem MFA obrigatório:
  proprietário em allowlist privada, reautenticação curta de uso único e
  limitação atômica das provas de senha.
- `005_ai_usage_health.sql` prova agregação de tokens e detecção de telemetria
  ausente sem expor o RPC a membros.
- `006_admin_owner_authorization.sql` prova no projeto Cloud que somente o
  proprietário da allowlist executa uma mutação crítica, que o token não pode
  ser reutilizado e que um perfil sintético com `role=admin` continua negado.
- `007_payment_entitlement_lifecycle.sql` prova a projeção de compra principal,
  order bump, replay idempotente, reembolso por item, evento tardio e revogação
  dos créditos da VUELVE IA.

Os testes desta aplicação serão executados no projeto Supabase Cloud dedicado,
sempre com identidades sintéticas e antes de liberar tráfego para a área de
membros. O banco local não faz parte do gate de publicação. O projeto Cloud
definitivo está ativo e as asserções são executadas remotamente por conexão
Postgres criptografada, dentro de transações revertidas quando criam identidades
sintéticas.

Depois de confirmar explicitamente nome, organização, região e referência do
projeto remoto:

```bash
supabase link --project-ref "$HQV_SUPABASE_PROJECT_REF"
supabase db push --dry-run --include-all
supabase db push --include-all
supabase test db supabase/tests --linked
```

O `db push` real só pode ocorrer depois do dry-run, do backup inicial e da
confirmação de que a CLI está vinculada a `haz-que-vuelva-members`, nunca ao
projeto genérico `App`.

Quando a CLI não estiver vinculada, a suíte também pode ser executada por
PostgreSQL direto, sem Docker. O runner exige host, referência e confirmação
coincidentes, executa tudo em transações revertidas e remove o pgTAP se ele não
existia antes:

```bash
export HQV_SUPABASE_PROJECT_REF="<project-ref>"
export HQV_SUPABASE_TEST_CONFIRM="RUN_PGTAP:<project-ref>"
export PGHOST="db.<project-ref>.supabase.co"
export PGPORT="5432"
export PGDATABASE="postgres"
export PGUSER="postgres"
export PGPASSWORD="<read-from-password-manager>"
scripts/run-supabase-contract-tests.sh
unset PGPASSWORD
```
