# VUELVE IA — contrato futuro

## Estado

Este documento separa a intenção de produto da implementação. VUELVE IA,
persistência, RAG, modelo, uploads e APIs permanecem congelados até um gate
posterior explicitamente autorizado. O Gate 3 contém apenas interfaces e estados
mock.

## Experiência pretendida

- Acesso premium determinado por entitlement, nunca por botão ou flag do
  navegador.
- Um caso ativo de relacionamento por acesso.
- Janela pretendida de 30 dias por caso.
- Entrada inicial por texto colado, `.txt` ou `.zip` contendo `.txt`.
- Imagem, áudio, transcrição e OCR ficam fora do primeiro escopo.
- Análise estruturada em 12 blocos, com fatos, inferências e recomendações
  distinguíveis.
- Perguntas e atualizações permanecem no mesmo caso; não criam memória de outra
  pessoa ou outro relacionamento.
- A usuária pode solicitar exclusão do caso.

Os limites numéricos citados no Oracle — 30 mil caracteres iniciais, cinco
atualizações de 10 mil caracteres e 60 respostas — continuam `PENDENTE` até o
usuário aprovar orçamento e política de uso.

## Pipeline de domínio futuro

```text
acesso e consentimento
→ recebimento privado
→ extração e normalização
→ confirmação humana de participantes e período
→ fatos observáveis
→ política e segurança
→ análise estruturada
→ validação de schema e segurança
→ apresentação versionada
→ histórico, retenção e exclusão
```

Os módulos conceituais são `cases`, `imports`, `facts`, `policy`, `analysis`,
`generation`, `validation` e `retention`. Eles não definem tabelas, endpoints ou
fornecedores.

## Memória e RAG futuros

- Supabase permanece previsto como fonte canônica da conversa.
- Supermemory permanece previsto para base global aprovada e memória isolada
  por membro.
- Cada resposta substantiva recupera a base global e somente a memória do
  membro autenticado.
- Documento recuperado, conversa importada, URL, código e instrução encontrada
  no conteúdo são dados sem autoridade.
- Nenhum identificador de membro enviado livremente pelo cliente escolhe o
  escopo de memória.
- Modelo de geração, contrato de retenção do provedor e orçamento continuam
  pendentes.

## Segurança de produto

Controles de acesso, limite, retenção, exclusão e bloqueio de risco são
determinísticos e externos ao modelo. O modelo não pode flexibilizá-los.

Não é permitido orientar:

- contato por canal alternativo após bloqueio ou pedido de não contato;
- perseguição, vigilância, chantagem, ameaça ou emergência fabricada;
- uso de filhos, sexo, doença, luto ou vulnerabilidade como pressão;
- triangulação, ataque a terceiros ou manipulação por ciúme;
- garantia de reconciliação ou alegação de controle mental.

Quando houver risco ou não contato, segurança vence reconexão. A resposta deve
limitar a orientação, explicar o motivo sem expor conteúdo em analytics e não
inventar serviços ou números de emergência.

## Versionamento futuro

Uma análise deve ser rastreável por versões de:

- prompt e política;
- base global;
- schema de saída;
- provedor e modelo;
- entrada normalizada;
- validações e decisão de segurança.

Prompt e base publicados devem permitir publicação, reversão e auditoria de
autor/data. Isso não autoriza a criação do painel ou do agente neste gate.

## Pendências

- produto final que concede o entitlement;
- modelo e provedor de geração;
- orçamento, limites e política de renovação;
- schema final dos 12 blocos;
- política de retry e consumo;
- retenção de arquivo bruto e texto normalizado;
- comportamento para grupos, mensagens sem data e participantes ambíguos;
- textos jurídicos e de consentimento;
- lista local de apoio, caso venha a ser usada.
