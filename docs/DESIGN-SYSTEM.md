# Design system

## Status

Especificação provisória para validação. A composição vem da referência
cinematográfica enviada, sem copiar Netflix, logotipos, textos, imagens ou
assets. O asset da hero e a identidade final continuam pendentes.

## Direção

- Tom: cinematográfico, editorial, reservado e premium.
- Shell: preto/carvão, densidade controlada e alto contraste.
- Conteúdo: hero horizontal dominante e trilhos de capas editoriais.
- Marca: vermelho guia ação, seleção e destaques sem dominar cada componente.
- Diferenciação: tipografia editorial grande, superfícies quentes e linguagem
  emocional, evitando aparência corporativa fria.
- Evitar: gradiente roxo genérico, cards SaaS, vidro excessivo e efeitos sem
  função.

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

## Tokens provisórios

Os valores abaixo são ponto de partida para o gate frontend, não identidade
final aprovada.

### Cor de marca

| Token | Valor provisório | Uso |
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

### Superfícies e texto

| Token | Valor provisório | Uso |
|---|---:|---|
| `surface.canvas` | `#070707` | Fundo principal |
| `surface.shell` | `#0D0D0E` | Sidebar e navegação |
| `surface.default` | `#151517` | Cards e painéis |
| `surface.elevated` | `#1D1D20` | Modal e popover |
| `surface.hover` | `#252529` | Hover neutro |
| `border.subtle` | `#302D2D` | Divisor padrão |
| `border.strong` | `#494344` | Limite enfatizado |
| `text.primary` | `#F7F4F3` | Texto principal quente |
| `text.secondary` | `#C8C0BE` | Texto secundário |
| `text.muted` | `#9B9290` | Metadados |
| `text.disabled` | `#8A8381` | Conteúdo desabilitado |
| `text.inverse` | `#140607` | Texto escuro sobre fundo claro |

### Estados semânticos

| Token | Valor provisório | Uso |
|---|---:|---|
| `state.selectedBg` | `rgba(229,72,77,.14)` | Fundo selecionado |
| `state.selectedBorder` | `brand.500` | Limite ou indicador selecionado |
| `state.focus` | `brand.300` | Anel de foco de 2 px |
| `state.disabledBg` | `surface.elevated` | Controle desabilitado |
| `state.disabledText` | `text.disabled` | Texto desabilitado |
| `state.errorBg` | `#2B1114` | Fundo de erro |
| `state.errorText` | `#FF8589` | Texto de erro |
| `state.errorBorder` | `brand.700` | Borda de erro |
| `state.success` | `#7FC295` | Confirmação |
| `state.warning` | `#E3B35C` | Atenção não destrutiva |
| `state.info` | `#82A7E8` | Informação neutra |

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
| `text.disabled` / `surface.elevated` | `4.52:1` |

As razões devem ser verificadas novamente na implementação real. Nenhuma
informação depende exclusivamente de cor.

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

### Tipografia

- `font.display`: serif editorial de alto contraste; família final `PENDENTE`.
- `font.body`: sans humanista legível; família final `PENDENTE`.
- `font.mono`: somente dados técnicos administrativos.
- Hero desktop: `clamp(3.5rem, 7vw, 6.5rem)`.
- Hero mobile: `clamp(2.75rem, 13vw, 4rem)`.
- Corpo mínimo: `1rem` com line-height de `1.5`.
- Texto auxiliar mínimo: `0.75rem`; não reduzir para compensar espaço.

Não carregar fonte externa antes de licença e arquivos serem aprovados.

### Espaçamento

Escala base de 4 px:

`4, 8, 12, 16, 24, 32, 48, 64, 96`.

- Gutter mobile: 16 px.
- Gutter desktop: 24–32 px.
- Distância entre seções: 64–96 px.
- Alvo interativo mínimo: 44 × 44 px.

### Bordas, raios e sombras

- Linha padrão: 1 px com `border.subtle`.
- Cards editoriais: raio de 0–4 px.
- Modal e navegação mobile: raio de 16–20 px.
- Sombra baixa: `0 12px 36px rgba(0,0,0,.28)`.
- Sombra modal: `0 28px 80px rgba(0,0,0,.55)`.
- Overlay da hero: gradiente escuro horizontal e inferior para legibilidade.

## Estados

| Estado | Tratamento |
|---|---|
| Disponível | Capa integral, texto principal e ação clara |
| Bloqueado | Capa atenuada, ícone/copy de bloqueio e CTA no modal |
| Carregando | Skeleton sem layout shift |
| Vazio | Explica por que não há conteúdo e qual o próximo passo |
| Erro | Mensagem segura, ação de tentar novamente e código de correlação |
| Desabilitado | Contraste suficiente e explicação acessível |
| Foco | Anel de 2 px com `state.focus` e offset |

## Componentes reutilizáveis

### Shell

- Sidebar estreita no desktop.
- Ícone, tooltip e rótulo acessível para cada destino.
- `Administración` existe somente para admin.
- `Cerrar sesión` fixo no rodapé.
- No mobile, navegação vira dock inferior ou painel equivalente.

### Hero

- Largura total disponível.
- Não envolver em card central ou limitar a uma coluna estreita.
- Wordmark no topo.
- Conteúdo alinhado à esquerda.
- Slot de imagem configurável.
- Placeholder neutro enquanto o asset estiver ausente.
- Overlay garante leitura em qualquer imagem aprovada.
- Gradiente inferior permite a transição para o primeiro trilho sem corte duro.

### Card de produto

- Proporção editorial recomendada: 3:4.
- Capa, nome, categoria opcional e estado.
- Variante disponível e variante bloqueada.
- Nunca usa `Curso` no texto.
- Trilho horizontal preserva parte do próximo card como pista de continuidade.

### Modal bloqueado

- Capa, nome, descrição curta e CTA Perfect Pay.
- Foco preso no modal.
- Escape e botão explícito fecham.
- Retorno de foco ao card de origem.
- URL externa identificada de forma acessível.

### Detalhe de produto

- Conteúdo principal à esquerda.
- Leitor PDF embutido na página.
- Download separado e claramente rotulado.
- Painel direito condicional.
- Comentários ausentes quando a feature flag estiver desligada.

### Chat IA

- Identidade própria; não copiar UI do ChatGPT.
- Lista de conversas futura, conversa atual, composer e estados de resposta.
- Estado bloqueado explica requisito sem revelar regra sensível.
- Resposta suporta loading, erro, retry e limite atingido.

## Movimento

- Duração curta: 140–180 ms.
- Entrada de modal: até 220 ms.
- Usar opacity e transform; evitar animações contínuas.
- Respeitar `prefers-reduced-motion`.
- Nenhuma animação bloqueia leitura ou ação.

## Responsividade

| Faixa | Comportamento |
|---|---|
| `< 480 px` | Uma coluna, hero alta, cards em trilho com 72–84vw |
| `480–767 px` | Uma coluna ampla, dock mobile |
| `768–1199 px` | Sidebar e conteúdo; painel lateral pode colapsar |
| `≥ 1200 px` | Sidebar, hero ampla e detalhe em duas colunas |

Evitar breakpoints baseados em modelos específicos de aparelho.

## Acessibilidade

- Alvo: WCAG 2.2 AA.
- Ordem de foco acompanha a ordem visual.
- Todo ícone interativo tem nome acessível.
- Tooltips não são a única forma de identificar ação.
- Modal usa `role="dialog"` e `aria-modal="true"`.
- Leitor PDF oferece fallback de download.
- Contraste de texto normal mínimo 4.5:1.
- Estados adquirido/bloqueado usam texto e ícone, não só cor.
- Navegação e trilhos funcionam por teclado.
- Zoom a 200% não perde conteúdo nem ação.

Fontes normativas e decisões sustentadas estão registradas em
[Pesquisa e fontes](RESEARCH.md#acessibilidade).
