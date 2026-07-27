# Testes Supabase

- `001_security_contracts.sql` valida invariantes estruturais e privilégios.
- `002_rls_isolation.sql` prova o isolamento negativo entre duas alunas.
- `003_ai_generation_atomicity.sql` prova conclusão idempotente da IA: resposta
  e consumo são confirmados na mesma transação e o replay não duplica crédito.

Todos exigem um banco Supabase descartável ou o projeto cloud dedicado de
desenvolvimento, sempre com identidades sintéticas. Eles permanecem
obrigatórios antes de habilitar qualquer flag. Neste checkout ainda não foram
executados porque não há projeto vinculado e o Docker local não está
disponível.
