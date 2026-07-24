# Especificação do frontend estático

## Gate

Gate 3 autorizado explicitamente em 24 de julho de 2026. A autorização cobre
somente o frontend estático descrito aqui. Gate 4, backend, integrações,
infraestrutura, credenciais e deploy permanecem bloqueados.

Implementação técnica concluída em 24 de julho de 2026 e registrada em
[Implementação do frontend](FRONTEND-IMPLEMENTATION.md). A passagem ao Gate 4
depende de aprovação visual explícita do usuário.

O frontend será inteiramente estático, em espanhol, com mocks explicitamente
marcados. Não haverá endpoints, banco, auth, pagamentos, RAG ou chamadas
externas.

## Contratos obrigatórios

O Gate 3 deverá implementar sem redefinir localmente:

- tokens e fundamentos de [Design system](DESIGN-SYSTEM.md);
- semântica, estados e responsividade de
  [Contratos de componentes](COMPONENT-CONTRACTS.md);
- hierarquia e transições de [Mapa de navegação](NAVIGATION.md);
- fronteiras modulares de [Arquitetura](ARCHITECTURE.md).

Qualquer incompatibilidade descoberta durante a implementação volta primeiro à
documentação e ao checklist.

## Dados mock

Os mocks devem cobrir cenários, não fingir dados finais:

- Membro padrão.
- Admin para validar navegação condicional.
- Produto adquirido com PDF placeholder.
- Produto adquirido com e sem itens relacionados.
- Produto bloqueado com checkout fictício não navegável.
- IA liberada e IA bloqueada.
- Lista vazia e estados de erro simulados.

Nomes devem indicar placeholder, por exemplo `Producto de ejemplo`. Não inventar
preço, código Perfect Pay, domínio, asset ou credencial.

## Telas

### Inicio

- Shell preto profundo com experiência reconhecível de catálogo audiovisual
  premium, sem copiar marca ou assets da referência.
- Rail lateral muito estreito, fixo e predominantemente preto.
- Hero larga, dominante, com slot de imagem e gradientes fortes de leitura.
- Wordmark HAZ QUE VUELVA no topo.
- Copy compacta sobreposta à esquerda.
- Primeiro trilho denso na transição inferior da hero e outros trilhos abaixo.
- Exibir todos os produtos mock na home, incluindo cenários de produto
  principal, order bump e upsell.
- Cards verticais em proporção editorial e alta densidade.
- Próximo card parcialmente visível quando houver overflow horizontal.

### Productos

- Catálogo de produto principal, order bumps e upsells.
- Filtros apenas se houver necessidade validada; não inventar taxonomia.
- Card distingue disponível e bloqueado com texto, ícone e tratamento visual.
- Estado vazio e loading simulados.

### Modal de produto bloqueado

- Capa placeholder.
- Nome e descrição mock.
- CTA externo visualmente presente, mas sem checkout real.
- Fechamento por botão, backdrop e Escape.
- Focus trap e retorno de foco.

### Detalle del Producto

- Título e conteúdo principal.
- Leitor PDF placeholder dentro da página.
- Botão `Descargar PDF` simulado.
- Painel lateral somente quando houver itens.
- Variante sem painel.
- Comentários controlados por flag mock desligada por padrão.

### IA

- Visual conversacional próprio.
- Histórico lateral ou adaptação mobile.
- Composer.
- Estados vazio, pensando, resposta, erro e limite.
- Variante bloqueada por entitlement mock.
- Nenhum envio real.

### Perfil

- Identidade, e-mail e preferências como dados mock.
- Troca de e-mail aparece somente como fluxo visual.
- Sem formulários conectados.

### Administración

- Visível somente no cenário admin.
- Dashboard e navegação estrutural.
- Seções: produtos, conteúdo, membros, acessos, compras/eventos e IA.
- Tabelas e formulários apenas como esqueletos estáticos.

## Critérios de aceite do gate frontend

- Todo texto visível está em espanhol.
- Nenhuma ocorrência de `Curso` ou `Cursos` como nome de produto.
- Nenhuma requisição de dados ou integração externa.
- Mocks estão isolados em módulo próprio.
- Desktop e mobile foram inspecionados visualmente.
- Navegação funciona por teclado.
- Modal mantém foco corretamente.
- Estados de produto e IA são compreensíveis sem depender de cor.
- Hero funciona sem asset final.
- Fonte é auto-hospedada com licença incluída e sem chamada runtime externa.
- Página reflow a 320 CSS px e suporta resize de texto a 200%.
- Movimento reduzido remove deslocamentos não essenciais.
- Trilhos não têm autoplay e continuam operáveis por teclado.
- Foco não é encoberto por sidebar, dock ou overlay.
- Comentários somem completamente com flag desligada.
- Administração não aparece no cenário member.
- Usuário revisa e aprova antes de qualquer backend.
