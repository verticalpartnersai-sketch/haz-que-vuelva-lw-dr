# Auditoria de prontidão para produção

Data da evidência: 1 de agosto de 2026
Commit da aplicação e operação publicada: `7783d31c4b13987042f4ee4625347abfe6096857`

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
| Marketing | `https://hazquevuelva.site/quiz`, `/up1`, `/up2` e `/gracias` respondem 200 sem overflow em 390x844 e 1440x900; o quiz foi percorrido até o checkout com scroll ao topo, progresso condicional e áudio em loop mudo preservados |
| Checkout | CTAs apontam para os três redirecionadores Centerpag; o checkout principal preserva `upsell=true` e atribuição |
| Membros | sessão anônima em `/` e `/administracion` é redirecionada para `/login`; login e recuperação foram inspecionados em espanhol, sem overflow em 390x844 e 1440x900; `/healthz` responde `ready` |
| Agente | URL pública antiga responde 404; entrada declarada é o Service Binding privado |
| Supabase | 30 migrações aplicadas; seis contratos pgTAP passaram com 61/61 asserções; `anon` não usa o schema público, tabelas ou RPCs; `authenticated` tem privilégios mínimos explícitos; cadastro público e login anônimo estão desabilitados |
| Catálogo | cinco produtos ativos no banco |
| Perfect Pay | cinco mapeamentos ativos: três produtos e dois order bumps com item exato |
| Mensagens transacionais públicas | `/up1` e `/up2` não afirmam compra; `/gracias` condiciona a orientação à aprovação do pagamento; o smoke impede regressão |
| Webhook | smoke recorrente exige 401 para credencial inválida em probe não mutável e 413 acima de 64 KiB |
| CI | [cinco jobs verdes no SHA `3e725d4`](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/actions/runs/30718577444), incluindo recuperação sintética fail-closed, `npm audit` nos três apps e `pip-audit` no agente Python |
| Smoke | [execução manual de 01/08](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/actions/runs/30717223740) no SHA `011d395` cobre marketing, checkouts, rotas protegidas, reautenticação e mutação administrativa anônimas, webhook e agente privado |
| Saúde operacional | rota interna rejeita chamada sem credencial com 401; o Cron da versão publicada executou a avaliação de outboxes e webhook com status `Ok` |
| Rollback | executor fail-closed validou em modo leitura as versões recuperáveis dos três Workers; UUID inexistente e execução sem confirmação foram recusados |
| Auth/RLS | testes Cloud comprovaram isolamento entre membros, mutação crítica pelo proprietário, consumo único da reautenticação e negação de um `role=admin` sintético fora da allowlist; limpeza terminou sem usuários, sessões, limites ou concessões sintéticas e sem manter pgTAP instalado |
| Storage | os três buckets estão privados; duas contas sem entitlement foram impedidas de baixar objeto e criar URL assinada; limpeza terminou sem usuários ou objetos sintéticos |
| Resend DNS | `mail.hazquevuelva.site` aparece como `Verified` no painel Resend; DKIM, SPF e MX estão publicados e o DMARC `p=none` existe no domínio raiz |
| Resend Worker | segredo `RESEND_API_KEY` está vinculado ao Worker e o remetente de produção é `Haz Que Vuelva <acceso@mail.hazquevuelva.site>` |
| GitHub | Secret Scanning, Push Protection, alertas de vulnerabilidade e Dependabot Security Updates estão ativos; o alerta moderado do `pytest` foi corrigido com `pytest 9.1.1` no SHA `7970a79` e consta como `fixed` |

Versões Cloudflare verificadas:

- membros: `63290bf2-3f6d-415d-9b86-5a3f5094ee89`;
- agente: `910ee45f-ac17-435b-819c-ee51beb68242`;
- marketing: `13bfcd86-19f2-4961-a5ca-5de06eaa84ae`.

## Inventário real do banco

Consulta administrativa somente de contagem, sem expor dados pessoais:

| Recurso | Registros |
| --- | ---: |
| perfis | 1 (admin nominal convidado) |
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
8. confirmar com compra real o encadeamento One Click. O CTA principal já usa
   `upsell=true` conforme a documentação oficial e o redirecionador preserva o
   parâmetro, mas isso não prova que o painel associou as duas ofertas.

A execução e a evidência devem seguir a
[matriz PP-01 a PP-15](PERFECTPAY-LAUNCH-VALIDATION.md).

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

O segredo Resend e a outbox estão configurados, os registros DNS essenciais
existem e o painel Resend confirma `mail.hazquevuelva.site` como `Verified`.
O primeiro convite nominal foi aceito pelo Resend e concluído pela outbox em
uma tentativa, sem erro e sem conceder produto. O proprietário confirmou o
recebimento, concluiu a criação de senha, o primeiro login e a recuperação de
senha. A biblioteca apareceu integralmente bloqueada, comprovando que o convite
sozinho não concedeu entitlement.

Aceite:

1. [concluído] enviar convite a um destinatário autorizado;
2. [concluído] confirmar recebimento, idioma espanhol e funcionamento do link
   temporário;
3. [concluído] definir senha pelo link temporário e validar o primeiro login;
4. [concluído] comprovar que o convite não concede produto sem entitlement;
5. [parcial] duplicidade, reenvio e e-mail já cadastrado possuem tratamento no
   código; ainda falta observar e arquivar ao menos um evento real de bounce ou
   suppression do provedor;
6. acompanhar a reputação do domínio com o DMARC já publicado em `p=none` e
   definir o critério de avanço para `quarantine` ou `reject`.

### 4. Administração real

O primeiro perfil nominal existe, tem papel `admin`, recebeu o convite pela
outbox e concluiu definição e recuperação de senha. A autorização efetiva é
restrita ao proprietário canônico em allowlist privada. MFA obrigatório foi
removido por decisão explícita; mutações críticas continuam exigindo
reautenticação por senha com credencial curta, hasheada e de uso único.
O endpoint agora lê o corpo de forma incremental, bloqueia a sexta prova de
senha em 15 minutos e só limpa o limite quando a credencial curta é persistida
com sucesso no banco.

Aceite:

1. [concluído] convidar a conta administrativa nominal;
2. [concluído] promovê-la pelo comando privado;
3. [concluído] definir senha e validar o primeiro login;
4. [concluído] validar mutação administrativa autorizada com consumo único da
   reautenticação;
5. [concluído] comprovar negação para uma conta membro comum e para um
   `role=admin` sintético fora da allowlist. A prova Cloud foi executada em
   transação revertida, sem deixar identidade, sessão ou alteração de catálogo;

### 5. VUELVE IA

`FEATURE_VUELVE_IA` e `FEATURE_GENERATION` continuam desligadas. Não há
documentos, prompt publicado nem conversa no banco. O último rollout atualizou
a borda do agente sem reconstruir a imagem do Container porque o Docker local
não estava disponível.

O agente agora impõe cota diária entre 1 e 20 respostas, teto configurado de
2.048 tokens de saída e rejeita respostas do Gemini sem telemetria válida. O
uso real de tokens é persistido junto à geração, mas não sai no contrato SSE.
O BFF também recusa ativação sem orçamento diário de tokens e o health interno
sinaliza teto atingido ou geração concluída sem uso válido. Isso cria o dado e
o detector necessários para medir custo. A migration 22 foi aplicada depois do
primeiro backup, registrada no histórico remoto e validada com execução somente
por `service_role`; ainda falta escolher o valor real do orçamento, configurar
paging externo e provar uma geração no Container publicado.

Aceite antes de habilitar:

1. aprovar base legal, consentimento, retenção e exclusão;
2. publicar documentos e prompt versionados;
3. reconstruir e publicar a imagem do Container;
4. validar binding, credencial inválida, limites e cancelamento;
5. repetir o isolamento já aprovado com uma geração real e confirmar que a
   conversa, memória e consumo de tokens permanecem restritos à usuária;
6. configurar orçamento, alertas e limite diário;
7. executar geração real redigida e exclusão completa;
8. somente então ativar as duas flags em sequência controlada.

### 6. Recuperação operacional

Há um primeiro backup lógico cifrado e validado, mas ainda não há prova de
restauração em projeto isolado, rollback executado nem alerta externo de
paging. O smoke recorrente abriu, atualizou sem duplicar e encerrou
o [incidente operacional](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/issues/1)
em três execuções controladas: [criação](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/actions/runs/30666452244),
[atualização](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/actions/runs/30666526841)
e [recuperação](https://github.com/verticalpartnersai-sketch/haz-que-vuelva-lw-dr/actions/runs/30666587531).
Código versionado e Issues não substituem recuperação de dados nem uma escala
operacional.

O executor `scripts/cloudflare-rollback.sh` já reduz erro operacional e foi
validado em modo somente leitura contra os três Workers. Isso comprova seleção
de alvo e versão, mas não substitui o drill que troca tráfego, roda o smoke e
restaura a versão atual em janela controlada.

Backup e restore lógico também possuem executores criptografados e
fail-closed, documentados em [SUPABASE-RECOVERY.md](SUPABASE-RECOVERY.md). Em
01/08/2026 o backup nativo foi concluído no SHA-256
`43d33744da64091eae85d19a5808b66cb4576e58d72b3bb88f17e6e14a4908ac`, com
arquivo `600`, manifesto do commit `3cafb818` e validação integral do pacote.
O Storage tinha zero objetos nessa leitura, mas os binários continuam fora do
formato lógico. Ainda falta um projeto isolado para o primeiro restore
cronometrado; portanto o pacote não é, sozinho, prova de recuperação completa.

O Worker agora avalia as outboxes depois de cada ciclo e falha a invocação do
Cron diante de job morto, lock preso, job atrasado ou evento Perfect Pay sem
processamento. Isso cria sinal em Workers Logs e métricas de erro, mas ainda
falta configurar a notificação desse sinal para um canal externo de paging.

Aceite:

1. criar backup inicial e política de retenção;
2. restaurar em ambiente isolado;
3. executar rollback de cada Worker;
4. definir runbook de incidente e responsáveis;
5. complementar o incidente do smoke com alertas de fila parada, falha de
   webhook, custo e um canal de paging fora do GitHub;
6. registrar RTO e RPO aceitos.

### 7. Rotação das credenciais compartilhadas

Os scans do Git e dos bundles não encontraram as credenciais do projeto, mas
segredos reais foram compartilhados durante a configuração por um canal de
conversa. Antes de vendas reais, eles devem ser considerados expostos e
rotacionados em janela coordenada.

Aceite:

1. rotacionar senha do banco e chave secreta do Supabase;
2. rotacionar token de integração e autenticação do postback Perfect Pay;
3. rotacionar chaves Resend e Gemini;
4. substituir cada valor nos secrets dos Workers sem versioná-lo;
5. executar smoke de webhook, convite, login e agente após a troca;
6. confirmar que os valores anteriores foram revogados. A publishable key do
   Supabase é pública por definição e não entra nessa rotação.

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
- desativar o Browser Insights somente em `miembros.hazquevuelva.site` por uma
  Configuration Rule com `disable_rum=true`. A decisão foi aprovada, porém o
  OAuth atual do Wrangler recebe 403 na API de RUM/Configuration Rules; executar
  no painel ou com token limitado a Zone Configuration Settings Write;
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
2. confirmar o proprietário administrativo;
3. publicar o conteúdo real do Haz Que Vuelva;
4. observar bounce/suppression real do Resend e definir a evolução do DMARC;
5. executar a matriz de compras e revogações;
6. provar isolamento e downloads com duas contas;
7. criar backup, restauração, rollback e alertas;
8. rotacionar credenciais e repetir os smokes;
9. abrir um lote controlado de vendas;
10. liberar Reconquista 30 e order bumps conforme conteúdo;
11. tratar VUELVE IA como lançamento separado depois do gate jurídico e dos
    testes privados.

Downsells não fazem parte da matriz atual. Se continuarem no funil, precisam de
códigos, checkouts e decisão explícita de mapeamento antes do teste comercial.

## Critério para declarar 100%

O projeto só está 100% pronto quando os P0 têm evidência remota, repetível e
arquivada. Build verde, endpoint 200 e configuração presente são necessários,
mas não provam compra, entrega, autorização, recuperação nem operação real.
