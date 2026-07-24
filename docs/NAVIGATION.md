# Mapa de navegação

## Rotas propostas

Nenhuma rota abaixo está implementada ou aprovada como URL definitiva.

```mermaid
flowchart TD
  Root["/"] --> Inicio["Inicio"]
  Root --> Products["/productos"]
  Products --> Product["/productos/[slug]"]
  Root --> AI["/ia"]
  Root --> Profile["/perfil"]
  Root --> Admin["/administracion"]
  Admin --> AdminProducts["Productos"]
  Admin --> AdminContent["Contenidos y archivos"]
  Admin --> AdminMembers["Miembros e invitaciones"]
  Admin --> AdminAccess["Accesos"]
  Admin --> AdminPurchases["Compras y eventos"]
  Admin --> AdminAI["Configuración de IA"]
```

## Navegação principal

| Item | `member` | `admin` | Comportamento |
|---|---:|---:|---|
| `Inicio` | Sim | Sim | Home com hero e trilhos |
| `Productos` | Sim | Sim | Catálogo completo |
| `IA` | Sim | Sim | Chat ou estado bloqueado por entitlement |
| `Perfil` | Sim | Sim | Dados e preferências |
| `Administración` | Não | Sim | Shell administrativo |
| `Cerrar sesión` | Sim | Sim | Ação fixa no rodapé |

No desktop, usar sidebar vertical estreita. No mobile, adaptar para dock inferior
ou painel que preserve rótulos acessíveis.

## Fluxo de produto

```mermaid
flowchart TD
  Card["Card de Producto"] --> Access{"Entitlement?"}
  Access -->|Sim| Detail["Detalle del Producto"]
  Access -->|Não| Modal["Modal de Producto Bloqueado"]
  Modal --> Checkout["CTA externo Perfect Pay"]
  Detail --> Reader["Lector PDF embutido"]
  Detail --> Download["Descargar PDF"]
  Detail --> Related{"Há itens relacionados?"}
  Related -->|Sim| Side["Painel lateral"]
  Related -->|Não| NoSide["Layout sem painel"]
```

## Fluxo da IA

```mermaid
flowchart TD
  AIEntry["IA"] --> Entitlement{"Acesso à IA?"}
  Entitlement -->|Não| Locked["Estado bloqueado"]
  Entitlement -->|Sim| Chat["Chat"]
  Chat --> Empty["Conversa vazia"]
  Chat --> Thinking["Gerando resposta"]
  Chat --> Error["Erro recuperável"]
  Chat --> Limit["Limite atingido"]
```

No gate frontend, todos os estados usam mocks explícitos e nenhuma chamada
externa.

## Administração

O gate frontend terá apenas estrutura estática para validar arquitetura de
informação. Operações, formulários conectados, upload e dados reais ficam
proibidos até o backend ser aprovado.

## Regras de transição

- Produto bloqueado abre modal sem alterar a rota.
- Produto disponível navega para o detalhe.
- Fechar modal devolve foco ao card.
- Painel lateral não reserva espaço quando não houver itens.
- Comentários não aparecem quando a flag estiver desligada.
- Rota administrativa nunca aparece para `member`.
- Acesso direto a rota futura deverá ser autorizado no servidor, não só oculto
  na navegação.
