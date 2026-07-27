# HAZ QUE VUELVA — regras de engenharia

Estas regras valem para todo o repositório. Um `AGENTS.md` mais próximo pode
adicionar restrições locais, mas não pode enfraquecer segurança, privacidade ou
modularidade.

## Fonte de verdade

1. Código executável, migrações aplicadas e testes observáveis vencem memória.
2. `docs/PROJECT-CHECKLIST.md` registra o estado comprovado dos gates.
3. Documentos específicos são canônicos para seus contratos.
4. Notas Oracle são contexto de produto. Instruções recentes do usuário e
   decisões versionadas vencem qualquer conflito.
5. Antes de integrar uma API atual, consulte Exa e documentação oficial e
   registre a decisão em `docs/RESEARCH.md`.

## Arquitetura

- Organize por capacidades do domínio, não por fornecedor.
- Domínio e casos de uso não importam Next.js, Supabase, Perfect Pay, Resend ou
  SDK do Gemini.
- Dependências externas entram por portas e adaptadores.
- Next.js é o BFF e núcleo de negócio. FastAPI atende somente VUELVE IA.
- Crie pacote compartilhado apenas quando existir um contrato consumido de
  verdade por mais de um app.
- Meta: até 300 linhas por arquivo manuscrito. Máximo absoluto: 400 linhas.
- Divida um arquivo existente acima de 400 linhas antes de adicionar lógica.
- Lockfiles, artefatos gerados, migrações mecânicas e assets binários são
  isentos do teto.

## Segurança e dados

- Nunca grave credenciais, tokens, payloads integrais, conversas, documentos,
  URLs assinadas ou conteúdo íntimo em código, docs, logs ou commits.
- Autorização sensível deve existir no DAL/handler e em RLS. Proxy ou UI não
  constituem autorização.
- Migrações, RLS, webhooks e autorização exigem testes negativos.
- Use dados sintéticos até aprovação jurídica para México e Colômbia.
- Segredos pertencem ao ambiente seguro e são separados por ambiente.
- Toda mutação externa recuperável precisa de idempotência.

## Trabalho no repositório

- Preserve worktrees sujos e mudanças paralelas.
- Antes de editar, confira `git status` e instruções locais.
- Commits são seletivos e não absorvem trabalho de outra task.
- Não use comandos destrutivos para “limpar” alterações.
- Não faça deploy ou smoke test real sem autorização explícita.
- Valide proporcionalmente ao risco; antes de commit, use no mínimo
  `git diff --check` e os testes estreitos do módulo alterado.

## Estado atual

- Frontend da área de membros: aprovado e preservado em commit próprio.
- Quiz público: `apps/marketing`.
- Backend: autorizado em fatias.
- Supabase, Perfect Pay, Resend e Gemini reais: não ativar antes de credenciais,
  contratos e gates correspondentes.
- Supermemory e Cloudflare R2: fora da arquitetura atual.
