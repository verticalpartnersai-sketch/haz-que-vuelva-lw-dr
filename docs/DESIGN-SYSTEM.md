# Design system

## Status

Contrato visual v1 definido no Gate 2 para orientar o futuro frontend estático.
A composição vem da referência cinematográfica enviada, sem copiar Netflix,
logotipos, textos, imagens ou assets. O asset da hero e os arquivos oficiais da
marca continuam pendentes; sua chegada pode ajustar a direção por uma nova
decisão documentada, nunca silenciosamente no código.

## Direção

- Tom: cinematográfico, editorial, reservado e premium.
- Shell: preto/carvão, densidade controlada e alto contraste.
- Conteúdo: hero horizontal dominante e trilhos de capas editoriais.
- Marca: vermelho guia ação, seleção e destaques sem dominar cada componente.
- Diferenciação: tipografia editorial grande, superfícies quentes e linguagem
  emocional, evitando aparência corporativa fria.
- Evitar: gradiente roxo genérico, cards SaaS, vidro excessivo e efeitos sem
  função.

## Princípios

1. **Intimidade antes de espetáculo:** a interface deve parecer editorial,
   humana e emocional, não um painel corporativo.
2. **Conteúdo em primeiro plano:** fotografia, títulos e produtos recebem
   hierarquia; decoração nunca disputa com a leitura.
3. **Vermelho com propósito:** marca a ação ou o estado mais importante, não
   colore toda a superfície.
4. **Escuro com profundidade:** carvão, bordas quentes e sobreposições graduais
   substituem preto chapado repetido.
5. **Movimento sob controle:** transições explicam mudança de estado; não há
   autoplay, parallax ou animação ornamental contínua.
6. **Acessibilidade estrutural:** semântica, foco, reflow e nomes acessíveis
   fazem parte do contrato do componente.

## Arquitetura de tokens

Tokens têm três camadas:

1. **Primitivos:** valores crus, como `brand.600` ou `space.4`.
2. **Semânticos:** intenção independente do componente, como
   `action.primary.bg` ou `text.muted`.
3. **De componente:** exceções raras e locais, como `productCard.aspectRatio`.

Componentes consomem tokens semânticos. Cor hexadecimal, duração e sombra não
devem aparecer diretamente em componentes do Gate 3. Um novo valor começa como
token documentado; não se cria token para mascarar uma única inconsistência.

Tokens de componente referenciam camadas inferiores para cor, sombra, duração,
espaçamento reutilizável e estado. Podem possuir valor estrutural próprio
quando ele só tem sentido naquele contrato — por exemplo largura máxima de um
modal, proporção de uma capa ou número de colunas. Mesmo nesses casos, o valor
cru existe apenas na definição canônica do token; o componente consome o nome.

## Leitura da referência

A imagem original foi inspecionada diretamente. Somente estas abstrações de
composição podem orientar o projeto:

- Rail lateral preto muito estreito e visualmente separado do conteúdo.
- Estado ativo perceptível junto ao ícone, com tratamento original da marca.
- Hero ocupando toda a largura útil, sem aparência de card centralizado.
- Conteúdo da hero alinhado à esquerda sobre área de contraste controlado.
- Gradiente lateral e inferior que conecta imagem, texto e conteúdo abaixo.
- Primeiro trilho começando na transição inferior da hero.
- Capas verticais com ritmo horizontal e próxima capa parcialmente visível.
- Continuidade de outros trilhos abaixo da primeira dobra.

Não copiar a marca vermelha, logo, wordmark, nomes, descrições, imagem da hero,
capas, ícones, selos, tipografia proprietária ou qualquer outro asset observado.

## Tokens de cor

### Primitivos vermelhos

| Token | Valor | Uso |
|---|---:|---|
| `brand.50` | `#FFF1F1` | Fundo claro excepcional |
| `brand.100` | `#FFDCDD` | Destaque suave |
| `brand.200` | `#FFBABC` | Elemento decorativo |
| `brand.300` | `#FF9699` | Anel de foco |
| `brand.400` | `#FF7478` | Texto de marca sobre fundo escuro |
| `brand.500` | `#E5484D` | Marca e indicador selecionado |
| `brand.600` | `#C9313C` | Fundo da ação primária |
| `brand.700` | `#A9232F` | Hover da ação primária |
| `brand.800` | `#7F1822` | Active da ação primária |
| `brand.900` | `#4D0C12` | Superfície vermelha profunda |

### Primitivos neutros, feedback e alpha

| Token | Valor |
|---|---:|
| `neutral.0` | `#FFFFFF` |
| `neutral.50` | `#F7F4F3` |
| `neutral.300` | `#C8C0BE` |
| `neutral.500` | `#9B9290` |
| `neutral.600` | `#8A8381` |
| `neutral.650` | `#716869` |
| `neutral.700` | `#494344` |
| `neutral.750` | `#302D2D` |
| `neutral.800` | `#252529` |
| `neutral.850` | `#1D1D20` |
| `neutral.900` | `#151517` |
| `neutral.950` | `#0D0D0E` |
| `neutral.1000` | `#070707` |
| `neutral.ink` | `#140607` |
| `accent.success.500` | `#7FC295` |
| `accent.warning.500` | `#E3B35C` |
| `accent.info.500` | `#82A7E8` |
| `accent.error.bg` | `#2B1114` |
| `accent.error.text` | `#FF8589` |
| `alpha.transparent` | `transparent` |
| `alpha.black.72` | `rgba(0,0,0,.72)` |
| `alpha.canvas.96` | `rgba(7,7,7,.96)` |
| `alpha.canvas.18` | `rgba(7,7,7,.18)` |
| `alpha.brand.14` | `rgba(229,72,77,.14)` |

### Superfícies e texto

| Token | Referência | Uso |
|---|---|---|
| `surface.canvas` | `neutral.1000` | Fundo principal |
| `surface.shell` | `neutral.950` | Sidebar e navegação |
| `surface.default` | `neutral.900` | Cards e painéis |
| `surface.elevated` | `neutral.850` | Modal e popover |
| `surface.hover` | `neutral.800` | Hover neutro |
| `surface.scrim` | `alpha.black.72` | Bloqueio atrás de modal |
| `border.subtle` | `neutral.750` | Divisor padrão |
| `border.strong` | `neutral.700` | Limite enfatizado |
| `border.interactive` | `neutral.650` | Contorno necessário de controle |
| `text.primary` | `neutral.50` | Texto principal quente |
| `text.secondary` | `neutral.300` | Texto secundário |
| `text.muted` | `neutral.500` | Metadados |
| `text.disabled` | `neutral.600` | Conteúdo desabilitado |
| `text.inverse` | `neutral.ink` | Texto escuro sobre fundo claro |

### Estados semânticos

| Token | Valor | Uso |
|---|---:|---|
| `state.selectedBg` | `alpha.brand.14` | Fundo selecionado |
| `state.selectedBorder` | `brand.500` | Limite ou indicador selecionado |
| `state.focus` | `brand.300` | Anel de foco de 2 px |
| `state.disabledBg` | `surface.elevated` | Controle desabilitado |
| `state.disabledText` | `text.disabled` | Texto desabilitado |
| `state.errorBg` | `accent.error.bg` | Fundo de erro |
| `state.errorText` | `accent.error.text` | Texto de erro |
| `state.errorBorder` | `brand.600` | Borda de erro com contraste 3:1 |
| `state.success` | `accent.success.500` | Confirmação |
| `state.warning` | `accent.warning.500` | Atenção não destrutiva |
| `state.info` | `accent.info.500` | Informação neutra |

### Aliases semânticos

| Token | Referência | Regra |
|---|---|---|
| `action.primary.bg` | `brand.600` | Uma ação primária por região |
| `action.primary.fg` | `neutral.0` | Texto/ícone sobre ação primária |
| `action.primary.border` | `brand.600` | Limite primário |
| `action.primary.hover` | `brand.700` | Hover sem deslocar layout |
| `action.primary.active` | `brand.800` | Estado pressionado |
| `action.secondary.bg` | `surface.elevated` | Ação secundária neutra |
| `action.secondary.fg` | `text.primary` | Alto contraste |
| `action.secondary.border` | `border.interactive` | Limite identificável |
| `action.secondary.hover` | `surface.hover` | Hover secundário |
| `action.secondary.active` | `surface.default` | Pressionado secundário |
| `action.ghost.bg` | `alpha.transparent` | Sem superfície persistente |
| `action.ghost.fg` | `text.secondary` | Ação terciária |
| `action.ghost.border` | `alpha.transparent` | Sem limite persistente |
| `action.ghost.hover` | `surface.hover` | Hover terciário |
| `action.ghost.active` | `surface.default` | Pressionado terciário |
| `action.danger.bg` | `state.errorBg` | Ação destrutiva |
| `action.danger.fg` | `state.errorText` | Texto/ícone destrutivo |
| `action.danger.border` | `state.errorBorder` | Limite destrutivo |
| `action.danger.hover` | `brand.900` | Hover destrutivo |
| `action.danger.active` | `surface.canvas` | Pressionado destrutivo |
| `action.disabled.bg` | `state.disabledBg` | Superfície inativa |
| `action.disabled.fg` | `state.disabledText` | Conteúdo inativo |
| `action.disabled.border` | `border.subtle` | Limite inativo |
| `interactive.focus` | `brand.300` | Anel externo de 2 px |
| `interactive.selected` | `brand.500` | Indicador curto de seleção |
| `feedback.success.fg` | `state.success` | Confirmação |
| `feedback.success.bg` | `surface.elevated` | Fundo de confirmação |
| `feedback.warning.fg` | `state.warning` | Atenção |
| `feedback.warning.bg` | `surface.elevated` | Fundo de atenção |
| `feedback.error.fg` | `state.errorText` | Falha |
| `feedback.error.bg` | `state.errorBg` | Fundo de falha |
| `feedback.error.border` | `state.errorBorder` | Limite de falha |
| `feedback.info.fg` | `state.info` | Informação |
| `feedback.info.bg` | `surface.elevated` | Fundo informativo |

Loading conserva os tokens da variante e usa indicador em `currentColor`.
Disabled usa os três aliases `action.disabled.*`, foco usa
`interactive.focus` em todas as variantes e `IconButton` mapeia `neutral` para
secondary, `brand` para primary e `danger` para danger.

### Overlays da hero

O texto nunca depende da imagem para ter contraste. A hero combina:

- `hero.scrim.inline`: gradiente horizontal de `alpha.canvas.96` até
  `alpha.canvas.18`;
- `hero.scrim.block`: gradiente inferior de `alpha.transparent` até
  `surface.canvas`;
- `hero.placeholder`: composição abstrata de carvão, sem fotografia, pessoa,
  capa ou marca inventada.

Na implementação, a área real atrás de todo texto deve ser testada no ponto de
menor contraste. Se a imagem final não passar, aumenta-se o scrim; não se move
texto para uma área imprevisível.

### Contraste verificado

| Par | Razão |
|---|---:|
| `text.primary` / `surface.canvas` | `18.41:1` |
| `text.secondary` / `surface.canvas` | `11.26:1` |
| `text.muted` / `surface.canvas` | `6.63:1` |
| `brand.400` / `surface.canvas` | `7.69:1` |
| Branco / `brand.600` | `5.27:1` |
| Branco / `brand.800` | `10.21:1` |
| `state.focus` / `surface.canvas` | `9.66:1` |
| `state.errorText` / `state.errorBg` | `7.52:1` |
| `state.errorBorder` / `state.errorBg` | `3.34:1` |
| `text.disabled` / `surface.elevated` | `4.52:1` |
| `border.interactive` / `surface.default` | `3.37:1` |
| `border.interactive` / `surface.elevated` | `3.11:1` |
| `state.success` / `surface.default` | `8.73:1` |
| `state.warning` / `surface.default` | `9.44:1` |
| `state.info` / `surface.default` | `7.50:1` |

Os pares foram calculados em sRGB pela fórmula de luminância relativa da WCAG.
Devem ser verificados novamente no navegador, incluindo transparência,
gradientes e imagem real. Nenhuma informação depende exclusivamente de cor.

### Disciplina do vermelho

Usar vermelho em:

- CTA primário e ação de maior prioridade.
- Indicador do item ativo.
- Seleção, foco e destaques curtos.
- Estados de erro acompanhados de ícone e mensagem.
- Pequenos elementos de marca.

Não usar vermelho como fundo de todos os cards, em textos longos, em todas as
bordas ou em controles secundários. Conteúdo, navegação inativa e superfícies
permanecem neutros para que a cor de marca mantenha hierarquia.

## Tipografia

### Famílias

| Token | Família | Uso |
|---|---|---|
| `font.display` | `"Bodoni Moda", "Times New Roman", serif` | Hero e títulos editoriais curtos |
| `font.body` | `"Source Sans 3", "Segoe UI", sans-serif` | Interface e leitura |
| `font.mono` | `ui-monospace, "SFMono-Regular", monospace` | IDs e dados técnicos administrativos |

`Bodoni Moda` cria contraste editorial e emocional. `Source Sans 3` preserva
legibilidade de interface sem neutralizar a personalidade do display. Ambas
possuem licença SIL Open Font License 1.1 e cobertura Latin Extended. No Gate 3,
devem ser auto-hospedadas, com licença incluída e sem requisição runtime ao
Google Fonts.

Antes de integrar, validar no navegador:

- `ÁÉÍÓÚÜÑ áéíóúüñ ¿¡`;
- pesos 400, 500, 600 e 700 realmente usados;
- fallback sem mudança destrutiva de layout;
- `font-display: swap` e ausência de texto invisível.

### Escala

| Token | Tamanho / altura de linha | Peso | Uso |
|---|---|---:|---|
| `type.label.xs` | `0.75rem / 1rem` | 600 | Badge e metadado curto |
| `type.label.sm` | `0.875rem / 1.25rem` | 600 | Rótulo e botão compacto |
| `type.body.sm` | `0.875rem / 1.375rem` | 400 | Texto auxiliar |
| `type.body.md` | `1rem / 1.5rem` | 400 | Corpo padrão |
| `type.body.lg` | `1.125rem / 1.75rem` | 400 | Introdução |
| `type.title.sm` | `1.5rem / 1.875rem` | 600 | Título de card/painel |
| `type.title.md` | `2rem / 2.375rem` | 600 | Título de página |
| `type.title.lg` | `clamp(2.5rem, 5vw, 4rem) / .98` | 600 | Destaque editorial |
| `type.display` | `clamp(3rem, 7vw, 6.5rem) / .92` | 600 | Hero |

Regras:

- Texto corrido usa `font.body`, largura preferencial de `45–68ch` e alinhamento
  à esquerda; nunca justificar.
- `font.display` não é usado abaixo de `1.5rem` nem em parágrafos longos.
- Texto visível não fica abaixo de `0.75rem`.
- Não usar `vw` isolado para texto; todo tamanho fluido possui limites.
- Truncamento não pode esconder nome necessário; oferecer conteúdo completo
  por contexto visível ou nome acessível.

## Espaçamento e tamanho

Escala base de 4 px:

| Token | Valor |
|---|---:|
| `space.0` | `0` |
| `space.1` | `4px` |
| `space.2` | `8px` |
| `space.3` | `12px` |
| `space.4` | `16px` |
| `space.5` | `20px` |
| `space.6` | `24px` |
| `space.8` | `32px` |
| `space.10` | `40px` |
| `space.12` | `48px` |
| `space.16` | `64px` |
| `space.20` | `80px` |
| `space.24` | `96px` |

- `size.control.sm`: 40 px, somente quando o alvo total alcançar 44 px.
- `size.control.md`: 44 px.
- `size.control.lg`: 52 px.
- `size.target`: 44 × 44 px como meta do produto.
- Gutter varia de 16 a 48 px conforme a grade.
- Distância de seção varia de 48 a 96 px.

## Bordas, raios, elevação e camadas

| Token | Valor | Uso |
|---|---|---|
| `border.width.default` | `1px` | Linha e divisor |
| `border.width.focus` | `2px` | Anel de foco |
| `radius.none` | `0` | Trilho e mídia full bleed |
| `radius.xs` | `2px` | Capa editorial |
| `radius.sm` | `4px` | Card |
| `radius.md` | `8px` | Controle |
| `radius.lg` | `16px` | Painel mobile |
| `radius.xl` | `20px` | Modal |
| `radius.pill` | `999px` | Badge, nunca card |
| `shadow.raised` | `0 12px 36px rgba(0,0,0,.28)` | Card elevado |
| `shadow.overlay` | `0 20px 56px rgba(0,0,0,.42)` | Popover |
| `shadow.modal` | `0 28px 80px rgba(0,0,0,.55)` | Modal |

Camadas: `z.base=0`, `z.sticky=20`, `z.dock=30`, `z.popover=40`,
`z.scrim=50`, `z.modal=60`, `z.toast=70`. Elevação comunica sobreposição; não
substitui borda ou contraste.

### Tokens de componente e layout

| Token | Valor |
|---|---:|
| `shell.rail.width` | `72px` |
| `shell.dock.minHeight` | `64px` |
| `dialog.product.maxWidth` | `720px` |
| `productCard.aspectRatio` | `3 / 4` |
| `content.maxWidth` | `1600px` |
| `content.reading.maxWidth` | `68ch` |
| `hero.copy.maxColumns` | `7` |
| `productDetail.mainColumns` | `8` |
| `productDetail.asideColumns` | `4` |
| `profile.mainColumns` | `8` |

## Iconografia

- Grade visual de 24 px; glyph padrão de 20 px.
- Traço de 1.75–2 px, terminações simples e sem mistura de estilos.
- Variante preenchida apenas para estado selecionado quando a forma continuar
  reconhecível; erro/sucesso usam ícone mais texto.
- Ícone decorativo recebe tratamento equivalente a `aria-hidden`.
- Ícone interativo sempre pertence a `IconButton` com nome acessível.
- Não usar emoji como ícone de produto, navegação ou feedback.
- A biblioteca será escolhida e pesquisada no Gate 3; o contrato geométrico não
  depende de fornecedor.

## Estados

| Estado | Tratamento visual | Semântica/comportamento |
|---|---|---|
| Disponível | Capa integral e ação clara | Texto `Disponible` ou `Adquirido` |
| Bloqueado | Capa atenuada, cadeado e copy | Botão abre modal; nunca finge link disponível |
| Carregando | Skeleton estável | Região `aria-busy`; preservar dimensões |
| Vazio | Mensagem e próximo passo | Não renderizar tabela/trilho ornamental vazio |
| Erro | Fundo, ícone, mensagem e retry | Mensagem segura; foco quando bloquear fluxo |
| Desabilitado | Menor ênfase e cursor coerente | Motivo perceptível; não usar só opacidade |
| Foco | Anel externo de 2 px + offset de 2 px | Nunca encoberto por sidebar/dock |
| Selecionado | Indicador vermelho + peso/ícone | `aria-current` ou estado nativo apropriado |
| Hover | Elevação/contraste discreto | Não existe como requisito único de descoberta |
| Pressionado | Escurecimento e leve escala | Sem deslocar conteúdo adjacente |

## Componentes reutilizáveis

Primitivas, composição, estados, semântica e comportamento responsivo são
contratos canônicos em [Contratos de componentes](COMPONENT-CONTRACTS.md).
Features podem compor esses contratos, mas não alterar foco, semântica ou tokens
localmente.

## Movimento

| Token | Valor | Uso |
|---|---:|---|
| `motion.duration.instant` | `80ms` | Resposta pressionada |
| `motion.duration.fast` | `140ms` | Hover e foco |
| `motion.duration.normal` | `180ms` | Estado local |
| `motion.duration.deliberate` | `220ms` | Entrada de modal/painel |
| `motion.ease.standard` | `cubic-bezier(.2,0,0,1)` | Mudança de estado |
| `motion.ease.enter` | `cubic-bezier(0,0,.2,1)` | Entrada |
| `motion.ease.exit` | `cubic-bezier(.4,0,1,1)` | Saída |

- Animar somente `opacity` e `transform` quando possível.
- Hover de card pode usar `translateY(-2px)` e sombra, nunca zoom que corte texto.
- Hero e trilhos não avançam automaticamente.
- Não usar parallax, cursor customizado ou animação contínua.
- Com `prefers-reduced-motion: reduce`, remover deslocamento e reduzir
  transições não essenciais a `80ms` ou zero.
- Loading usa pulsação discreta sem flashes; texto de status permanece
  disponível.

## Grade e responsividade

| Token | Faixa | Colunas / gutter | Comportamento |
|---|---|---|---|
| `bp.base` | `320–479px` | 4 / 16px | Uma coluna; dock; card 76–84vw |
| `bp.sm` | `480–767px` | 4 / 20px | Uma coluna ampla; card 46–58vw |
| `bp.md` | `768–1023px` | 8 / 24px | Sidebar 72px; conteúdo fluido |
| `bp.lg` | `1024–1279px` | 12 / 32px | Detalhe pode ter painel lateral |
| `bp.xl` | `1280–1599px` | 12 / 40px | Hero ampla e rails densos |
| `bp.2xl` | `≥1600px` | 12 / 48px | Conteúdo interno limitado a 1600px |

- Hero e fundos podem ser full bleed; texto e controles respeitam a grade.
- Conteúdo não cria scroll horizontal de página a 320 CSS px; somente trilhos
  deliberadamente horizontais podem rolar no próprio eixo.
- Painel lateral do produto vira seção abaixo do conteúdo quando não houver
  largura útil.
- Dock mobile inclui safe area e `scroll-padding-bottom` para não esconder foco.
- Ordem visual nunca diverge da ordem do DOM.
- Breakpoints respondem a espaço de conteúdo, não a modelos de aparelho.

## Acessibilidade

- Alvo: WCAG 2.2 AA.
- Ordem de foco acompanha a ordem visual.
- Todo ícone interativo tem nome acessível.
- Tooltips não são a única forma de identificar ação.
- Modal usa `role="dialog"` e `aria-modal="true"`.
- Leitor PDF oferece fallback de download.
- Contraste de texto normal mínimo 4.5:1.
- Texto grande usa no mínimo 3:1; controles e indicadores necessários usam
  3:1 contra cores adjacentes.
- Estados adquirido/bloqueado usam texto e ícone, não só cor.
- Navegação e trilhos funcionam por teclado.
- Zoom e resize de texto a 200% não perdem conteúdo nem ação.
- A 320 CSS px, conteúdo reflow sem scroll em dois eixos; o trilho horizontal é
  exceção deliberada e contida.
- Sob override de espaçamento WCAG, conteúdo não corta nem sobrepõe.
- Sidebar, dock e overlays nunca encobrem totalmente o elemento focado.
- Foco de 2 px e contraste 3:1 é padrão interno inspirado no critério AAA
  `Focus Appearance`; a meta formal do produto permanece AA.
- Testar `forced-colors` sem remover outline, borda ou semântica nativos.

Fontes normativas e decisões sustentadas estão registradas em
[Pesquisa e fontes](RESEARCH.md#registro-de-fontes--gate-2).
