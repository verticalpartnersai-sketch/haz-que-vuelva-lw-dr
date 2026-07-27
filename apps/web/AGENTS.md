# Regras locais — área de membros e BFF

- Next.js é o BFF e o núcleo de negócio fora da VUELVE IA.
- Organize por `identity`, `catalog`, `entitlements`, `content`, `payments`,
  `notifications`, `admin` e `audit`.
- Domínio e aplicação não importam SDK de fornecedor; adapters fazem tradução.
- Server Components leem dados autenticados. Route Handlers recebem integrações
  e APIs públicas. Server Actions servem apenas mutações simples de interface.
- Proxy renova/redireciona, mas não substitui autorização no handler, DAL e RLS.
- Toda entrada externa usa Zod, limite de payload e erro sem conteúdo sensível.
- Service role é `server-only` e nunca pode entrar em Client Component.
- Feature flag controla rollout, não autorização.
- Teste negativamente autenticação, entitlement, idempotência e falha externa.
