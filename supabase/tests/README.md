# Testes Supabase

- `001_security_contracts.sql` valida invariantes estruturais e privilégios.
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
