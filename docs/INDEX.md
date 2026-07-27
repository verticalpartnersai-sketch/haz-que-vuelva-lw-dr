# Índice da documentação

Este é o ponto de entrada canônico da documentação do HAZ QUE VUELVA. Antes de
alterar um gate, leia este índice, o checklist e o documento específico da fase.

## Ordem de leitura

1. [Produto](PRODUCT.md)
2. [Arquitetura](ARCHITECTURE.md)
3. [System design](SYSTEM-DESIGN.md)
4. [Design system](DESIGN-SYSTEM.md)
5. [Contratos de componentes](COMPONENT-CONTRACTS.md)
6. [Navegação](NAVIGATION.md)
7. [Especificação frontend](FRONTEND-SPEC.md)
8. [Implementação do frontend](FRONTEND-IMPLEMENTATION.md)
9. [Implementação do backend](BACKEND-IMPLEMENTATION.md)
10. [VUELVE IA](VUELVE-IA-FUTURE.md)
11. [Privacidade, segurança e auditoria](PRIVACY-SECURITY-AUDIT.md)
12. [Integrações](INTEGRATIONS-FUTURE.md)
13. [Rastreabilidade Oracle](ORACLE-TRACEABILITY.md)
14. [Pesquisa e fontes](RESEARCH.md)
15. [Checklist mestre](PROJECT-CHECKLIST.md)

## Estado

- Gates 1 e 2: concluídos.
- Gates 3 e 4: frontend aprovado pelo usuário e preservado em commit próprio.
- Gate 5: backend autorizado e em implementação incremental.
- Integrações reais, dados reais, infraestrutura e deploy continuam bloqueados
  pelos respectivos pré-requisitos.
- As notas Oracle foram ingeridas como contexto e rastreadas sem liberar gates
  posteriores.

## Regra de precedência

O documento específico é canônico para seu contrato. O
`PROJECT-CHECKLIST.md` registra apenas o estado comprovado da execução; ele não
substitui os requisitos detalhados.
