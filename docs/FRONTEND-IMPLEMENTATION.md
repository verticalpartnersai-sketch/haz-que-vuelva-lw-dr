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
| `/ia` | Chat disponível/bloqueado e estados simulados |
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

- shell preto profundo e rail lateral fixo de 72 px;
- wordmark HAZ QUE VUELVA dominante e copy compacta à esquerda;
- vermelho puro/intenso, sem rosa ou magenta como cor principal;
- hero larga com placeholder abstrato e scrims fortes;
- primeiro trilho sobre a transição inferior da hero;
- capas verticais densas, seis completas no viewport de referência e recorte
  perceptível da próxima capa;
- controles de deslocamento sem autoplay e foco preservado;
- dock mobile fixo e trilho horizontal com pista do próximo card.

A referência gerada e a imagem original foram usadas somente para composição,
densidade, escala, contraste e atmosfera. Nenhuma imagem, marca, texto, capa ou
asset foi incorporado ao produto.

## Mocks e estados

- Produtos disponíveis navegam para detalhe; bloqueados abrem modal.
- O estado de acesso ainda não resolvido renderiza skeleton não interativo.
- O CTA de oferta e o download apenas exibem confirmação simulada.
- Comentários usam `featureFlags.comments = false` e não aparecem no DOM.
- IA cobre vazio, conversa, pensando, erro recuperável e limite, além do
  bloqueio de acesso e do estado `unknown` fail-closed.
- Perfil cobre pronto, carregando e erro recuperável.
- O papel admin é uma alternância local sem autenticação ou autorização real.
- Administração troca módulos localmente, sem formulários ou dados conectados.

## Evidência visual

- [Home desktop — 1680 × 950](evidence/gate3-home-desktop.png)
- [Home mobile — 390 × 844](evidence/gate3-home-mobile.png)

## Validação

Executado com sucesso:

- `npm test`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- `git diff --check`.

Validação em navegador real:

- desktop 1680 × 950 e mobile 390 × 844 sem overflow da página;
- reflow a 320 CSS px e texto a 200%;
- modal com foco inicial, contenção, Escape e retorno ao disparador;
- tooltip abre por hover/foco, fecha por Escape e pode reabrir;
- controles do trilho permanecem montados e preservam foco nos limites;
- `prefers-reduced-motion` remove deslocamento do hover;
- estados de IA e Perfil percorridos;
- zero erros ou avisos no console;
- requisições observadas somente para o servidor Next local.

## Revisão independente

Duas revisões independentes verificaram especificação, acessibilidade e
fronteiras do gate. Os achados materiais foram corrigidos: nome/estado acessível
dos cards, foco estável dos trilhos, semântica e Escape dos tooltips, movimento
reduzido, alvo mínimo, estados de IA e Perfil, navegação secundária do admin,
feedback de rail vazio e consumo real da feature flag de comentários.

## Lacunas deliberadas

- asset final da hero, capas, nomes, preços e códigos reais permanecem pendentes;
- checkout, download, PDF e envio de chat são apenas simulações;
- não há backend, auth, banco, pagamento, RAG, e-mail ou armazenamento;
- a próxima ação autorizada é somente a revisão visual do usuário.
