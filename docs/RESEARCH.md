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

## Registro de fontes — Gate 2

Pesquisa realizada via Exa MCP em 24 de julho de 2026. Foram usadas fontes
primárias; a pesquisa não substituiu a leitura integral dos documentos do
repositório.

### Reflow, zoom e espaçamento

- [WCAG 2.2 — Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow):
  exige acesso ao conteúdo e funcionalidade, sem rolagem em dois eixos, na
  largura equivalente a 320 CSS px.
- [WCAG 2.2 — Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text):
  exige resize de texto até 200% sem perda.
- [WCAG 2.2 — Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing):
  exige que overrides de line-height, parágrafo, letras e palavras não causem
  perda de conteúdo ou função.

Decisão: grade content-driven, unidades relativas, ordem DOM preservada e
reflow a 320 CSS px. Trilhos são regiões horizontais deliberadas e contidas; a
página não rola horizontalmente. Texto e controles devem sobreviver a 200% e
aos overrides de espaçamento.

### Contraste e foco

- [WCAG 2.2 — Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast):
  exige 3:1 para informação necessária que identifica controles e estados.
- [WCAG 2.2 — Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html):
  exige no nível AA que conteúdo criado pelo autor não esconda totalmente o
  componente focado.
- [WCAG 2.2 — Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance):
  define no nível AAA requisitos mensuráveis de área e contraste para o
  indicador de foco.

Decisão: borda necessária de controle usa no mínimo 3:1; sidebar, dock e modal
não encobrem foco. O anel de 2 px e mudança de 3:1 permanece como padrão interno
mais forte, mas não será descrito incorretamente como requisito AA.

### Modal, tooltip, teclado e nomes acessíveis

- [ARIA APG — Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/):
  sustenta contenção de Tab, fechamento por Escape, foco inicial contextual,
  `aria-modal`, nome acessível, fundo inerte e retorno ao disparador.
- [WCAG 2.2 — Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus):
  exige que conteúdo adicional seja dispensável, hoverable e persistente.
- [ARIA APG — Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/):
  sustenta foco no disparador e fechamento por Escape.
- [ARIA APG — Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/):
  sustenta ordem previsível e semântica nativa antes de widgets compostos.
- [ARIA APG — Names and Descriptions](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/):
  sustenta nome acessível explícito e alerta que `title`/tooltip não é
  descoberta suficiente sem ponteiro.
- [ARIA APG — Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/):
  documenta a complexidade e os controles necessários quando há rotação.

Decisão: modal segue o padrão APG. Tooltip reforça, mas não substitui nome,
permanece aberto enquanto foco ou ponteiro estiverem no disparador/tooltip e
fecha por Escape. Trilho de produtos é lista horizontal controlada pelo usuário,
sem rotação automática e sem semântica de carousel desnecessária.

### Movimento

- [WCAG 2.2 — Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide):
  exige controle para movimento ou atualização automática não essencial nos
  casos normativos.
- [WCAG 2.2 — Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions):
  recomenda permitir desativar animação não essencial e reconhece
  `prefers-reduced-motion`; este critério é AAA.

Decisão: não usar autoplay, parallax ou movimento contínuo. Transições são
curtas e removidas ou reduzidas sob preferência de movimento reduzido.

### Tipografia e licença

- [Google Fonts — Bodoni Moda](https://fonts.google.com/specimen/Bodoni+Moda):
  descreve uma família display com pesos, itálicos, optical sizes e conjunto
  estendido.
- [Repositório oficial Bodoni](https://github.com/indestructible-type/Bodoni):
  identifica o projeto upstream e a licença SIL Open Font License 1.1.
- [Licença oficial de Bodoni Moda no Google Fonts](https://github.com/google/fonts/blob/main/ofl/bodonimoda/OFL.txt):
  confirma SIL Open Font License 1.1 para a família selecionada.
- [Google Fonts — Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3):
  descreve família criada para funcionar em interfaces.
- [Repositório oficial Google Fonts](https://github.com/google/fonts):
  informa que as famílias são redistribuíveis conforme a licença incluída e
  que cada diretório contém metadados/licença.
- [Licença oficial de Source Sans 3 no Google Fonts](https://github.com/google/fonts/blob/main/ofl/sourcesans3/OFL.txt):
  confirma SIL Open Font License 1.1.
- [Google Fonts para desenvolvedores](https://developers.google.com/fonts):
  informa que as fontes oferecidas possuem licenças open source para uso
  comercial e não comercial.

Decisão: `Bodoni Moda` para display e `Source Sans 3` para UI/corpo, com
auto-hospedagem futura, arquivo de licença e sem chamada runtime ao Google.
Revalidar os arquivos e a licença específica de cada família antes de
adicioná-los ao Gate 3.
