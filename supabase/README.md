# Supabase

As migrações locais modelam a fundação do backend, mas ainda não foram aplicadas
a um projeto cloud.

## Ordem

1. Criar projeto Supabase de desenvolvimento dedicado.
2. Registrar o project ref fora do repositório.
3. Revisar SQL, backup e rollback lógico.
4. Aplicar migrações em ordem.
5. Executar testes negativos RLS com identidades sintéticas.
6. Só então habilitar uma feature flag no app.

Não reutilize projeto, chave ou banco de outro produto.
