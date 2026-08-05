# Operação da publicação no Cloudflare

> Continuação de [Publicação no Cloudflare](CLOUDFLARE-DEPLOYMENT.md), com smoke
> remoto, evidências de rollout, rollback e pendências reais.

## Smoke test remoto obrigatório

### Marketing

- [x] `/` redireciona para `/quiz`;
- [x] `/quiz` responde 200;
- [x] imagens e áudio carregam;
- [x] seletor de idioma e fluxo completo funcionam;
- [x] página final aprovada usa CTAs verdes e não exibe badge interno;
- [x] CTA usa o checkout Centerpag aprovado, em nova aba, preservando UTMs e
  contexto da rota; o smoke sintético valida a URL no JavaScript publicado, a
  disponibilidade do redirecionador e a preservação dos parâmetros;
- [x] nenhum marcador de preview interno aparece em produção.
- [x] canonical, Open Graph, Twitter Card, robots, sitemap e manifesto
  respondem em produção;
- [x] respostas HTML entregam HSTS, `nosniff`, negação de frame, referrer
  policy e permissions policy;
- [x] requisições HTTP redirecionam para o mesmo caminho em HTTPS com status
  permanente 308;
- [x] áudio preserva duração, loop, controle manual e foi reduzido de 5,09 MB
  para 2,04 MB;
- [x] o CTA inicia a reprodução ainda muda (`muted=true`, `paused=false`) e a
  usuária pode ativar o som pelo controle do cabeçalho;
- [x] smoke sintético versionado cobre a superfície pública e roda a cada
  30 minutos no GitHub Actions.
- [x] `/up1` e `/up2` carregam os checkouts correspondentes e preservam
  parâmetros de atribuição;
- [x] Publicar a revisão em que `/d1` preserva parâmetros até `/gracias`,
  `/up2` recusa para `/d2` e `/d2` preserva parâmetros até `/gracias`; os
  aceites dos downsells devem continuar sem cobrança enquanto seus checkouts
  não estiverem configurados.

### Área de membros

- [x] `/` redireciona a sessão anônima para `/login?next=%2F`;
- [x] `/productos`, `/perfil`, `/administracion` e `/ia` também redirecionam
  sessões anônimas para o login preservando o destino;
- [x] `/login` e `/healthz` respondem 200;
- [x] `/quiz` redireciona para `https://hazquevuelva.site/quiz`;
- `/productos`, `/perfil` e `/administracion` respondem conforme
  papel e sessão;
- cookies Secure/HttpOnly/SameSite estão corretos;
- middleware renova sessão, mas DAL/RLS negam acessos indevidos;
- o Custom Worker executa as outboxes a cada minuto e ignora integrações cuja
  flag ou credencial esteja ausente;
- depois dos processadores, o mesmo Cron consulta a saúde operacional por rota
  interna autenticada. Job morto, lock acima de 5 minutos, job disponível ou
  evento Perfect Pay sem processamento acima de 10 minutos transforma a
  execução em erro observável, sem expor contagens na superfície pública;
- primeiro download retorna `202` e enfileira a cópia; após o Cron, a mesma
  ação recebe URL assinada somente do PDF individual em `member-sensitive`;
- PDF inválido, criptografado, acima de 12 MiB ou 300 páginas falha fechado e
  não entrega o original.

### Agente

- [x] o smoke comprova que o endpoint público antigo responde 404 e que a
  geração permanece indisponível por flag;
- o Service Binding é a única entrada de rede do agente;
- Worker e FastAPI rejeitam credencial interna ausente ou inválida;
- rota desconhecida responde 404 dentro do binding;
- geração desligada responde 503 mesmo com credencial válida;
- a imagem roda como usuário não-root;
- logs não contêm prompt, conversa, chaves ou dados pessoais.

### Evidência do rollout de 31 de julho de 2026

- área de membros: versão `637aef83-8f4a-4132-bde3-5cb4c1592302` em
  `miembros.hazquevuelva.site`;
- agente privado: versão de borda
  `910ee45f-ac17-435b-819c-ee51beb68242`, com `workers.dev` desativado e
  geração desligada por flag;
- marketing: versão `3a5ad1db-2f1d-4d2c-92ee-13265e9daa65` em
  `hazquevuelva.site`;
- `scripts/production-smoke.sh` passou contra os dois domínios públicos e o
  endpoint público antigo do agente passou a responder 404. O mesmo smoke
  comprova os redirects protegidos, token Perfect Pay inválido com 401 por um
  probe intrinsecamente não mutável, stream acima de 64 KiB com 413 e geração
  desligada com 503;
- a rota `/api/internal/operations/health` rejeitou a chamada sem credencial
  com 401, e o Cron `* * * * *` da versão publicada executou o ciclo completo
  com status `Ok` nos Workers Logs;
- o deploy do agente usou `--containers-rollout=none`, pois o daemon Docker
  local não estava disponível. A camada Worker foi atualizada, mas a imagem do
  Container permaneceu na versão já publicada. Antes de habilitar a geração,
  reconstruir e publicar a imagem deliberadamente e executar o smoke privado.

### Evidência do rollout de 4 de agosto de 2026

- marketing: versão `6fe59bbb-0515-4175-9022-08d3e8fa9e97`, servindo 100% do
  tráfego de `hazquevuelva.site`;
- `/d1?utm_source=codex-prod&order=synthetic-123` respondeu 200 e o clique de
  recusa chegou a `/up2` preservando os dois parâmetros;
- a recusa de `/up1` chegou a `/d1` com os mesmos parâmetros;
- `/downsell1` respondeu 404 e o asset novo `hero-message.webp` respondeu 200;
- Playwright confirmou ausência de overflow em 390 × 844 e 1440 × 900, sem
  erros ou avisos no console;
- `NEXT_PUBLIC_DOWNSELL_1_ACCEPT_URL` continua ausente; por isso o aceite da
  oferta permanece corretamente desabilitado e sem cobrança.

Essa evidência comprova roteamento e configuração pública do rollout. Ela não
substitui os testes reais de compra, e-mail, autorização por usuário nem geração
Gemini listados nas pendências.

### Evidência do rollout de UP2/D2 em 4 de agosto de 2026

- código: commit `e00d968796b2fa6042c8c946cc5f906813e76d11`, sincronizado
  entre `main` local e `origin/main`;
- CI do commit concluída com sucesso no GitHub;
- marketing: versão `675a8d86-d708-4d7b-9b8e-ead4fb383036`, publicada no
  domínio `hazquevuelva.site`;
- `/up2`, `/d2`, `/d1` e `/gracias` responderam 200 depois da propagação;
- Playwright comprovou em produção `D1 → /gracias`, `UP2 → /d2` e
  `D2 → /gracias`, preservando `utm_source`, `order` e os demais parâmetros;
- as heroes de UP2, D2 e D1 não contêm preço; o checkout configurado de UP2
  preserva a atribuição e o aceite de D2 permanece desabilitado porque
  `NEXT_PUBLIC_DOWNSELL_2_ACCEPT_URL` ainda não foi configurada;
- não houve overflow em 390 × 844 ou 1440 × 900, nem erro ou aviso no console.

O primeiro probe de `/d2` ocorreu durante a propagação e respondeu 404; uma
nova requisição sem cache e o percurso completo no navegador responderam 200.
Esta evidência comprova publicação e roteamento, não compra one-click,
entitlement ou acesso ao produto.

### Evidência do redesign de UP2/D2 em 4 de agosto de 2026

- código: commit `f8c6adbeba42f7a47611be1cce276c0e97b25f14`, enviado para
  `origin/main`;
- marketing: versão `30b847af-8651-4051-9705-c51b9f2650b5`, publicada no
  domínio `hazquevuelva.site`;
- UP2 e D2 passaram a herdar o sistema visual `r30-*` da página final, de UP1
  e de D1, com botões equivalentes, depoimentos manuais e rodapé compartilhado;
- o mockup inventado foi substituído por capturas reais da VUELVE IA em
  desktop e mobile, usando apenas uma conversa sintética em ambiente local;
- `/up2`, `/d2`, `/gracias` e os novos assets responderam 200 depois da
  propagação do Worker;
- Playwright comprovou no domínio público `UP2 → /d2 → /gracias`, preservando
  `utm_source`, `order` e os demais parâmetros da query;
- as heroes de UP2 e D2 não contêm preço; as duas páginas exibem depoimentos e
  não possuem botão de pausa;
- não houve overflow em 390 × 844 ou 1440 × 900, nem erro ou aviso no console.

A primeira leitura de UP2 e alguns assets ocorreu durante a propagação e ainda
serviu a versão anterior. Uma nova requisição sem cache e o percurso completo
no navegador serviram a versão `30b847af-8651-4051-9705-c51b9f2650b5`. Esta
evidência visual e de roteamento não substitui uma compra one-click controlada,
entitlement ou acesso autenticado ao produto.

### Evidência do refinamento de UP2/D2 e downsells em 4 de agosto de 2026

- código: commit `2e1e65badf7b577fb9bf88daca068a0d24930100`, enviado para
  `origin/main` antes da publicação;
- marketing: versão `e2d65a17-cbe1-484c-bae8-389fceb542ad`, publicada no
  domínio `hazquevuelva.site`;
- `/up2`, `/d2`, `/d1`, `/gracias` e as três novas capturas de VUELVE IA
  responderam 200 no domínio público;
- UP2 carrega capturas reais em desktop, tablet e mobile com conversa sintética
  multietapa, não mostra preço na hero e não contém mais a seção “Esto es lo que
  vas a abrir...”;
- D2 mostra `US$20` riscado e `US$15` em verde; D1 mostra `US$6,90` riscado e
  `US$4,90` em verde, ambos com copy de última oportunidade sem contador ou
  escassez fabricada;
- Playwright comprovou em 390 × 844 e 1440 × 900 as imagens carregadas, ausência
  de overflow e erros de console, além das rotas `UP2 → /d2`, `D2 → /gracias`
  e `D1 → /gracias` com a query preservada.

Esta evidência comprova interface e roteamento do Worker. Não comprova compra
one-click, cobrança, entitlement ou acesso autenticado ao produto.

## Rollback

- Preservar a versão anterior de cada Worker.
- Promover versões gradualmente somente depois da primeira homologação.
- Se marketing falhar, voltar sua versão sem tocar a área de membros.
- Se a área de membros falhar, voltar sua versão e manter backend flags
  desligadas.
- Se o agente falhar, desligar `FEATURE_VUELVE_IA`; a biblioteca deve continuar
  disponível.
- Rollback de código não substitui rollback de migração. Migrações Supabase
  exigem plano próprio e restauração testada.

O executor canônico para reduzir erro operacional é:

```bash
scripts/cloudflare-rollback.sh <marketing|members|agent> <version-id>
```

Sem `--execute`, ele apenas valida o alvo e lista deployments. A execução real
exige `--execute` e `HQV_ROLLBACK_CONFIRM` exatamente no formato
`<worker-name>:<version-id>`. Depois da promoção, o script executa o smoke de
produção e falha se marketing, membros, webhook defensivo ou agente privado
divergirem. O drill real continua obrigatório porque rollback de Worker não
reverte Supabase, Storage nem outros recursos vinculados.

## Pendências reais

- testar as mutações administrativas reais com o proprietário canônico e
  reautenticação por senha;
- aguardar a aprovação comercial dos produtos pela Perfect Pay;
- executar compra, revogação, convite Resend e geração Gemini com identidades
  de teste autorizadas;
- validar os cinco mapeamentos Perfect Pay com payloads reais redigidos;
- conectar Workers Builds ao repositório GitHub;
- configurar um canal externo para receber os erros operacionais já detectados
  pelo Cron e alertas de orçamento do Container/Gemini;
- testar restauração, observabilidade, alertas e rollback remoto.
