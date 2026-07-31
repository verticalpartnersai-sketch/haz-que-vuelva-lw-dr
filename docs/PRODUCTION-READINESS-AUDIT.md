# Auditoria de prontidão para produção

Data da evidência: 31 de julho de 2026
Commit da aplicação verificada: `693ddf60ca6fbf4d3bb8864427d4ed09964b4238`

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
| Marketing | `https://hazquevuelva.site/quiz`, `/up1` e `/up2` respondem 200 |
| Checkout | CTAs publicados apontam para os três redirecionadores Centerpag aprovados no código |
| Membros | sessão anônima é redirecionada para `/login`; `/healthz` responde `ready` |
| Agente | URL pública antiga responde 404; entrada declarada é o Service Binding privado |
| Supabase | 21 migrações aplicadas; cadastro público e login anônimo desabilitados |
| Catálogo | cinco produtos ativos no banco |
| Perfect Pay | cinco mapeamentos ativos: três produtos e dois order bumps |
| Webhook | smoke recorrente exige 401 para credencial inválida em probe não mutável e 413 acima de 64 KiB |
| CI | quatro jobs do workflow CI verdes no SHA auditado |
| Smoke | workflow recorrente cobre marketing, autenticação negativa, webhook e agente privado |
| Resend DNS | DKIM publicado; SPF e MX publicados em `send.mail.hazquevuelva.site` |

Versões Cloudflare verificadas:

- membros: `5ef94614-f428-4cb9-9765-88e0ab4d42c8`;
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
| itens de conteúdo | 0 |
| arquivos de conteúdo | 0 |
| documentos da IA | 0 |
| versões de prompt da IA | 0 |
| conversas da IA | 0 |
| jobs pendentes na outbox | 0 |

Esse inventário é esperado antes do lançamento, mas prova que nenhum fluxo
positivo real foi validado ainda.

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

### 2. Conteúdo real da área de membros

O catálogo tem cinco produtos, mas `content_items` e `content_files` estão
vazios. Uma compradora poderia receber acesso ao produto e encontrar uma
biblioteca sem material.

Aceite:

1. enviar arquivos oficiais, capas e metadados em espanhol;
2. publicar cada item pelo fluxo administrativo;
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
6. publicar DMARC inicialmente em modo de monitoramento.

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
externo. Código versionado não substitui recuperação de dados.

Aceite:

1. criar backup inicial e política de retenção;
2. restaurar em ambiente isolado;
3. executar rollback de cada Worker;
4. definir runbook de incidente e responsáveis;
5. criar alertas de erro, fila parada, falha de webhook e custo;
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
- testar concorrência e retry das três outboxes.

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

## Critério para declarar 100%

O projeto só está 100% pronto quando os P0 têm evidência remota, repetível e
arquivada. Build verde, endpoint 200 e configuração presente são necessários,
mas não provam compra, entrega, autorização, recuperação nem operação real.
