# Homologação Perfect Pay e liberação de acesso

Este runbook é o contrato de aceite comercial. Checkout aberto ou webhook com
resposta 200 não bastam: cada cenário precisa terminar no entitlement correto,
no e-mail correto e na negação correta para outra conta.

## Pré-condições

- os três produtos estão aprovados no painel Perfect Pay;
- o postback aponta para `https://miembros.hazquevuelva.site/api/webhooks/perfect-pay`;
- o token público e a autenticação do postback estão ativos;
- o checkout principal usa `upsell=true`;
- o painel encadeia Haz Que Vuelva → `/up1`; a recusa segue para
  `/d1`; o resultado do Downsell 1 segue para `/up2`; e o resultado do
  VUELVE IA segue para `/gracias`;
- há um proprietário administrativo autenticado e dois e-mails de teste
  controlados;
- os quatro PDFs estão publicados no Storage privado;
- nenhum payload bruto com PII será anexado ao GitHub.

Se qualquer pré-condição falhar, parar. Não compensar concedendo acesso manual
sem registrar a divergência.

## Mapeamento canônico

| Oferta externa | Linha recebida | Entitlement esperado |
| --- | --- | --- |
| `PPPBF7CC` | produto principal | `haz_que_vuelva` |
| `PPPBF7EK` | `plan_itens[].item_code` | `21_mensajes` |
| `PPPBF7EL` | `plan_itens[].item_code` | `la_otra` |
| `PPPBF7E4` | produto principal | `reconquista_30` |
| `PPPBF7E7` | produto principal | `vuelve_ia` |

Order bumps sempre resolvem por `item:<item_code>`. O wildcard do produto
principal nunca pode absorver um bump desconhecido.

O contrato local acompanha o
[formato oficial do webhook](https://help.perfectpay.com.br/article/597-integracao-via-webhook-com-a-perfect-pay)
e os
[status oficiais de transação](https://help.perfectpay.com.br/article/196-quais-status-uma-transacao-pode-assumir).
O fixture `webhook-official-reference.json` é sanitizado e derivado do exemplo
documental; ele não substitui um payload real redigido da conta de produção.

## Cobertura automatizada antes da homologação comercial

O contrato Cloud `007_payment_entitlement_lifecycle.sql` cobre, em transação
revertida, compra principal com order bump, replay idempotente, reembolso
seletivo, evento de concessão tardio e revogação dos créditos da VUELVE IA.
Essa cobertura reduz o risco técnico de PP-02, PP-10, PP-11, PP-13 e PP-15,
mas esses cenários continuam pendentes até serem disparados pela Perfect Pay
com uma compra autorizada.

## Contas de teste

Usar dois endereços reais controlados:

- **Compradora A:** executa as compras e recebe somente os itens pagos;
- **Compradora B:** não compra e prova isolamento, bloqueio e ausência de
  downloads assinados.

Não reutilizar uma conta antiga com entitlements manuais. Registrar somente o
hash ou alias do e-mail nas evidências públicas.

## Matriz obrigatória

| ID | Ação | Resultado obrigatório |
| --- | --- | --- |
| PP-01 | Haz Que Vuelva sem bumps | libera apenas `haz_que_vuelva` |
| PP-02 | Haz Que Vuelva + `PPPBF7EK` | libera HQV e `21_mensajes`, não `la_otra` |
| PP-03 | Haz Que Vuelva + `PPPBF7EL` | libera HQV e `la_otra`, não `21_mensajes` |
| PP-04 | Haz Que Vuelva + ambos os bumps | libera exatamente os três produtos |
| PP-05 | aceitar Reconquista 30 em `/up1` | libera `reconquista_30` e avança a `/up2` |
| PP-06 | recusar Reconquista 30 em `/up1` | não libera R30 e alcança `/d1` |
| PP-06A | aceitar Reconquista 30 em `/d1` | libera o mesmo `reconquista_30` uma única vez e avança a `/up2` |
| PP-06B | recusar Reconquista 30 em `/d1` | não libera R30 e alcança `/up2` |
| PP-07 | aceitar VUELVE IA em `/up2` | libera `vuelve_ia` e conclui em `/gracias` |
| PP-08 | recusar VUELVE IA | não libera IA e conclui em `/gracias` |
| PP-09 | pagamento pendente ou rejeitado | não concede nenhum entitlement |
| PP-10 | repetir o mesmo postback aprovado | não duplica compra, acesso, convite nem outbox |
| PP-11 | reembolso de um bump | revoga somente o bump correspondente |
| PP-12 | reembolso do produto principal | revoga somente HQV; não apaga compra independente |
| PP-13 | chargeback/cancelamento | aplica a mesma revogação seletiva e audita o motivo |
| PP-14 | acesso da Compradora B | catálogo bloqueado; sem URL assinada e sem IA |
| PP-15 | replay fora de ordem | estado final segue a transição válida mais recente |

Se a Perfect Pay não oferecer sandbox para algum status, usar uma compra de
valor mínimo autorizada e o procedimento de estorno do próprio painel. Não
forjar um evento positivo diretamente no endpoint de produção.

## Evidência por cenário

Para cada ID, guardar em `docs/evidence/launch/` apenas material redigido:

1. horário UTC e identificador parcial da venda;
2. status HTTP do webhook e hash do payload normalizado;
3. linhas de compra e itens sem nome, e-mail, telefone ou documento;
4. entitlements antes e depois;
5. estado da outbox e número de tentativas;
6. entrega do e-mail, expiração do convite e primeiro login;
7. captura do catálogo mostrando itens liberados e bloqueados;
8. resultado de download/IA para Compradora A e negação para Compradora B.

Fixtures derivadas do provedor devem substituir PII por valores `.invalid`,
preservar estrutura e enums, e nunca conter token, assinatura ou URL secreta.

Após cada evento real chegar e o Cron processar as filas, validar a venda sem
expor PII:

```bash
node --env-file=apps/web/.env.local apps/web/scripts/verify-perfectpay-sale.mjs \
  --sale '<codigo-da-venda>' \
  --expect 'haz_que_vuelva,21_mensajes'
```

Para uma venda terminal que deve ficar sem acesso, usar `--expect-none`. O
verificador é somente leitura, fixa o projeto de produção esperado, compara
itens e grants ativos da própria venda, confere eventos processados e confirma
que o convite não falhou. A saída usa somente fingerprint parcial da venda e
metadados operacionais, nunca e-mail ou identificador do membro.

## Sequência de execução

1. confirmar aprovação e URLs no painel;
2. confirmar o proprietário administrativo e publicar os PDFs;
3. executar PP-01 e validar convite, senha, login e download;
4. executar PP-02 a PP-08 com uma compra limpa por combinação;
5. executar idempotência e estados negativos;
6. executar reembolso, cancelamento e chargeback seletivos;
7. provar isolamento com a Compradora B;
8. rodar `scripts/production-smoke.sh` e confirmar CI verde;
9. rotacionar credenciais compartilhadas e repetir webhook, convite e login;
10. registrar o veredito na auditoria de prontidão.

## Critério de liberação

Vendas só podem abrir quando PP-01 a PP-15 estiverem aprovados, os quatro PDFs
estiverem acessíveis apenas com entitlement, o primeiro acesso tiver entrega
real e os segredos antigos estiverem revogados. Qualquer concessão ampla,
duplicidade, ausência de revogação ou acesso cruzado é bloqueador P0.
