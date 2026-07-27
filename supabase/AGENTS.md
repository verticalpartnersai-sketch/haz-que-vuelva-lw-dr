# Regras locais — Supabase

- Migrações são imutáveis depois de aplicadas a qualquer ambiente compartilhado.
- Toda tabela exposta usa RLS e privilégios mínimos.
- Funções `security definer` devem fixar `search_path`, validar o chamador e ter
  privilégios explícitos.
- Service role nunca chega ao navegador.
- Políticas devem ter testes negativos entre duas alunas, `member`, `admin` e
  anônimo.
- Entitlements são derivados de um ledger; não use flag mutável no perfil.
- Compras, auditoria e outbox preservam idempotência e histórico.
- Conteúdo íntimo, documentos e vetores devem pertencer à aluna por chave
  explícita e política RLS.
- Não aplique migrações em cloud sem projeto alvo confirmado, backup e
  autorização.
