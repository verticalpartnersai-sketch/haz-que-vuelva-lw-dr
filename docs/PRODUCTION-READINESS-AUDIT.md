# Auditoria de prontidão para produção

Data da evidência: 31 de julho de 2026
Commit da aplicação publicada: `0858252662a22cc682d010994715553581e794fa`
Commit da documentação auditada: `9e3d92450b649a82d1da7379a69b27c0b8484de7`

## Veredito

A infraestrutura pública está operacional e defensiva, mas o lançamento
comercial ainda não está 100% pronto. O quiz, os upsells, o login e os
contratos de backend estão publicados; falta provar o ciclo real que começa na
compra e termina no acesso ao conteúdo correto.

Não abrir vendas até concluir todos os itens P0 abaixo.

## Evidência comprovada

| Superfície | Estado comprovado |
| --- | --- |
| Git | o commit da aplicação está publicado e é ancestral da `main` auditada |
| Marketing | `https://hazquevuelva.site/quiz`, `/up1`, `/up2` e `/gracias` respondem 200 sem overflow em 390x844 e 1440x900 |
| Checkout | CTAs publicados apontam para os três redirecionadores Centerpag aprovados no código |
| Membros | sessão anônima é redirecionada para `/login`; `/healthz` responde `ready` |
| Agente | URL pública antiga responde 404; entrada declarada é o Service Binding privado |
| Supabase | 21 migrações aplicadas; cadastro público e login anônimo desabilitados |
| Catálogo | cinco produtos ativos no banco |
| Perfect Pay | cinco mapeamentos ativos: três produtos e dois order bumps com item exato |
| Webhook | smoke recorrente exige 401 para credencial inválida em probe não mutável e 413 acima de 64 KiB |
| CI | quatro jobs do workflow CI verdes no SHA auditado |
| Smoke | workflow recorrente cobre marketing, autenticação negativa, webhook e agente privado |
| Resend DNS | DKIM publicado; SPF e MX publicados em `send.mail.hazquevuelva.site`; DMARC `p=none` publicado no domínio raiz |

Versões Cloudflare verificadas:

- membros: `a800d459-5287-4505-ac81-faf64032aa13`;
- agente: `910ee45f-ac17-435b-819c-ee51beb68242`;
- marketing: `53f05580-111b-4ff5-bdf7-12da94078485`.

## Inventário real do banco

Consulta administrativa somente de contagem, sem expor dados pessoais:

| Recurso | Registros |
| --- | ---: |
| perfis | 0 |
| compras | 0 |
| itens de compra | 0 |
| concessões de acesso | 0 |
| itens de conteúdo no Supabase | 0 |
| arquivos de conteúdo no Supabase | 0 |
| documentos da IA | 0 |
| versões de prompt da IA | 0 |
| conversas da IA | 0 |
| jobs pendentes na outbox | 0 |

Esse inventário é esperado antes do lançamento, mas prova que nenhum fluxo
positivo real foi validado ainda.

Mapeamentos observados no catálogo remoto:

| Produto interno | Produto Perfect Pay | Correspondência |
| --- | --- | --- |
| `haz_que_vuelva` | `PPPBF7CC` | `*` |
| `21_mensajes` | `PPPBF7CC` | `item:PPPBF7EK` |
| `la_otra` | `PPPBF7CC` | `item:PPPBF7EL` |
| `reconquista_30` | `PPPBF7E4` | `*` |
| `vuelve_ia` | `PPPBF7E7` | `*` |

## P0 — bloqueia abrir vendas

### 1. Aprovação comercial da Perfect Pay

Os códigos e mapeamentos existem, porém a aprovação dos três produtos ainda
depende do painel Perfect Pay. Um checkout acessível não comprova que a venda,
o webhook e o pós-compra estão aprovados de ponta a ponta.

Aceite:

1. três produtos aprovados;
2. compra de teste autorizada do Haz Que Vuelva com cada order bump;
3. compra de teste de Reconquista 30 e VUELVE IA;
4. payloads reais redigidos arquivados como fixtures;
5. repetição do mesmo webhook comprovadamente idempotente;
6. cancelamento, reembolso e chargeback revogando apenas o produto correto.
7. configurar e provar o encadeamento pós-compra no painel: produto principal
   para `/up1`, Reconquista 30 para `/up2` e aceite ou recusa do VUELVE IA
   para `/gracias`;
8. confirmar com payload real quais parâmetros de venda e atribuição a Perfect
   Pay preserva entre as páginas. Os CTAs atuais abrem checkouts independentes,
   não uma compra one-click já comprovada.

### 2. Publicação do conteúdo real na área de membros

Os quatro PDFs editoriais em espanhol foram localizados no Oracle, otimizados
para web, validados e registrados no
[manifesto de conteúdo](evidence/content-release-manifest.md). O catálogo no
Supabase ainda tem `content_items` e `content_files` vazios. Uma compradora
poderia receber acesso ao produto e encontrar uma biblioteca sem material.

Aceite:

1. publicar os quatro PDFs do manifesto pelo fluxo administrativo;
2. confirmar títulos, capas e metadados em espanhol;
3. validar armazenamento privado, assinatura curta e watermark;
4. provar download de uma aluna autorizada e negação para outra conta;
5. testar arquivo inválido, expirado, removido e versão substituída.

### 3. Primeiro acesso e e-mail transacional

O segredo Resend e a outbox estão configurados, e os registros DNS essenciais
existem. Ainda não há prova de entrega real, criação de senha e primeiro login.

Aceite:

1. enviar convite a um destinatário autorizado;
2. confirmar entrega, idioma espanhol, links e expiração;
3. definir senha pelo link temporário;
4. comprovar que o convite não concede produto sem entitlement;
5. tratar bounce, duplicidade, reenvio e e-mail já cadastrado;
6. acompanhar a reputação do domínio com o DMARC já publicado em `p=none` e
   definir o critério de avanço para `quarantine` ou `reject`.

### 4. Administração real e MFA

Não existe usuária nem perfil no projeto. As proteções AAL2/TOTP foram
implementadas, mas nenhum primeiro admin completou o fluxo real.

Aceite:

1. convidar a conta administrativa nominal;
2. promovê-la pelo comando privado;
3. cadastrar TOTP e elevar a sessão a AAL2;
4. validar mutações administrativas autorizadas;
5. comprovar negação em AAL1 e para uma conta membro comum;
6. documentar recuperação segura do segundo fator.

### 5. VUELVE IA

`FEATURE_VUELVE_IA` e `FEATURE_GENERATION` continuam desligadas. Não há
documentos, prompt publicado nem conversa no banco. O último rollout atualizou
a borda do agente sem reconstruir a imagem do Container porque o Docker local
não estava disponível.

Aceite antes de habilitar:

1. aprovar base legal, consentimento, retenção e exclusão;
2. publicar documentos e prompt versionados;
3. reconstruir e publicar a imagem do Container;
4. validar binding, credencial inválida, limites e cancelamento;
5. testar isolamento entre duas usuárias;
6. configurar orçamento, alertas e limite diário;
7. executar geração real redigida e exclusão completa;
8. somente então ativar as duas flags em sequência controlada.

### 6. Recuperação operacional

Não há prova atual de backup restaurável, rollback executado nem alerta
externo de paging. O smoke recorrente abriu, atualizou sem duplicar e encerrou
o [incidente operacional](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/issues/1)
em três execuções controladas: [criação](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/actions/runs/30666452244),
[atualização](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/actions/runs/30666526841)
e [recuperação](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/actions/runs/30666587531).
Código versionado e Issues não substituem recuperação de dados nem uma escala
operacional.

Aceite:

1. criar backup inicial e política de retenção;
2. restaurar em ambiente isolado;
3. executar rollback de cada Worker;
4. definir runbook de incidente e responsáveis;
5. complementar o incidente do smoke com alertas de fila parada, falha de
   webhook, custo e um canal de paging fora do GitHub;
6. registrar RTO e RPO aceitos.

## P1 — concluir antes de escalar tráfego

- executar E2E autenticado em espanhol no celular e desktop;
- validar acessibilidade por teclado, foco, erro e leitor de tela;
- testar autorização por objeto com duas contas em conteúdo, progresso, IA e
  administração;
- conectar Workers Builds ao GitHub ou documentar formalmente que deploys são
  manuais, com responsável e rollback;
- criar suporte e canal de incidente visível para compradoras;
- decidir política de comentários e moderação;
- revisar métricas sem enviar conversa, e-mail ou conteúdo sensível;
- testar concorrência e retry das três outboxes;
- corrigir o contrato do áudio: o estado inicial é mudo, mas o CTA atualmente
  inicia o arquivo audível (`muted=false`, volume 1). A decisão já registrada é
  começar e manter o loop em mute, deixando a usuária ativar o som;
- decidir se o Browser Insights será desativado na área de membros ou
  explicitamente autorizado na CSP. Hoje o beacon automático do Cloudflare é
  bloqueado pela CSP, sem quebrar o login, mas gera erro no console;
- impedir que acesso direto a `/up1`, `/up2` e `/gracias` afirme compra
  confirmada sem contexto de venda verificável. Isso não concede entitlement,
  porém é incorreto para uma visitante direta;
- recuperar acesso operacional do Supabase CLI pela conta correta e vincular
  explicitamente o checkout ao projeto. As migrações estão aplicadas e o app
  funciona com suas credenciais, mas o token local atual não enxerga o projeto
  HAZ QUE VUELVA e a Management API retorna 403.

## P2 — dívida técnica sem bloquear o primeiro teste controlado

- dividir `quiz-page.tsx` (555 linhas), `quiz-sales-page.tsx` (463 linhas) e
  `quiz-offer.tsx` (410 linhas) sem alterar o visual aprovado;
- decidir se cinco PNGs de marca locais e não referenciados devem ser
  versionados ou removidos. Eles foram preservados no checkout, excluídos dos
  commits e do rollout refeito;
- remover nomenclatura de `mock` da UI de preview para reduzir confusão, sem
  reintroduzir dados simulados no modo production;
- revisar a convenção Next.js `middleware` para `proxy` quando a migração puder
  ser feita com teste de regressão.

## Ordem recomendada

1. aguardar a aprovação Perfect Pay;
2. cadastrar primeiro admin com TOTP;
3. publicar o conteúdo real do Haz Que Vuelva;
4. executar convite Resend e primeiro login;
5. executar a matriz de compras e revogações;
6. provar isolamento e downloads com duas contas;
7. criar backup, restauração, rollback e alertas;
8. abrir um lote controlado de vendas;
9. liberar Reconquista 30 e order bumps conforme conteúdo;
10. tratar VUELVE IA como lançamento separado depois do gate jurídico e dos
    testes privados.

Downsells não fazem parte da matriz atual. Se continuarem no funil, precisam de
códigos, checkouts e decisão explícita de mapeamento antes do teste comercial.

## Critério para declarar 100%

O projeto só está 100% pronto quando os P0 têm evidência remota, repetível e
arquivada. Build verde, endpoint 200 e configuração presente são necessários,
mas não provam compra, entrega, autorização, recuperação nem operação real.
