# Privacidade, segurança e auditoria — futuro

## Gate de dados reais

Nenhuma interface pronta libera o uso de dados reais. Desenvolvimento e QA da
VUELVE IA devem usar somente dados sintéticos até existir validação jurídica de
base legal, termos, consentimento, subprocessadores, transferências e diferenças
aplicáveis a México e Colômbia.

Schemas, isolamento e limites de logging já possuem fundação local. Isso não é
prova de conformidade nem autorização para dados reais.

## Princípios

1. finalidade limitada ao serviço solicitado;
2. minimização de conta, compra, conversa e dados de terceiros;
3. isolamento por conta e caso;
4. consentimento específico e versionado;
5. arquivos privados e autorização server-side;
6. não treinamento por padrão;
7. retenção até exclusão/reset solicitado, com exclusão verificável;
8. auditoria de ação sem replicar conteúdo;
9. privilégios mínimos para pessoas e serviços;
10. controles críticos fora do LLM.

## Consentimento futuro

Devem existir aceites separados para:

- conta, termos e política de privacidade;
- processamento de conversa e dados de terceiros;
- comunicação comercial;
- depoimento ou prova.

Marketing não pode ser condição para consumir uma compra existente. O envio de
conversa deve explicar finalidade, provedores, transferência, retenção,
exclusão, limitações e proibição de material obtido por acesso indevido.

## Acesso e isolamento

- `member` acessa somente conta, produtos, caso e exclusões próprias.
- `admin` opera catálogo e estado, mas acesso sensível é separado da
  administração comum.
- suporte futuro começa por metadados; conteúdo exige exceção autorizada,
  motivo e duração registrados.
- serviços usam identidade própria, escopo mínimo e segredo revogável.
- ocultar botão não é autorização.
- ownership é validado em toda operação de objeto.
- exclusão total e mudanças críticas exigem reautenticação.
- a reautenticação administrativa aceita cinco provas de senha por janela de
  15 minutos; a sexta é bloqueada atomicamente no banco e o limite não é
  acessível a `anon`, `authenticated` nem diretamente a `service_role`.

## Arquivos, banco e backups

- storage privado, nomes internos aleatórios e listagem pública bloqueada;
- tipo validado pelo conteúdo, com limites de tamanho e ZIP;
- URLs temporárias curtas após autorização;
- ambientes e credenciais separados;
- RLS/autorização impedem busca ou acesso cruzado;
- backups criptografados, com restauração testada e expurgo compatível com a
  política aprovada.

## Logs, analytics e suporte

Podem registrar IDs internos, operação, estado, duração, tamanho aproximado,
versão, custo e código de erro.

Não podem registrar conversa bruta, prompt/resposta completos com dados da
usuária, tokens, cookies, senhas, chaves, URLs assinadas ou dados de terceiros
em marketing. Suporte não deve copiar conversa para ticket, email ou WhatsApp.

## Exclusão e retenção

Uma exclusão futura precisa alcançar, conforme o escopo solicitado:

- arquivo e texto normalizado;
- mensagens estruturadas e fatos;
- análises, chat e atualizações;
- caches, busca e filas;
- referências de suporte;
- backups conforme o ciclo aprovado.

Não se declara conclusão antes das camadas previstas terminarem. Caso, chats,
arquivos, chunks e vetores são apagados no reset; compras, saldo restante e
auditoria financeira mínima são preservados. Prazos de auditoria e backup
continuam pendentes de decisão jurídica e operacional.

## Auditoria futura

Registrar sem conteúdo bruto:

- concessão, revogação e expiração;
- consentimento e versão;
- acesso administrativo sensível;
- criação/exclusão de caso e arquivo;
- versão de análise, política, base, schema e modelo;
- categoria de sinal crítico;
- webhook recebido e resultado;
- incidente e ação corretiva.

## Incidentes e separação de capacidades

VUELVE IA deve poder ser desativada sem derrubar a biblioteca de PDFs. Durante
incidente, novos uploads podem ser bloqueados, pedidos de exclusão devem
continuar preservados e sessões/segredos afetados devem ser revogados.

## Pendências obrigatórias

- base legal e diferenças México/Colômbia;
- política final de retenção, exclusão e backup;
- subprocessadores, regiões e transferências;
- procedimento de acesso excepcional de suporte;
- SLA e canal de incidente;
- política contratual do provedor de IA;
- textos públicos de consentimento e transparência;
- exportação/correção e prazos de auditoria.
