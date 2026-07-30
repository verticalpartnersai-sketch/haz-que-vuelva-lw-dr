# Design QA — Gate 3 / hero responsiva

Data: 26 de julho de 2026
Estado avaliado: Home estática, topo da página, mocks member
Resultado: integração pronta para aprovação visual do usuário; Gate 4 não iniciado

## Fontes de verdade

- Desktop 16:9:
  `/Users/mateusmpz/.codex/generated_images/019f95f0-071c-7ad3-9968-938ee0bc1c73/exec-4b2e4b0c-5366-42bc-bf9f-2f68cc01c22e.png`
  — 1672 × 941.
- Ultra-wide:
  `/Users/mateusmpz/.codex/generated_images/019f95f0-071c-7ad3-9968-938ee0bc1c73/exec-114d0b66-27cc-449e-9513-d7ca3d1673d8.png`
  — 1915 × 821.
- Tablet:
  `/Users/mateusmpz/.codex/generated_images/019f95f0-071c-7ad3-9968-938ee0bc1c73/exec-11184cd8-c2ba-4e37-868d-485072bd7ab5.png`
  — 1448 × 1086.
- Mobile:
  `/Users/mateusmpz/.codex/generated_images/019f95f0-071c-7ad3-9968-938ee0bc1c73/exec-c87810f2-198e-47df-94d2-328df76031e2.png`
  — 941 × 1672.
- Direção de composição: shell preto, rail lateral muito estreito, hero
  dominante, copy compacta à esquerda, gradientes de leitura e trilhos densos
  na transição inferior.

## Evidência comparada

| Superfície | Viewport | Densidade | Estado | Evidência |
|---|---:|---:|---|---|
| Desktop | 1680 × 950 CSS px | 1× | Home/topo/member | `docs/evidence/gate3-home-final-hero-desktop.png` |
| Mobile | 390 × 844 CSS px | 1× | Home/topo/member | `docs/evidence/gate3-home-final-hero-mobile.png` |
| Referência de composição × implementação | 1680 × 950 por lado | 1× | comparação conjunta | `docs/evidence/gate3-home-reference-vs-implementation-desktop.png` |
| Fonte × implementação desktop | 1680 × 950 por lado | 1× | comparação conjunta | `docs/evidence/gate3-home-source-vs-implementation-desktop.png` |
| Fonte × implementação mobile | 390 × 844 por lado | 1× | comparação conjunta | `docs/evidence/gate3-home-source-vs-implementation-mobile.png` |

As comparações conjuntas colocam a referência ou fonte à esquerda e a
implementação à direita. A comparação de composição verifica rail, hero,
hierarquia e densidade; as comparações da fonte fotográfica verificam recorte e
legibilidade.

## Passes obrigatórios

### Fidelidade e composição

- A fotografia aprovada ocupa toda a hero sem card, borda, filtro ou arte CSS.
- No desktop, a mulher permanece à direita e o espaço negativo sustenta
  wordmark, copy e CTAs à esquerda.
- O gradiente lateral preserva a leitura sem alterar a colorimetria da área
  visível da personagem.
- O gradiente inferior conecta hero e catálogo; o primeiro trilho começa dentro
  da transição e exibe seis capas mais o recorte da próxima.
- Shell, rail, hierarquia, densidade e ritmo permanecem reconhecíveis como
  catálogo de streaming premium, com identidade e assets próprios.
- No mobile, a composição vertical aprovada é usada diretamente; o scrim foi
  reduzido para conservar rosto, luminária e taça perceptíveis sem perder
  contraste do texto.

### Imagem e otimização

- O repositório contém somente WebP final; nenhum PNG de origem é versionado.
- Conversão: qualidade 90, subamostragem 4:4:4, esforço 6.
- PSNR fonte PNG × WebP: desktop 44,54 dB; ultra-wide 44,26 dB; tablet
  44,55 dB; mobile 45,50 dB.
- Inspeção em tamanho original: sem blocagem, halo ou borrão aparente em rosto,
  cabelos, mãos, taça, vinho, garrafa, luminária ou gradientes escuros.
- `picture` selecionou em navegador: mobile a 320/390 px, tablet a 768 px,
  desktop a 1680 px e ultra-wide a 1920 px.
- A imagem é solicitada diretamente em WebP, sem re-encode do otimizador. Não
  existe `link[rel="preload"][as="image"]`; cada breakpoint baixa somente a
  fonte selecionada pelo `picture`, com `fetchpriority="high"` na imagem LCP.
- O fallback possui dimensões intrínsecas 1672 × 941 e a hero reserva altura
  antes do carregamento; `object-fit: cover` preserva o slot sem CLS visível.

### Tipografia, cor e superfícies

- Wordmark mantém peso e escala dominantes; copy e botões formam hierarquia
  compacta.
- Preto/carvão ocupa a maior parte da interface. Vermelho verdadeiro permanece
  limitado a wordmark, ação primária, estado ativo e indicadores.
- Não há rosa, magenta, neon, vidro decorativo ou aparência de dashboard SaaS.
- Cards conservam proporção vertical, alta densidade, borda discreta e estados
  disponível/bloqueado também por texto e ícone.

### Responsividade e comportamento

- Sem overflow de página em 320, 768, 1680 ou 1920 CSS px.
- Mobile usa cabeçalho e dock próprios; desktop usa rail fixo.
- Modal bloqueado abre a partir de um botão semântico, fecha pelo controle e
  devolve foco ao disparador.
- Snapshot semântico preserva skip link, navegação nomeada, regiões dos trilhos,
  títulos, links e estados dos produtos.
- Console do navegador sem erro ou aviso durante a passagem principal.

### Acessibilidade

- Hero é decorativa, com `alt=""` e contêiner `aria-hidden`.
- CTAs, navegação, rail e cards têm nomes acessíveis.
- Estados bloqueado/disponível não dependem exclusivamente de cor.
- Foco do modal retorna ao card de origem.
- Reflow a 320 px não cria scroll horizontal.

## Achados e correções

1. **P1 — mobile ocultava a personagem:** o scrim anterior somava opacidades
   altas e tornava rosto e taça quase invisíveis. Corrigido em
   `src/design-system/home.css` com gradientes mais localizados e sem filtro de
   cor.
2. **P1 — fonte única exigia recorte genérico:** o PNG desktop temporário foi
   removido. Corrigido com quatro WebPs e seleção responsiva por `picture`.
3. **P2 — tokens órfãos do placeholder:** `hero.art.*` foi removido do código e
   da documentação após a fotografia final substituir a arte CSS.
4. **P2 — documentação declarava asset pendente:** checklist, especificação,
   implementação e design system foram alinhados ao estado real.
5. **P1 — preload desktop baixava em breakpoints indevidos:** o uso anterior
   de preload prioritário foi removido. A hero agora usa `picture` nativo,
   fontes WebP diretas e `fetchpriority="high"`, sem preload de imagem no
   documento.
6. **P2 — capturas tinham dimensão/codec inconsistentes:** desktop e mobile
   foram recapturados com clip explícito e normalizados para PNG real. Os
   arquivos finais foram verificados em 1680 × 950 e 390 × 844 pixels.

Não há achado P0, P1 ou P2 aberto nesta passagem.

## Validação técnica

- `npm test`: 6/6.
- `npm run typecheck`: passou.
- `npm run lint`: passou.
- `npm run build`: passou; 16 páginas estáticas geradas.
- `git diff --check`: passou.
- Nenhum endpoint, backend, auth, banco, webhook, RAG, Docker, credencial,
  serviço externo ou deploy foi adicionado.

## Refinamento visual solicitado em 26 de julho de 2026

- Sidebar desktop reduzida para 56 px; monograma superior removido; navegação
  centralizada e rodapé reservado a idioma e saída.
- Tooltips e ícones foram reduzidos sem remover nomes acessíveis ou foco.
- Home usa capas maiores que exibem somente imagem/placeholder. Badge verde ou
  vermelho fica no canto superior esquerdo; título e metadados não aparecem
  dentro da capa.
- Produtos, Asistente de relaciones, Perfil e Administración começam no topo.
- Detalhes de produto também foram alinhados ao topo e usam Bebas Neue.
- Botões, selects, segmentados, trilhos, chat e módulos administrativos usam
  estados customizados coerentes de hover, focus, pressed e disabled.
- Seletor local oferece ES, PT e EN, com ES como padrão.

Evidências novas:

- `docs/evidence/gate3-home-sidebar-cards-desktop.png` — PNG 1440 × 900.
- `docs/evidence/gate3-home-sidebar-cards-mobile.png` — PNG 390 × 844.
- `docs/evidence/gate3-home-cards-reference-comparison.png` — comparação
  conjunta da referência mais recente e da implementação.
- `docs/evidence/gate3-products-controls-desktop.png` — PNG 1440 × 900.
- `docs/evidence/gate3-ai-header-controls-desktop.png` — PNG 1440 × 900.
- `docs/evidence/gate3-product-detail-refactor-desktop.png` — PNG 1440 × 900.
- `docs/evidence/gate3-product-detail-refactor-mobile.png` — PNG 390 × 844.

Verificações desta passagem: fonte calculada como Bebas Neue nos títulos;
seletor de idioma altera `html[lang]` e os textos localizados; controles nativos
de seleção ficam dentro de `SelectControl`; páginas revisadas não apresentam
overflow nos viewports registrados. Não houve erro de aplicação no console; o
único aviso observado foi o reload completo do Fast Refresh durante a própria
edição em modo desenvolvimento.

## Revisão tipográfica sem serifas — 26 de julho de 2026

- Bodoni Moda foi removida do layout e deixou de ser carregada pelo frontend.
- Títulos de seção, feedback, capa, modal, leitor PDF, painel relacionado,
  chat, estado bloqueado da IA, perfil, administração e wordmarks compactos
  usam Bebas Neue.
- Source Sans 3 permanece somente em texto corrido, controles e metadados para
  não comprometer a leitura.
- A busca estática em `apps/web/src` não encontrou referência ativa a
  `serif`, `Times New Roman`, `Bodoni` ou `--font-bodoni-moda`.
- A inspeção das fontes calculadas no navegador passou em detalhe de produto,
  catálogo, IA, perfil e administração. Todas as rotas apresentaram apenas
  Bebas Neue e Source Sans 3, com zero elemento visível usando a família
  removida ou fallback serifado.

## Deduplicação dos cards de Productos — 26 de julho de 2026

Fonte visual:
`/var/folders/pl/7jlgb9_s1413_b0bhb05p3qm0000gn/T/TemporaryItems/NSIRD_screencaptureui_5CadtW/Screenshot 2026-07-26 at 22.09.16.png`
(1362 × 1174 px).

Implementação:
`docs/evidence/gate3-products-card-deduplication.png`
(930 × 1300 px), capturada na rota `/productos`, viewport CSS 431 × 492,
estado `Catálogo`, com scroll vertical em 620 px.

Comparação normalizada:
`docs/evidence/gate3-products-card-deduplication-comparison.png`
(1875 × 1000 px). As duas fontes foram normalizadas para 1000 px de altura,
preservando a proporção, e colocadas lado a lado. O recorte é o alvo completo
desta revisão pontual; não foi necessária uma região adicional.

### Histórico da correção

1. **P1 — metadados duplicados no card do catálogo:** a capa apresentava tipo e
   título, e o corpo externo repetia os mesmos textos. Isso aumentava
   artificialmente a altura do card e prejudicava a leitura do catálogo.
2. **Correção:** `ProductCover` recebeu um contrato explícito para omitir seus
   detalhes. `ProductCard` usa esse modo por padrão em `/productos`; os trilhos
   da Home preservam o badge interno e o modal preserva a capa detalhada.
3. **Pós-correção:** a captura mostra somente o placeholder visual dentro da
   capa e uma única ocorrência de tipo, título, estado e progresso abaixo. O
   snapshot semântico também registra uma única ocorrência do nome por card.

### Superfícies revisadas

- Tipografia: hierarquia externa preservada, sem título concorrente na capa.
- Espaçamento: a capa volta a ser um slot visual 3:4 contínuo.
- Cores: superfícies e estados sem alteração.
- Imagem: placeholder Phosphor preservado e centralizado.
- Conteúdo: tipo e título aparecem uma única vez por produto.

Por solicitação explícita do usuário, nenhum teste, lint, typecheck ou build foi
executado nesta passagem.

## Capas reais e estado visual bloqueado — 27 de julho de 2026

- As cinco fontes PNG 1500 × 2000 foram convertidas para WebP com qualidade 90
  e inspecionadas visualmente.
- O peso total caiu de aproximadamente 13 MB para 1,1 MB, sem artefatos
  aparentes nas capas.
- Home e `/productos` passaram a usar o catálogo canônico com as cinco capas.
- No estado passivo, capas bloqueadas são exibidas em preto e branco, com
  luminosidade e opacidade reduzidas.
- Hover e foco por teclado restauram a imagem original; badge e metadados não
  perdem contraste.
- A capa do modal bloqueado permanece com cor e luminosidade normais.

Por solicitação explícita do usuário, nenhum teste, lint, typecheck ou build foi
executado nesta passagem.

## Coração da VUELVE IA e cabeçalho — 26 de julho de 2026

- Esferas vermelhas removidas e substituídas por coração com superfície,
  borda, brilho e estados coerentes com os novos controles.
- Batimento e anel de pulso implementados em CSS; ambos são removidos com
  `prefers-reduced-motion`.
- Chip `Acceso mock` movido para uma faixa própria acima do canvas.
- `Nueva conversación` confirmado a 21 px da borda direita do chat no desktop;
  no mobile permanece no canto direito em formato somente ícone.
- Desktop e mobile 390 × 844 inspecionados sem colisões ou overflow da página.

Por solicitação explícita do usuário, nenhum teste, lint, typecheck ou build foi
executado nesta passagem.

## Modal bloqueado com capa somente visual — 26 de julho de 2026

Fonte visual:
`/var/folders/pl/7jlgb9_s1413_b0bhb05p3qm0000gn/T/TemporaryItems/NSIRD_screencaptureui_RZ7g5v/Screenshot 2026-07-26 at 22.09.52.png`
(1536 × 1024 px).

Implementação:
`docs/evidence/gate3-locked-modal-image-only.png`
(950 × 1250 px), capturada na rota `/productos`, viewport CSS 1440 × 900,
estado do modal da `Guía complementaria de ejemplo` aberto.

Comparação normalizada:
`docs/evidence/gate3-locked-modal-image-only-comparison.png`
(2239 × 1000 px). As duas fontes foram normalizadas para 1000 px de altura e
colocadas lado a lado.

### Histórico da correção

1. **P1 — capa duplicava conteúdo e rótulo técnico aparecia no modal:** a
   coluna esquerda repetia tipo e título, enquanto
   `Producto bloqueado · simulación` adicionava linguagem interna ao conteúdo.
2. **Correção:** o modal passou `showDetails={false}` para `ProductCover` e o
   eyebrow técnico foi removido.
3. **Pós-correção:** a coluna esquerda contém somente o placeholder da imagem.
   O conteúdo direito começa diretamente pelo título do produto. O snapshot
   semântico não contém o rótulo removido nem texto dentro da imagem.

### Superfícies revisadas

- Tipografia: título principal preservado em Bebas Neue; rótulo removido.
- Espaçamento: coluna esquerda permanece preenchida pelo slot visual.
- Cores: modal, CTA e nota informativa sem alteração.
- Imagem: placeholder Phosphor centralizado, sem texto adjacente.
- Conteúdo: nome do produto aparece somente no painel direito.

Por solicitação explícita do usuário, nenhum teste, lint, typecheck ou build foi
executado nesta passagem.

## Auditoria de controles — 26 de julho de 2026

- Home: CTAs, controles dos trilhos, cards acionáveis e sidebar revisados.
- Productos: seletor customizado, cards acionáveis, estados vazio/erro e modal
  bloqueado revisados.
- Detalhe: retorno e download simulado revisados.
- IA: acesso mock, histórico, novo chat, seletor de estado, retry e envio
  revisados.
- Perfil: seletor de estado, papel segmentado, idioma e ações revisados.
- Administración: bloqueio de member e seis módulos acionáveis revisados.
- Sidebar: navegação, idioma ES/PT/EN, tooltips e saída revisados.
- Não restam elementos `select` nativos nas rotas inspecionadas.
- A listbox respondeu a ArrowDown, Home/End e Escape, restaurando o foco ao
  gatilho. Em 390 × 844, os seletores ocupam a largura disponível sem overflow.
- O console do navegador não registrou erro de aplicação.

Por solicitação explícita do usuário, nenhum teste, lint, typecheck ou build foi
executado nesta auditoria.

final result: passed

## VUELVE IA e seletor de idioma — 26 de julho de 2026

Referência de implementação inspecionada:
`/Users/mateusmpz/code/Vertical Estate/Apps/vertical-state-os-app/src/components/reports-ai/`.

### Alterações visuais

- Removidos kicker, título e subtítulo externos de `/ia`.
- Chat convertido em canvas central único com orb, sugestões, bubble do membro,
  resposta da IA, composer e botão de nova conversa.
- Thinking reproduzido como processamento visual local em três etapas, seguido
  por resposta fixa após 2,4 segundos.
- Página bloqueada no viewport; somente mensagens podem rolar internamente e a
  scrollbar é ocultada.
- Gatilho de idioma alinhado ao contêiner de 40 × 40 px dos demais ícones.
- Tooltip de idioma dispensado no `pointerdown` e no clique antes de abrir a
  listbox.

### Inspeção manual

- Desktop: chat central sem sobreposição entre `Acceso mock` e `Nueva
  conversación`.
- Mobile 390 × 844: `body.scrollHeight` e
  `document.documentElement.scrollHeight` iguais a `innerHeight` (844 px).
- Interação: sugestão cria bubble, apresenta thinking e retorna resposta fixa.
- Idioma: listbox ES/PT/EN abre com opção atual marcada e sem tooltip
  persistente; a seleção fecha o menu e mantém o tooltip dispensado.
- Limite do gate: nenhuma chamada externa, backend, API, modelo, memória, RAG ou
  persistência foi adicionada.

Por solicitação explícita do usuário, nenhum teste, lint, typecheck ou build foi
executado nesta passagem.

---

## Prediagnóstico vertical do quiz — 29 de julho de 2026

- Fonte visual: `/var/folders/pl/7jlgb9_s1413_b0bhb05p3qm0000gn/T/codex-clipboard-18bd3695-cadf-49a9-a259-c7ddf23df89a.png`.
- Implementação verificada em `http://127.0.0.1:3001/quiz`, estado de prediagnóstico em espanhol.
- Relatório detalhado: `docs/evidence/quiz-prediagnosis-design-qa.md`.
- Comparação conjunta: `docs/evidence/quiz-prediagnosis-comparison.png`.
- Resultado: composição vertical de 510 px no desktop e 370 px no mobile, sem overflow horizontal; CTA testado até a próxima etapa.

final result: passed
