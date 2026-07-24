# Pesquisa e fontes

## Regra permanente

Antes de uma decisão técnica, integração ou escolha de biblioteca/provedor:

1. Reler `PROJECT-CHECKLIST.md` e os documentos do gate.
2. Pesquisar o fato atual com Exa MCP.
3. Priorizar documentação oficial e fontes primárias.
4. Registrar a fonte no documento técnico e a decisão sustentada.
5. Implementar somente após a pesquisa.
6. Revisar resultado contra checklist, documentação e requisitos.

Pesquisa não substitui leitura do código. Fatos estáveis e triviais não exigem
churn; APIs, segurança, integrações e operação exigem verificação atual.

## Hierarquia de fontes

1. Documentação oficial do fornecedor ou padrão.
2. Especificação primária e repositório oficial.
3. Suporte oficial do fornecedor.
4. Fonte secundária somente quando a primária for insuficiente, com ressalva.

## Pesquisa obrigatória por gate

| Gate | Pesquisa mínima |
|---|---|
| Design system | WCAG atual, fontes/licenças e suporte do navegador necessário |
| Frontend | Documentação local do Next.js instalado e APIs atuais escolhidas |
| Identidade | Supabase Auth, SSR, MFA, RLS e cookies |
| Pagamentos | Perfect Pay webhook, autenticação, payload e estados |
| Arquivos | Cloudflare R2, CORS, URLs temporárias e limites |
| E-mail | Resend, domínio, SPF, DKIM, DMARC e limites |
| IA | Supermemory, modelo de IA, isolamento, filtros e limites |
| Infraestrutura | Docker, Hostinger VPS, Cloudflare, TLS, backup e hardening |

Cada gate deve repetir a pesquisa relevante; esta página não congela APIs.

## Registro de fontes — Gate 1

Pesquisa realizada via Exa MCP em 24 de julho de 2026.

### Supabase

- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security):
  sustenta autorização por linha combinada ao Supabase Auth.
- [Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa):
  sustenta exigir `aal2` e aplicar a regra também em backend e RLS.
- [Server-Side Rendering](https://supabase.com/docs/guides/auth/server-side):
  sustenta sessão SSR por cookies; a página informa que `@supabase/ssr` está em
  beta e pode sofrer breaking changes.

Decisão: manter Auth SSR + RLS + MFA como direção, mas revalidar pacote e API no
gate de identidade.

### Perfect Pay

- [Integração via webhook](https://support.perfectpay.com.br/doc/perfectpay/postback/integracao-via-webhook-com-a-perfect-pay):
  confirma os estados `approved`, `cancelled`, `refunded` e `charged_back`.

Decisão: usar esses estados como contrato de concessão/revogação fornecido pelo
usuário. Autenticação do webhook, identificador idempotente e tratamento de
ordem permanecem `PENDENTE` até pesquisa específica do gate.

### Cloudflare R2

- [Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/):
  confirma acesso temporário a uma operação e objeto; a URL funciona como
  bearer token até expirar.
- [Configure CORS](https://developers.cloudflare.com/r2/buckets/cors/):
  confirma que uso no navegador exige CORS compatível com origem, método e
  headers.

Decisão: bucket privado, autorização antes da emissão, validade curta e CORS
mínimo. O prazo exato será decidido no gate de arquivos.

### Supermemory

- [Container Tags](https://supermemory.ai/docs/concepts/container-tags):
  confirma isolamento por `containerTag`; API v4 usa o campo singular e o
  plural é legado.
- [User Profiles](https://supermemory.ai/docs/user-profiles):
  confirma recuperação de perfil por `containerTag`.
- [Scoped API Keys](https://supermemory.ai/docs/authentication):
  confirma que chaves podem ser limitadas a um container.

Decisão: escopos global e por membro usam tags determinísticas e chamadas
separadas. Revalidar v4, limites e chaves com escopo no gate de IA.

### Resend

- [Add and verify a domain](https://resend.com/docs/add-a-domain):
  recomenda subdomínio e exige verificação; fornece registros SPF e DKIM.
- [Implementing DMARC](https://resend.com/docs/dashboard/domains/dmarc):
  sustenta adoção gradual de DMARC após SPF e DKIM.

Decisão: usar subdomínio próprio do projeto, verificar SPF/DKIM e endurecer
DMARC gradualmente após observar todos os remetentes legítimos.

### Acessibilidade

- [WCAG 2.2 — Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html):
  exige 4.5:1 para texto normal e 3:1 para texto grande no nível AA.
- [WCAG 2.2 — Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance):
  orienta área equivalente a perímetro de 2 px e mudança de contraste 3:1.
- [WCAG 2.2 — Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum):
  define mínimo AA de 24 × 24 CSS px, com exceções.

Decisão: manter alvo de projeto em 44 × 44 px como margem de usabilidade,
contraste AA para texto e foco visível de 2 px.
