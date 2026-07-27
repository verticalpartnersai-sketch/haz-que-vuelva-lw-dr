# Implementação do frontend — Gate 3

## Estado

Frontend estático concluído tecnicamente em 24 de julho de 2026 e aguardando
aprovação visual explícita. Gate 4, backend, integrações, infraestrutura,
credenciais e deploy não foram iniciados.

## Execução local

```bash
cd apps/web
npm install
npm run dev
```

O Next.js usa a porta livre informada no terminal. Para reproduzir a validação
de produção deste gate:

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

## Rotas estáticas

| Rota | Conteúdo |
|---|---|
| `/` | Hero cinematográfica e trilhos densos de produtos |
| `/productos` | Catálogo com ready, loading, vazio e erro simulados |
| `/productos/[slug]` | Detalhe adquirido com PDF placeholder |
| `/ia` | VUELVE IA centralizada, acesso bloqueado e thinking local simulado |
| `/perfil` | Perfil e controle dos cenários member/admin |
| `/administracion` | Esqueleto e navegação secundária apenas no cenário admin |

Os slugs são gerados estaticamente a partir dos mocks. Não existem rotas de API.

## Estrutura

- `src/app`: composição de rotas e metadados.
- `src/features`: shell e módulos de home, produtos, IA, perfil e admin.
- `src/components`: ícones e tooltip acessível.
- `src/design-system`: tokens e CSS dividido por responsabilidade.
- `src/mocks`: única origem de produtos, membro, grupos e feature flags.
- `src/assets/fonts`: fontes auto-hospedadas e licenças OFL.
- `tests`: contratos estáticos estreitos do gate.

Cada arquivo de código permanece abaixo de 500 linhas.

## Correção visual da home

A direção editorial anterior foi descartada porque não reproduzia com clareza
o ritmo da referência. A home final adota:

- shell preto profundo e rail lateral fixo de 56 px, sem monograma superior;
- wordmark HAZ QUE VUELVA dominante e copy compacta à esquerda;
- vermelho puro/intenso, sem rosa ou magenta como cor principal;
- hero larga com fotografia aprovada e scrims restritos à legibilidade;
- primeiro trilho sobre a transição inferior da hero;
- capas verticais ampliadas, densas, com recorte perceptível da próxima capa;
- na Home, a capa mostra somente o slot visual e o badge de acesso no canto
  superior esquerdo; título e metadados continuam disponíveis no nome
  acessível e na página de catálogo;
- controles de deslocamento sem autoplay e foco preservado;
- dock mobile fixo e trilho horizontal com pista do próximo card.

O rail centraliza Inicio, Productos, IA, Perfil e Administración condicional;
idioma e saída ficam no rodapé. O seletor local inicia em espanhol e oferece
português e inglês. Cabeçalhos de páginas usam Bebas Neue empacotada pelo app,
assim como títulos editoriais internos, leitor, painéis e dados de destaque.
Source Sans 3 permanece apenas para textos corridos e controles. O frontend não
usa fontes serifadas.

Os seletores de estado e idioma usam uma listbox visual própria, sem depender
do menu nativo do sistema. O contrato inclui opção atual marcada, fechamento
por clique externo ou perda de foco, setas, Home/End, Escape e devolução do
foco ao gatilho. O gatilho de idioma usa o mesmo contêiner de 40 px, ícone,
borda, foco e estado pressionado dos demais itens da sidebar; seu tooltip é
dispensado no `pointerdown` antes da abertura da listbox. Botões de ação,
ícone, navegação, segmentados, chat e módulos administrativos compartilham
borda, elevação, foco, hover, pressed e disabled do mesmo sistema.

## VUELVE IA

A rota `/ia` foi refeita a partir dos padrões visuais observáveis do Oráculo em
`/relatorios` no Vertical State OS App, adaptados à identidade preto/carvão e
vermelho do HAZ QUE VUELVA. Foram reaproveitados os conceitos de canvas único,
orb, sugestões iniciais, bubble do membro, resposta leve da IA, composer
compacto e bloco de thinking com etapas. Nenhum hook, endpoint, cliente
Supabase, streaming, persistência ou contrato de backend foi copiado.

O kicker, o título `Asistente de relaciones` e o subtítulo externo foram
removidos. O chat ocupa o centro do viewport, enquanto `Acceso mock` permanece
como controle provisório. O envio cria somente uma transição local temporizada:
mensagem do membro, thinking por etapas e resposta fixa. A rolagem da página é
bloqueada; quando necessário, apenas a região interna de mensagens rola e sua
scrollbar permanece visualmente oculta.

O identificador visual da IA é um coração pulsante em superfície carvão, com
borda e brilho vermelhos alinhados aos novos botões. O coração aparece na
abertura, no cabeçalho, nas respostas e durante o thinking; movimento é
desativado com `prefers-reduced-motion`. `Acceso mock` ocupa uma faixa acima do
canvas para não disputar o cabeçalho, enquanto `Nueva conversación` permanece
alinhado ao extremo direito do chat e reduz para ícone no mobile.

A família fotográfica própria aprovada é servida em WebP por `picture`, com
fontes específicas para mobile, tablet, desktop e ultra-wide. As referências
externas foram usadas somente para composição, densidade, escala, contraste e
atmosfera; nenhuma marca, texto, capa ou asset da Netflix foi incorporado.

Arquivos versionados:

- `public/images/hero-haz-que-vuelva-mobile.webp` — 941 × 1672;
- `public/images/hero-haz-que-vuelva-tablet.webp` — 1448 × 1086;
- `public/images/hero-haz-que-vuelva-desktop.webp` — 1672 × 941;
- `public/images/hero-haz-que-vuelva-ultrawide.webp` — 1915 × 821.

Os PNGs de origem não são versionados. A conversão WebP usa qualidade 90,
subamostragem 4:4:4 e esforço 6. A comparação pixel a pixel registrou PSNR entre
44,26 e 45,50 dB; inspeção visual não encontrou artefatos aparentes em rosto,
mãos, taça, vinho ou gradientes.

A hero usa `picture` nativo e URLs WebP diretas. Não há preload de imagem no
documento: o navegador seleciona uma única fonte pelo breakpoint e prioriza a
imagem LCP com `fetchpriority="high"`. Isso evita que o fallback desktop seja
baixado junto da fonte mobile, tablet ou ultra-wide.

## Capas e catálogo de produtos

As cinco capas fornecidas pelo usuário foram convertidas de PNG 1500 × 2000
para WebP de alta qualidade e integradas ao catálogo estático com
`next/image`. Os arquivos finais somam aproximadamente 1,1 MB, contra cerca de
13 MB das origens, uma redução aproximada de 91%:

- `public/images/products/haz-que-vuelva.webp`;
- `public/images/products/21-mensajes-de-reconexion.webp`;
- `public/images/products/la-otra.webp`;
- `public/images/products/reconquista-30.webp`;
- `public/images/products/vuelve-ia.webp`.

As origens PNG não são versionadas. O catálogo usa os cinco produtos canônicos;
somente os estados de acesso continuam simulados durante o Gate 3. Capas
bloqueadas permanecem em preto e branco e com opacidade reduzida no estado
passivo, recuperando cor e luminosidade no hover ou foco por teclado.

## Mocks e estados

- Produtos disponíveis navegam para detalhe; bloqueados abrem modal.
- O estado de acesso ainda não resolvido renderiza skeleton não interativo.
- O CTA de oferta e o download apenas exibem confirmação simulada.
- Comentários usam `featureFlags.comments = false` e não aparecem no DOM.
- IA cobre vazio, conversa e pensando, além do bloqueio de acesso e do estado
  `unknown` fail-closed. Envio e processamento são simulações locais.
- Perfil cobre pronto, carregando e erro recuperável.
- O papel admin é uma alternância local sem autenticação ou autorização real.
- Administração troca módulos localmente, sem formulários ou dados conectados.

## Evidência visual

- [Home desktop com hero final — 1680 × 950](evidence/gate3-home-final-hero-desktop.png)
- [Home mobile com hero final — 390 × 844](evidence/gate3-home-final-hero-mobile.png)
- [Home com sidebar e capas revisadas — desktop 1440 × 900](evidence/gate3-home-sidebar-cards-desktop.png)
- [Home com capas revisadas — mobile 390 × 844](evidence/gate3-home-sidebar-cards-mobile.png)
- [Referência recente × Home revisada](evidence/gate3-home-cards-reference-comparison.png)
- [Productos com cabeçalho e controles revisados](evidence/gate3-products-controls-desktop.png)
- [Asistente de relaciones com cabeçalho e controles revisados](evidence/gate3-ai-header-controls-desktop.png)
- [Detalhe de produto revisado — desktop](evidence/gate3-product-detail-refactor-desktop.png)
- [Detalhe de produto revisado — mobile](evidence/gate3-product-detail-refactor-mobile.png)
- [Referência de composição × implementação desktop](evidence/gate3-home-reference-vs-implementation-desktop.png)
- [Comparação fonte × implementação desktop](evidence/gate3-home-source-vs-implementation-desktop.png)
- [Comparação fonte × implementação mobile](evidence/gate3-home-source-vs-implementation-mobile.png)
- [Relatório de design QA](../design-qa.md)

## Validação

Executado com sucesso:

- `npm test`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- `git diff --check`.

Validação em navegador real:

- desktop 1680 × 950 e mobile 390 × 844 sem overflow da página;
- `picture` seleciona mobile a 320/390 px, tablet a 768 px, desktop a 1680 px e
  ultra-wide a 1920 px;
- nenhuma imagem possui preload no documento e o fallback desktop não é
  solicitado nos outros breakpoints;
- capturas finais confirmadas como PNG real em 1680 × 950 e 390 × 844;
- reflow a 320 CSS px e texto a 200%;
- modal com foco inicial, contenção, Escape e retorno ao disparador;
- tooltip abre por hover/foco, fecha por Escape e pode reabrir;
- controles do trilho permanecem montados e preservam foco nos limites;
- `prefers-reduced-motion` remove deslocamento do hover;
- estados de IA e Perfil percorridos;
- zero erros ou avisos no console;
- requisições observadas somente para o servidor Next local.

Após a revisão visual do Oráculo, `/ia` foi inspecionada novamente em desktop
e 390 × 844: o documento permaneceu sem overflow vertical, o thinking avançou
para uma resposta fixa e a listbox de idioma abriu sem manter o tooltip. Por
solicitação do usuário, nenhum teste, lint, typecheck ou build foi executado
nessa passagem incremental.

## Revisão independente

Duas revisões independentes verificaram especificação, acessibilidade e
fronteiras do gate. Os achados materiais foram corrigidos: nome/estado acessível
dos cards, foco estável dos trilhos, semântica e Escape dos tooltips, movimento
reduzido, alvo mínimo, estados de IA e Perfil, navegação secundária do admin,
feedback de rail vazio e consumo real da feature flag de comentários.

## Lacunas deliberadas

- preços, códigos comerciais e mapeamentos de checkout permanecem pendentes;
- checkout, download, PDF e envio de chat são apenas simulações;
- não há backend, auth, banco, pagamento, RAG, e-mail ou armazenamento;
- a próxima ação autorizada é somente a revisão visual do usuário.
