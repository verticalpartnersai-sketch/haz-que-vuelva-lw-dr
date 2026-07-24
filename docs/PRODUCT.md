# Produto

## Visão

HAZ QUE VUELVA será uma área privada para entregar produtos digitais vendidos
pela Perfect Pay. Cada membro enxerga todos os produtos do catálogo, mas acessa
somente aquilo que uma compra ou concessão administrativa autorizar. Convite
ativa uma conta; não concede produto por si só.

A experiência pública é inteiramente em espanhol e trata cada oferta como
`Producto`, nunca como curso. O catálogo pode conter produto principal, order
bumps e upsells.

## Objetivos

- Centralizar produtos adquiridos, PDFs e anexos em uma experiência responsiva.
- Tornar explícita a diferença entre produto disponível e bloqueado.
- Revogar o acesso correto quando uma compra for cancelada, reembolsada ou
  sofrer chargeback.
- Oferecer IA premium somente a quem possuir o entitlement correspondente.
- Dar à administração controle auditável sobre catálogo, conteúdo, membros,
  convites, compras, acessos e eventos.

## Papéis

| Papel | Responsabilidade |
|---|---|
| `member` | Consumir produtos autorizados, usar IA quando liberada e gerenciar o próprio perfil |
| `admin` | Operar catálogo, conteúdo, membros, permissões, compras, eventos, limites e configuração da IA |

MFA de administrador é requisito antes da abertura pública.

## Terminologia da interface

| Conceito técnico | Texto em espanhol |
|---|---|
| Página inicial | `Inicio` |
| Catálogo | `Productos` |
| Produto adquirido | `Disponible` ou `Adquirido` conforme o contexto |
| Produto sem acesso | `Bloqueado` |
| Perfil | `Perfil` |
| Administração | `Administración` |
| Sair | `Cerrar sesión` |
| Download | `Descargar PDF` |

Evitar `Curso`, `Mis cursos` e equivalentes em toda a interface.

## Escopo da primeira entrega funcional

### Membro

- Shell responsivo com sidebar compacta no desktop e adaptação mobile.
- Home cinematográfica com hero configurável e trilhos de produtos.
- Estados adquirido e bloqueado nos cards.
- Modal informativo para produto bloqueado com CTA externo de compra.
- Detalhe do produto adquirido com PDF embutido e download autorizado.
- Painel lateral de módulos, aulas ou itens somente quando houver conteúdo.
- Perfil.
- Chat de IA protegido por entitlement.

### Administração

- Esqueleto navegável no gate de frontend.
- Funcionalidades reais somente após definição e aprovação do backend.
- No produto final: catálogo, conteúdos, arquivos, membros, acessos manuais,
  convites, compras, eventos, limites e configuração da IA.

### Conteúdo

- Primeiro formato: e-books PDF e anexos.
- Vídeo: fora da primeira entrega.
- Comentários: somente atrás de feature flag até existir política de moderação.

## Jornadas principais

### Produto adquirido

1. Membro abre `Inicio` ou `Productos`.
2. Card autorizado apresenta estado disponível.
3. Clique abre a página do produto.
4. A página mostra título e conteúdo principal.
5. PDF é lido em container embutido, nunca em modal.
6. Download só ocorre após autorização server-side no produto final.
7. Itens relacionados aparecem no painel direito apenas quando existirem.

### Produto bloqueado

1. Membro abre um card bloqueado.
2. Modal mostra capa, descrição e CTA.
3. CTA abre o checkout externo Perfect Pay daquele produto.
4. Somente webhook aprovado concede o entitlement correspondente.

### IA premium

1. Membro abre `IA`.
2. Interface verifica o estado de acesso.
3. Sem entitlement, apresenta bloqueio e orientação segura.
4. Com entitlement, abre chat próprio.
5. No produto final, cada resposta usa conhecimento global aprovado e memória
   exclusiva daquele membro.

## Fora de escopo até autorização

- Banco, autenticação, RLS e migrações.
- Webhooks e qualquer chamada à Perfect Pay.
- Supabase, R2, Resend e Supermemory.
- Agente Python, RAG e chamadas a modelos.
- Docker de produção, VPS, Cloudflare e deploy.
- Dados reais, credenciais e importação de conteúdo.

## Pendências do usuário

- `PENDENTE`: domínio definitivo.
- `PENDENTE`: códigos, preços, nomes e links de checkout dos produtos.
- `PENDENTE`: qual produto concede acesso à IA.
- `PENDENTE`: conteúdos, PDFs, capas e documentos de conhecimento.
- `PENDENTE`: asset final da hero e arquivos oficiais da marca.
- Baseline tipográfica do Gate 2: `Bodoni Moda` + `Source Sans 3`, ambas OFL
  1.1. Arquivos tipográficos oficiais da marca, se existirem, podem motivar
  revisão documentada.
- `PENDENTE`: modelo de IA, orçamento e limite de mensagens.
- `PENDENTE`: WhatsApp de suporte.
- `PENDENTE`: política de moderação dos comentários.
