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
- [WCAG 2.2 — Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide) e [WAI-ARIA Carousel Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/): um carrossel automático precisa oferecer controle de rotação; ao remover “Pausar”, a alternativa conforme é remover também o autoplay e manter navegação manual.
- [Shopify — Post Purchase Upsell](https://www.shopify.com/blog/post-purchase-upsell): sustenta manter a oferta complementar relevante, direta e simples de aceitar em um clique.

## Fontes canônicas internas

- `Operação 01 - Documentação/2. Produto, Oferta e Mecanismo`: persona, mecanismo, identidade e regra de provas.
- `Operação 01 - Documentação/3. Esteira e Economia`: UP1 Reconquista 30; Downsell 1 com o mesmo conteúdo; recusa segue para UP2. A decisão mais recente do usuário fixa US$6,90 na UP1 e US$4,90 no Downsell 1.
- `Operação 01 - Documentação/4. Produtos e Entregáveis`: produto final de 50 páginas e protocolo de 30 dias.
- `Operação 01 - Documentação/5. Funil Comercial/03 - Checkout e Ofertas.md`: sequência e parâmetros do funil.
- `04_Reconquista_30_FINAL.pdf`: páginas e linguagem reais usadas nos mockups.

## Decisões implementadas

1. Nenhuma hero exibe preço. A UP1 mantém US$6,90 somente no card final; o valor comercial do Downsell 1 é US$4,90, sem inseri-lo na hero nem no texto do botão.
2. Aceite e recusa são botões de mesma hierarquia e dimensão: verde para aceitar, vermelho para recusar, ambos com linguagem direta e sem texto auxiliar de pagamento.
3. A recusa da UP1 leva a `/d1`; por decisão posterior do usuário, a recusa do Downsell 1 leva diretamente a `/gracias`. O avanço de uma compra aceita para a oferta seguinte pertence ao encadeamento de páginas de obrigado da Perfect Pay; a query continua preservada nas transições internas.
4. UP1 e Downsell 1 mantêm o mesmo produto. `/d1` é a reapresentação reduzida por US$4,90 e contém apenas hero, prova social e rodapé; não repete card final nem seção de garantia.
5. Não há cronômetro, falsa escassez nem depoimento inventado. UP1, D1 e a página final do quiz reutilizam Camila, Valentina e Sofía em um carrossel estritamente manual, sem autoplay e sem botão “Pausar”.
6. O mockup multidevice usa capa e páginas reais do PDF em ebook, notebook, tablet e celular. A faixa branca residual das exportações permanece mascarada nas demais apresentações sem cortar texto.
7. O cabeçalho usa a logo clara de Reconquista 30 com transparência; o card off-white usa a variante escura transparente, sem repetir nome ou subtítulo ao lado da marca.
8. O rodapé inclui privacidade e termos. Quando o checkout de D1 não está configurado, o aceite permanece sem cobrança; nenhuma URL fictícia é adicionada.

## Alinhamento com a página final do quiz

O task canônico `Criar quiz por etapas` e o código publicado da página final definem a linguagem reaproveitada em UP1 e D1: coluna única estreita, fundo preto uniforme, títulos em Source Sans 3, texto branco/cinza, card off-white, ritmo mobile-first e prova social em conversas de WhatsApp. A escolha desta rodada preserva o verde para aceite e usa vermelho somente na recusa explícita solicitada. A implementação anterior em layout editorial largo e os cenários ilustrativos foram removidos por romperem essa continuidade.

## Imagens geradas com ImageGen

As duas imagens foram pesquisadas antes da geração e seguem a direção canônica: baixa luz, carvão, vinho e vermelho profundo; mulher latina adulta; emoção controlada; sem clichês românticos, interfaces falsas ou texto incorporado.

- `hero-message.webp`: a mulher avalia um contato ambíguo antes de responder, com espaço negativo para copy.
- `reciprocity-meeting.webp`: reencontro cauteloso em café visto pelo vidro, comunicando observação de reciprocidade em vez de reconciliação garantida.
- `product-bundle-mockup-v1.png`: composição multidevice baseada no mockup aprovado de Haz Que Vuelva, substituindo o conteúdo por capa e páginas reais de Reconquista 30; fundo `#09090b`, sem faixa lateral, marcas de hardware ou texto adicional.

As variantes `brand-transparent-light-v1.png` e
`brand-transparent-dark-v1.png` foram derivadas mecanicamente da logo aprovada,
preservando símbolo e vermelho da marca; muda apenas o fundo transparente e a
cor neutra necessária para contraste no preto e no card off-white.

## Continuação UP2/D2

A revisão posterior dos documentos canônicos confirmou o Downsell 2: é o mesmo
Diagnóstico VUELVE IA, com os mesmos 30 dias, formatos, limites e funções, por
US$15 após a recusa da oferta de US$20. A implementação e as fontes específicas
estão registradas em `vuelve-ia-offer-research.md`.

Os prompts proibiram texto, logos, marca-d'água, corações, flores, brilho rosa/magenta, mãos deformadas, bordas e faixas brancas.

## Renomeação da rota e publicação

Em 4 de agosto de 2026, a rota curta do Downsell 1 foi alterada de
`/downsell1` para `/d1`. A publicação segue o adaptador OpenNext e o comando
versionado do app, conforme a documentação oficial de
[Next.js no Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
e do [`wrangler deploy`](https://developers.cloudflare.com/workers/wrangler/commands/workers/#deploy).
O dry-run deve preceder a mutação remota; depois do deploy, `/d1`, a
preservação da query, a saída para `/gracias` e a remoção da rota antiga precisam
ser comprovadas na superfície pública.

A versão `6fe59bbb-0515-4175-9022-08d3e8fa9e97` foi publicada com 100% do
tráfego. A superfície pública comprovou `/d1` 200, `/downsell1` 404, navegação
`/up1` → `/d1` → `/up2` com query preservada e ausência de overflow nos
viewports 390 × 844 e 1440 × 900.

Essa última frase registra o comportamento histórico daquele rollout. A
alteração posterior de `/d1` para `/gracias` precisa de nova publicação e nova
evidência pública antes de substituir o registro histórico.
