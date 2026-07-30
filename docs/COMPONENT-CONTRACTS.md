# Contratos de componentes

## Status

Contrato de composição definido no Gate 2. Este documento descreve API
conceitual, semântica, estados e responsividade; não autoriza implementação.
Nomes de propriedades são descritivos e podem ser adaptados ao código sem
alterar o comportamento contratado.

## Regras transversais

1. Componente não decide entitlement, papel, compra ou permissão.
2. Componente de domínio recebe estado já resolvido e o apresenta.
3. Elemento interativo usa semântica nativa sempre que possível.
4. Não aninhar botão em link, link em botão ou múltiplas ações numa superfície
   clicável sem regiões distintas.
5. `disabled`, `loading`, `error`, `empty` e `locked` são estados explícitos,
   não combinações implícitas de classes.
6. Todo componente aceita nome acessível, foco visível e conteúdo em espanhol.
7. Tokens vêm de [Design system](DESIGN-SYSTEM.md); componente não cria cor,
   sombra, raio, espaçamento ou duração local.
8. Variante visual nunca muda o significado sem mudar também texto, ícone ou
   semântica.

## Modelo comum de estado

### Estado interativo

`idle → hover → pressed → idle` descreve ponteiro; `focus-visible` pode coexistir
com qualquer estado. `disabled` e `loading` impedem nova ativação. Loading
preserva largura e rótulo acessível.

### Estado assíncrono

| Estado | Conteúdo obrigatório | Ação permitida |
|---|---|---|
| `idle` | Conteúdo estável | Ações normais |
| `loading` | Skeleton ou indicador + contexto | Cancelar, se aplicável |
| `success` | Resultado e confirmação proporcional | Continuar |
| `empty` | Motivo compreensível + próximo passo possível | CTA somente quando existe |
| `error` | Mensagem segura + retry quando recuperável | Tentar novamente |

### Estado de acesso

| Estado | Significado visual | Autoridade |
|---|---|---|
| `available` | Produto pode ser aberto | Valor mock no Gate 3; servidor futuro |
| `locked` | Produto é conhecido, mas não autorizado | Valor mock no Gate 3; servidor futuro |
| `unknown` | Estado ainda não resolvido | Exibir loading; nunca presumir acesso |

`locked` não é `disabled`: o card continua acionável para explicar o produto em
um modal. `unknown` nunca deve piscar como disponível.

## Primitivas

### `Button`

**Responsabilidade:** disparar uma ação local.

| Contrato | Valores |
|---|---|
| Variantes | `primary`, `secondary`, `ghost`, `danger` |
| Tamanhos | `sm`, `md`, `lg` |
| Estados | `idle`, `loading`, `disabled` |
| Slots | `leadingIcon`, rótulo, `trailingIcon` |

- Usa elemento `button` e `type="button"` por padrão.
- `primary` aparece uma vez por região de decisão.
- Em loading, mantém o rótulo no nome acessível e usa `aria-busy`.
- `disabled` exige motivo visível ou texto associado quando o usuário puder
  razoavelmente tentar a ação.
- Ação que navega usa `Link`, não `Button` estilizado como link.

### `Link`

**Responsabilidade:** navegar para rota ou origem externa.

- Link externo identifica a mudança de contexto no texto ou nome acessível.
- Não abrir nova aba por padrão. Se o checkout exigir nova aba, avisar antes e
  não remover o controle do usuário.
- Links em parágrafos são sublinhados; cor isolada não basta.
- Link de card envolve somente a região principal e não contém outro controle.

### `IconButton`

**Responsabilidade:** ação compacta com ícone.

- Caixa visual pode usar `size.control.sm`, mas alvo total mínimo é
  `size.target`.
- Exige `accessibleName`; tooltip é reforço visual, não nome único.
- Ícone decorativo interno não é anunciado separadamente.
- Variantes: `neutral`, `brand`, `danger`; tamanhos `md` e `lg`.

### `StatusBadge`

**Responsabilidade:** comunicar estado curto, nunca ação.

- Variantes: `available`, `locked`, `success`, `warning`, `error`, `info`.
- Sempre combina texto e, quando útil, ícone.
- Não recebe foco e não usa apenas cor.
- Textos de produto preferidos: `Disponible` e `Bloqueado`.

### `Tooltip`

**Responsabilidade:** ampliar o significado de controle compacto no desktop.

- Abre em hover e foco; fecha com `Escape` ou somente quando foco e ponteiro
  deixarem tanto o disparador quanto o tooltip.
- O ponteiro pode atravessar e permanecer sobre o tooltip sem fazê-lo sumir.
- Não contém botão, link ou conteúdo necessário para concluir tarefa.
- Foco permanece no elemento de origem.
- Não substitui rótulos no mobile; a navegação mobile apresenta texto visível.
- Usa o padrão de tooltip somente quando o suporte testado for suficiente;
  fallback é texto visível.

### `Field`

**Responsabilidade:** agrupar rótulo, controle, ajuda e erro.

- Rótulo visível é obrigatório; placeholder não é rótulo.
- Ordem: label, controle, ajuda/contador e mensagem de erro.
- Erro associa mensagem ao campo e não apaga a ajuda ainda necessária.
- Tamanhos permitem 200% de texto sem corte.
- No Gate 3, campos administrativos e perfil são somente visuais e não enviam
  dados.

### `Skeleton`

**Responsabilidade:** reservar a geometria do conteúdo durante loading.

- Imita blocos, não texto falso.
- Não pulsa com alto contraste nem por mais de uma região simultaneamente.
- Região pai informa loading; cada skeleton não recebe nome acessível.
- Respeita `prefers-reduced-motion`.

### `FeedbackPanel`

**Responsabilidade:** apresentar estado vazio, bloqueado, erro ou confirmação.

- Slots: ícone, título, descrição, ação primária opcional e ação secundária.
- Erro recuperável oferece retry; erro persistente oferece orientação segura.
- Estado bloqueado não revela regra interna, identificador ou dado sensível.
- Só usa `role="alert"` para mensagem urgente surgida durante interação.

## Navegação e shell

### `AppShell`

**Entradas conceituais:** `activeDestination`, `navigationItems`, `children`.

- Desktop contém `SideRail`, conteúdo principal e link de pular para conteúdo.
- Mobile contém cabeçalho compacto, conteúdo e `MobileDock`.
- `main` existe uma única vez e recebe foco pelo skip link.
- O shell não filtra papel por conta própria; recebe itens já permitidos.
- Sidebar ou dock nunca encobrem foco; conteúdo aplica scroll padding.

### `SideRail`

- Largura contratada: `shell.rail.width`.
- Ordem superior: wordmark reduzido, `Inicio`, `Productos`, `IA`, `Perfil` e
  `Administración` apenas no cenário admin.
- `Cerrar sesión` fica fixo na região inferior.
- Cada destino é link com ícone, nome acessível e tooltip.
- Destino atual usa `aria-current="page"`, indicador vermelho e mudança de
  peso/forma.
- Rail pode permanecer sticky somente a partir de `bp.md`.

### `MobileDock`

- Itens persistentes: `Inicio`, `Productos`, `IA`, `Perfil`.
- Cada item mostra ícone e texto; alvo mínimo `size.target`.
- `Perfil` é link para `/perfil`; nunca atua simultaneamente como disparador de
  modal.
- No cenário admin, `Administración` e `Cerrar sesión` ficam na seção de conta
  de `ProfileScaffold`, evitando seis destinos espremidos.
- Altura mínima `shell.dock.minHeight` mais safe area.
- Não usa rolagem horizontal nem esconde o item ativo.

### `ProfileScaffold`

**Entradas conceituais:** `profile`, `preferences`, `role`, `state`.

- Regiões: heading `Perfil`, resumo de identidade, e-mail, preferências e ações
  de conta.
- No Gate 3, dados são mocks visivelmente fictícios e campos não enviam dados.
- Estados: `ready`, `loading`, `error`; troca de e-mail é somente fluxo visual.
- Desktop usa coluna de leitura de até `profile.mainColumns`; mobile empilha em
  ordem DOM.
- No mobile, ações de conta incluem `Administración` somente para admin e
  `Cerrar sesión` ao final. No desktop, essas ações permanecem no `SideRail` e
  não precisam ser duplicadas.
- Heading, rótulos e mensagens de erro seguem a hierarquia da página; nenhum
  dado depende de placeholder.

## Conteúdo editorial

### `Hero`

**Entradas conceituais:** `eyebrow?`, `title`, `description`, `sources`,
`primaryAction?`, `secondaryAction?`.

- `title` é texto real e único `h1`; wordmark não substitui heading.
- Imagem é decorativa quando não adiciona informação; slot aceita `alt` somente
  quando houver conteúdo relevante.
- `sources` fornece as composições WebP aprovadas para mobile, tablet, desktop e
  ultra-wide; o fallback preserva dimensões intrínsecas.
- Scrims inline e inferior são obrigatórios.
- A copy ocupa no máximo `hero.copy.maxColumns` e
  `content.reading.maxWidth` para descrição.
- Nenhum texto ou CTA fica incorporado à imagem.
- Não há vídeo, autoplay ou parallax.

### `ProductRail`

**Entradas conceituais:** `title`, `products`, `ariaLabel`, `emptyState?`.

- É uma seção nomeada contendo lista horizontal; não é carrossel
  auto-rotativo.
- Scroll por gesto/trackpad é nativo. Botões anterior/próximo permanecem
  montados enquanto existe overflow, usam `aria-disabled` nos limites e
  deslocam aproximadamente uma viewport do trilho.
- Tab percorre controles e cards em ordem DOM; setas do teclado não são
  sequestradas fora de um padrão composto.
- Próximo card parcialmente visível sugere continuidade.
- Com zero produtos, renderiza `FeedbackPanel`, não um rail vazio.

### `ProductCard`

**Entradas conceituais:** `name`, `cover`, `accessState`, `category?`,
`progress?`, `visualVariant?`.

- Proporção da mídia: `productCard.aspectRatio`.
- A variante de catálogo `streaming` integra nome, categoria e estado à região
  inferior da capa para preservar densidade e ritmo. O nome acessível inclui
  produto e estado; nenhum significado fica escondido em `role="img"`.
- Outras variantes podem manter o nome fora da capa quando a composição pedir
  mais espaço editorial.
- `available` usa link para detalhe.
- `locked` usa botão que abre `ProductLockedDialog`.
- `unknown` usa skeleton não interativo.
- Capa ausente usa placeholder abstrato com o nome; não inventar ilustração.
- Estado aparece em texto e ícone. Progresso só existe quando houver dado real
  ou mock explícito.
- Hover eleva discretamente; foco não depende da elevação.

### `ProductLockedDialog`

**Entradas conceituais:** `product`, `checkoutState`, `onClose`.

- Usa dialog modal nomeado pelo título do produto.
- Desktop: largura máxima `dialog.product.maxWidth`. Compacto: ocupa a tela
  útil.
- Ao abrir, foco inicial vai para o título estático quando houver conteúdo
  longo; esse título recebe `tabindex="-1"`. Caso contrário, foco vai para o
  primeiro controle seguro.
- `Tab` e `Shift+Tab` permanecem no modal; `Escape`, botão fechar e backdrop
  fecham. Backdrop não fecha durante uma ação futura irreversível.
- Ao fechar, foco volta ao card de origem.
- CTA do Gate 3 é visual e não navegável; o rótulo deixa explícito que é uma
  simulação.
- No produto real, checkout é link externo cadastrado, nunca URL fornecida pelo
  cliente em tempo de interação.

### `ProductDetailLayout`

- Regiões: cabeçalho, conteúdo principal, `PdfReaderFrame`, ação de download e
  `RelatedItemsPanel` opcional.
- Com painel: grade `productDetail.mainColumns` /
  `productDetail.asideColumns` a partir de `bp.lg`.
- Sem painel: conteúdo expande; não reserva coluna vazia.
- Abaixo de `bp.lg`, painel vira seção após o conteúdo.
- Comentários não montam DOM quando a feature flag está desligada.

### `PdfReaderFrame`

- Container embutido, nunca modal.
- Título e descrição identificam o documento.
- Placeholder do Gate 3 informa que não há PDF real.
- Sempre oferece ação separada `Descargar PDF`, simulada no Gate 3.
- Produto futuro oferece fallback quando o leitor nativo falhar; o leitor não
  remove autorização de download.
- Barra de controles não cria botões falsos sem função.

### `RelatedItemsPanel`

- Recebe lista não vazia; com zero itens, o componente não é renderizado.
- Heading participa da hierarquia da página.
- Item atual usa texto e indicador, não só vermelho.
- Em mobile, itens continuam após o leitor na ordem de leitura.

## Conversação

### `AIChatShell`

**Entradas conceituais:** `accessState`, `conversationState`,
`conversationList?`.

- `locked` renderiza `FeedbackPanel`; chat e composer não são montados.
- `available` contém histórico, conversa e `AIComposer`.
- Desktop pode usar histórico lateral; mobile abre histórico em painel.
- Identidade visual segue o produto e não copia ChatGPT.
- Ordem DOM: título, conversa, status da resposta e composer.

### `AIMessage`

- Variantes: `member`, `assistant`, `systemNotice`.
- Nome/autor e conteúdo são perceptíveis sem depender do alinhamento.
- Mensagem da assistente suporta texto longo, listas e referências futuras.
- Loading é um status separado; não injeta reticências como conteúdo final.
- Erro de uma resposta oferece retry associado àquela mensagem.

### `AIComposer`

- Textarea com rótulo acessível e botão `Enviar`.
- `Enter` envia somente quando isso estiver explicitamente testado; `Shift+Enter`
  cria linha. No Gate 3, envio é simulado.
- Estado limite exibe mensagem antes de desabilitar.
- Não depende de placeholder para instruir uso.
- Crescimento possui altura máxima e não encobre mensagens focadas.

## Administração

### `AdminScaffold`

- Só existe para o cenário mock `admin` ou para uma sessão real validada como
  `admin`.
- Contém navegação secundária para produtos, conteúdos/arquivos, membros,
  acessos, compras/eventos e IA.
- Com as flags desligadas, tabelas e formulários permanecem esqueletos sem
  chamadas externas.
- Com `FEATURE_ADMIN` e `FEATURE_CONTENT` ligadas, o módulo `Contenido` aceita
  um PDF privado de até 12 MiB e 300 páginas, anuncia sucesso/erro e nunca
  transforma o estado visual em autorização.
- A publicação pede novamente a senha. A UI não persiste esse valor; o BFF
  emite cookie HttpOnly de cinco minutos e a RPC consome a autorização uma
  única vez. Erro de senha ou credencial expirada mantém o arquivo inativo.
- Os demais módulos continuam estruturais até seus casos de uso conectados
  serem implementados.
- Mobile prioriza lista/resumo; tabela larga pode ter região horizontal
  explicitamente nomeada, sem forçar a página inteira a rolar.

## Contrato de `Dialog`

Todo modal ou painel modal:

1. usa `role="dialog"` e `aria-modal="true"`;
2. possui nome por `aria-labelledby` para título visível ou `aria-label`;
3. usa `aria-describedby` somente para mensagem curta; conteúdo estrutural
   longo permanece navegável sem descrição agregada;
4. torna o restante da interface inerte;
5. define foco inicial conforme a tarefa; alvo estático recebe
   `tabindex="-1"`;
6. contém a navegação por Tab;
7. fecha por Escape quando seguro;
8. oferece botão de fechar visível;
9. devolve foco ao disparador ou a destino lógico existente;
10. ocupa a tela útil em largura compacta;
11. impede scroll do documento sem causar salto de layout;
12. não fica atrás de dock, toast ou teclado virtual.

## Matriz mínima do Gate 3

| Componente | Member | Admin | Mobile | Teclado | Estado mock |
|---|---:|---:|---:|---:|---|
| `AppShell` | Sim | Sim | Sim | Sim | papel |
| `Hero` | Sim | Sim | Sim | Sim | sem asset |
| `ProductRail` | Sim | Sim | Sim | Sim | cheio/vazio |
| `ProductCard` | Sim | Sim | Sim | Sim | disponível/bloqueado |
| `ProductLockedDialog` | Sim | Sim | Sim | Sim | checkout simulado |
| `ProductDetailLayout` | Sim | Sim | Sim | Sim | com/sem painel |
| `PdfReaderFrame` | Sim | Sim | Sim | Sim | placeholder |
| `AIChatShell` | Sim | Sim | Sim | Sim | liberado/bloqueado |
| `ProfileScaffold` | Sim | Sim | Sim | Sim | ready/loading/error |
| `AdminScaffold` | Não | Sim | Sim | Sim | estático |

## Fora deste gate

- Código React, CSS, testes ou Storybook.
- Escolha de biblioteca de componentes ou ícones.
- Dados, endpoint, autenticação, compra ou upload.
- Comportamento real de download, checkout ou IA.
- Implementação de foco; este documento somente define o aceite futuro.
