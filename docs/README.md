# Documentação HAZ QUE VUELVA

Este diretório é a fonte de verdade do produto. Antes de iniciar qualquer fase,
leia este índice e o checklist mestre.

## Ordem de leitura

1. [Produto](PRODUCT.md): escopo, terminologia, papéis, jornadas e pendências.
2. [Arquitetura](ARCHITECTURE.md): módulos, limites e direção de dependências.
3. [System design](SYSTEM-DESIGN.md): domínios, confiança, dados e fluxos futuros.
4. [Design system](DESIGN-SYSTEM.md): linguagem visual, tokens e acessibilidade.
5. [Navegação](NAVIGATION.md): mapa de telas, rotas propostas e permissões.
6. [Especificação frontend](FRONTEND-SPEC.md): telas estáticas do próximo gate.
7. [Pesquisa e fontes](RESEARCH.md): protocolo Exa e decisões sustentadas.
8. [Checklist mestre](PROJECT-CHECKLIST.md): estado comprovado e gates.

## Estado atual

- Gate 1: **concluído**.
- Próximo gate: aguarda autorização explícita para validar system design e
  design system.
- Código existente: scaffold padrão do Next.js em `apps/web`.
- Frontend do produto: não iniciado.
- Backend, agente Python, Docker, banco e integrações: congelados.
- Deploy: proibido até autorização explícita.

## Regras de manutenção

- Uma decisão só vira requisito quando estiver registrada nestes documentos.
- Itens desconhecidos permanecem como `PENDENTE`; não usar valores fictícios.
- A interface pública é escrita em espanhol.
- Documentação técnica pode permanecer em português.
- Ao mudar requisito, atualizar primeiro o documento específico e depois o
  checklist.
- Nenhum gate seguinte começa sem conclusão registrada do gate atual.
- Pesquisar com Exa MCP antes de decisões atuais de API, segurança, integração,
  biblioteca ou provedor e registrar fontes no documento técnico.

## Documento canônico por contrato

| Contrato | Fonte canônica |
|---|---|
| Escopo, linguagem e jornadas | `PRODUCT.md` |
| Módulos e dependências | `ARCHITECTURE.md` |
| Confiança, dados e integrações futuras | `SYSTEM-DESIGN.md` |
| Tokens e componentes visuais | `DESIGN-SYSTEM.md` |
| Rotas, papéis e transições | `NAVIGATION.md` |
| Aceite do frontend estático | `FRONTEND-SPEC.md` |
| Fontes externas e decisões atuais | `RESEARCH.md` |
| Estado e gates | `PROJECT-CHECKLIST.md` |

Documentos derivados devem apontar para a fonte canônica, não redefinir o
contrato com significado diferente.
