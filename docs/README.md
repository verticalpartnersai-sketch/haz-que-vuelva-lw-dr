# Documentação HAZ QUE VUELVA

O índice canônico passou a ser [INDEX.md](INDEX.md). Este arquivo é mantido como
ponte para links anteriores.

Este diretório é a fonte de verdade do produto. Antes de iniciar qualquer fase,
leia este índice e o checklist mestre.

## Ordem de leitura

1. [Produto](PRODUCT.md): escopo, terminologia, papéis, jornadas e pendências.
2. [Arquitetura](ARCHITECTURE.md): módulos, limites e direção de dependências.
3. [System design](SYSTEM-DESIGN.md): domínios, confiança, dados e fluxos futuros.
4. [Design system](DESIGN-SYSTEM.md): linguagem visual, tokens e acessibilidade.
5. [Contratos de componentes](COMPONENT-CONTRACTS.md): composição, estados,
   semântica e responsividade.
6. [Navegação](NAVIGATION.md): mapa de telas, rotas propostas e permissões.
7. [Especificação frontend](FRONTEND-SPEC.md): telas estáticas do próximo gate.
8. [Implementação do frontend](FRONTEND-IMPLEMENTATION.md): rotas, mocks,
   validações e evidências do Gate 3.
9. [Implementação do backend](BACKEND-IMPLEMENTATION.md): módulos, flags,
   evidências locais e bloqueios externos.
10. [VUELVE IA](VUELVE-IA-FUTURE.md): experiência, pipeline e limites.
11. [Privacidade, segurança e auditoria](PRIVACY-SECURITY-AUDIT.md): gate de
    dados reais, isolamento, retenção e exclusão.
12. [Integrações futuras](INTEGRATIONS-FUTURE.md): fornecedores previstos e
    contratos ainda pendentes.
13. [Rastreabilidade Oracle](ORACLE-TRACEABILITY.md): decisões incorporadas,
    pendências e conflitos.
14. [Pesquisa e fontes](RESEARCH.md): protocolo Exa e decisões sustentadas.
15. [Checklist mestre](PROJECT-CHECKLIST.md): estado comprovado e gates.

## Estado atual

- Gate 1: **concluído**.
- Gate 2: **concluído**.
- Gates 3 e 4: **frontend aprovado e preservado em commit próprio**.
- Frontend do produto: rotas e interações estáticas implementadas em
  `apps/web`, com mocks explícitos e sem serviços externos.
- Gate 5: **backend autorizado e em implementação incremental**.
- Integrações externas, dados reais e infraestrutura continuam desligados.
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
| Semântica e comportamento de componentes | `COMPONENT-CONTRACTS.md` |
| Rotas, papéis e transições | `NAVIGATION.md` |
| Aceite do frontend estático | `FRONTEND-SPEC.md` |
| Estado da implementação frontend | `FRONTEND-IMPLEMENTATION.md` |
| Estado da implementação backend | `BACKEND-IMPLEMENTATION.md` |
| Experiência e pipeline futuros da VUELVE IA | `VUELVE-IA-FUTURE.md` |
| Privacidade, segurança, retenção e auditoria | `PRIVACY-SECURITY-AUDIT.md` |
| Fronteiras das integrações futuras | `INTEGRATIONS-FUTURE.md` |
| Ingestão e precedência das notas Oracle | `ORACLE-TRACEABILITY.md` |
| Fontes externas e decisões atuais | `RESEARCH.md` |
| Estado e gates | `PROJECT-CHECKLIST.md` |

Documentos derivados devem apontar para a fonte canônica, não redefinir o
contrato com significado diferente.
