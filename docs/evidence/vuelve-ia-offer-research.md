# Diagnóstico VUELVE IA — pesquisa e decisões de UP2/D2

Data: 4 de agosto de 2026.

## Escopo pesquisado

- contrato comercial do Diagnóstico VUELVE IA e do Downsell 2;
- encadeamento de ofertas one-click e páginas de obrigado na Perfect Pay;
- transparência, privacidade, limitações e apresentação responsável de uma
  análise assistida por IA;
- interface mobile-first coerente com UP1/D1, sem preço na hero.

As buscas externas foram executadas com Agent Reach/Exa. As decisões de
produto usam primeiro o material canônico interno; fontes oficiais externas
sustentam apenas a integração e os controles de transparência.

## Fontes externas adotadas

- [Perfect Pay — Upsell OneClick](https://help.perfectpay.com.br/article/141-upsell-one-click): a oferta pós-compra deve cadastrar seu link e uma página de obrigado; essa página pode ser a próxima oferta para formar uma cadeia.
- [Perfect Pay — Página de Obrigado](https://help.perfectpay.com.br/article/128-como-configurar-minha-pagina-de-obrigado-na-perfect-pay): referência operacional para concluir ou continuar o fluxo depois de cada decisão comercial.
- [NIST — Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence): sustenta informar limitações, privacidade, testes e fronteiras do uso de IA antes da ativação real.

## Fontes canônicas internas

- `2. Produto, Oferta e Mecanismo/03 - Produtos da Esteira.md`: UP2 por US$20 e D2 com o mesmo produto por US$15.
- `3. Esteira e Economia/01 - Preços e Fluxo.md`: desconto de 25% e eventos separados para visualização, aceite e recusa de UP2/D2.
- `4. Produtos e Entregáveis/03 - VUELVE IA.md`: 30 dias, um caso, entradas em texto, `.txt` ou `.zip`, limites e fronteiras de segurança.
- `5. Funil Comercial/03 - Checkout e Ofertas.md`: copy, oferta e garantia de que o D2 não perde funções, formatos ou limites.
- Instrução posterior do usuário: recusa em D1 conclui em `/gracias`; preço não aparece em hero de upsell ou downsell.

## Decisões implementadas

1. `/up2` e `/d2` usam uma página própria de VUELVE IA; a hero genérica anterior foi removida porque misturava preço, acesso e garantia na primeira decisão.
2. Nenhuma hero exibe preço. UP2 mostra US$20 somente no card final; D2 mantém a apresentação curta e não exibe valor na hero.
3. Aceite e recusa têm a mesma estrutura e altura: verde para aceitar, vermelho para recusar. Não há texto auxiliar de pagamento na hero.
4. O mockup multidevice é uma interface HTML/CSS com texto sintético controlado. Essa escolha evita inventar uma tela raster ou gerar texto ilegível em imagem; nenhum novo raster foi necessário.
5. O exemplo de diagnóstico é identificado como sintético e separa fato, desconhecido, sinal e decisão. Não há depoimento ou resultado fabricado.
6. UP2 contém mecanismo, exemplo, limites, privacidade, oferta final e garantia. D2 contém somente hero, o mesmo mockup, exemplo sintético e rodapé, como a estrutura curta de D1.
7. O roteamento interno preserva a query: recusa em UP2 segue para `/d2`; recusa em D2 segue para `/gracias`; recusa em D1 também segue para `/gracias`.
8. O aceite de D2 depende de `NEXT_PUBLIC_DOWNSELL_2_ACCEPT_URL`. Sem URL aprovada, o controle permanece desabilitado e não executa cobrança.

## Limite de comprovação

Código e QA local não comprovam cadastro de oferta, one-click, entitlement ou
redirecionamento no painel Perfect Pay. Esses pontos permanecem abertos até
homologação com uma compra controlada. A publicação da nova rota `/d2` também
exige deploy e smoke público separados.
