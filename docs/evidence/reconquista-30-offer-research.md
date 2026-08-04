# Reconquista 30 — pesquisa e decisões da oferta

Data: 4 de agosto de 2026.

## Escopo pesquisado

- UX de oferta pós-compra e clareza dos controles.
- Estrutura de sales page longa para um produto digital editorial.
- Referências visuais de fotografia cinematográfica íntima e mockups de workbook.
- Contratos do produto Reconquista 30, da esteira UP1/Downsell 1 e das provas permitidas.

As buscas foram feitas com Agent Reach/Exa e consultas complementares em busca de imagens, Twitter e Reddit. Os resultados sociais não trouxeram evidência primária suficiente e não sustentaram decisões de produto.

## Fontes externas adotadas

- [Shopify — UX for post-purchase product offers](https://shopify.dev/docs/apps/build/checkout/product-offers/ux-for-post-purchase-product-offers): exige custo transparente, ações claras de aceitar/recusar, relevância da oferta e rodapé com termos aplicáveis.
- [FTC — Bringing Dark Patterns to Light](https://www.ftc.gov/reports/bringing-dark-patterns-light): sustenta não usar custos ocultos, obstrução da recusa, escassez falsa ou prova social fabricada.
- [Copyhackers — long-form sales page](https://copyhackers.com/write-long-form-sales-page-template/): referência secundária para ordenar problema, mecanismo, demonstração do produto e oferta.
- [WCAG 2.2 — Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) e [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): critérios para legibilidade e alvos interativos.

## Fontes canônicas internas

- `Operação 01 - Documentação/2. Produto, Oferta e Mecanismo`: persona, mecanismo, identidade e regra de provas.
- `Operação 01 - Documentação/3. Esteira e Economia`: UP1 Reconquista 30; Downsell 1 com o mesmo conteúdo por US$5; recusa segue para UP2.
- `Operação 01 - Documentação/4. Produtos e Entregáveis`: produto final de 50 páginas e protocolo de 30 dias.
- `Operação 01 - Documentação/5. Funil Comercial/03 - Checkout e Ofertas.md`: sequência e parâmetros do funil.
- `04_Reconquista_30_FINAL.pdf`: páginas e linguagem reais usadas nos mockups.

## Decisões implementadas

1. O preço fica visível perto da ação, mas não dentro do texto do botão.
2. Aceite é verde e recusa é vermelha; ambos têm peso visual explícito, sem seta ou ícone.
3. A recusa da UP1 leva a `/d1`; a recusa do Downsell 1 leva a `/up2`; a query é preservada.
4. O Downsell 1 mantém produto, acesso e garantia e altera apenas o preço para US$5.
5. Não há cronômetro, falsa escassez nem depoimento inventado. Os relatos são rotulados como cenários ilustrativos.
6. Páginas reais do PDF tornam o produto tangível. A coluna branca de 1 px presente nas seis exportações foi removida sem alterar o conteúdo.
7. A logo usada é `brand-v2.png`, coerente com a identidade aprovada de Reconquista 30.
8. O rodapé inclui privacidade e termos; quando o checkout não está configurado, o aceite permanece sem cobrança e informa isso.

## Imagens geradas com ImageGen

As duas imagens foram pesquisadas antes da geração e seguem a direção canônica: baixa luz, carvão, vinho e vermelho profundo; mulher latina adulta; emoção controlada; sem clichês românticos, interfaces falsas ou texto incorporado.

- `hero-message.webp`: a mulher avalia um contato ambíguo antes de responder, com espaço negativo para copy.
- `reciprocity-meeting.webp`: reencontro cauteloso em café visto pelo vidro, comunicando observação de reciprocidade em vez de reconciliação garantida.

Os prompts proibiram texto, logos, marca-d'água, corações, flores, brilho rosa/magenta, mãos deformadas, bordas e faixas brancas.

## Renomeação da rota e publicação

Em 4 de agosto de 2026, a rota curta do Downsell 1 foi alterada de
`/downsell1` para `/d1`. A publicação segue o adaptador OpenNext e o comando
versionado do app, conforme a documentação oficial de
[Next.js no Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
e do [`wrangler deploy`](https://developers.cloudflare.com/workers/wrangler/commands/workers/#deploy).
O dry-run deve preceder a mutação remota; depois do deploy, `/d1`, a
preservação da query, a saída para `/up2` e a remoção da rota antiga precisam
ser comprovadas na superfície pública.

A versão `6fe59bbb-0515-4175-9022-08d3e8fa9e97` foi publicada com 100% do
tráfego. A superfície pública comprovou `/d1` 200, `/downsell1` 404, navegação
`/up1` → `/d1` → `/up2` com query preservada e ausência de overflow nos
viewports 390 × 844 e 1440 × 900.
