# HAZ QUE VUELVA

Monorepo do site público, área de membros e VUELVE IA.

## Apps

- `apps/marketing`: site público e quiz (`hazquevuelva.site/quiz`).
- `apps/web`: área de membros e BFF (`miembros.hazquevuelva.site`).
- `apps/agent`: serviço privado FastAPI, somente VUELVE IA.
- `supabase`: migrações, RLS e testes de banco.

## Estado

O frontend está aprovado. A fundação do backend está em implementação, mas
nenhum fornecedor externo está ativo e nenhum dado real deve ser usado.

Leia [o índice documental](docs/INDEX.md) e
[o checklist](docs/PROJECT-CHECKLIST.md) antes de alterar gates.

## Desenvolvimento local

Use Node.js 22 ou superior (`.nvmrc`).

```bash
cd apps/web && npm install
cd ../marketing && npm install
cd ../.. && npm run dev

# ou, separadamente:
npm run dev:web
npm run dev:marketing

cd apps/agent && python3.12 -m venv .venv && .venv/bin/pip install -e '.[dev]'
```

Copie os arquivos `.env.example` apenas para configuração local. Não preencha
nem versione segredos até o projeto externo correspondente existir.

Os builds e previews locais do Cloudflare estão descritos em
[Publicação no Cloudflare](docs/CLOUDFLARE-DEPLOYMENT.md). Esses comandos não
autorizam deploy nem ativação de integrações reais.

No desenvolvimento local, a área de membros usa `http://localhost:3000` e o
site público/quiz usa `http://127.0.0.1:3001/quiz`. A rota `/quiz` da área de
membros redireciona para o app público. `MARKETING_APP_URL` permite substituir
o endereço do site público quando necessário.
