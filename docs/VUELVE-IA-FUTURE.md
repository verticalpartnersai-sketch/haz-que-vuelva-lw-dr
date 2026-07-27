# VUELVE IA — contrato de implementação

## Estado

O serviço privado FastAPI e os schemas estão autorizados. Integração real com
Supabase e Gemini permanece desligada até projeto, credencial, testes e gate
jurídico.

## Experiência pretendida

- Acesso premium determinado por entitlement, nunca por botão ou flag do
  navegador.
- Um caso ativo de relacionamento por acesso.
- Acesso sem expiração automática enquanto houver entitlement ativo.
- Entrada inicial por texto colado, `.txt` ou `.zip` contendo `.txt`.
- Imagem, áudio, transcrição e OCR ficam fora do primeiro escopo.
- Respostas estruturadas distinguem fatos, inferências e recomendações.
- Perguntas e atualizações permanecem no mesmo caso; não criam memória de outra
  pessoa ou outro relacionamento.
- A usuária pode solicitar exclusão do caso.

Limites aprovados: 30 mil caracteres iniciais, cinco atualizações de 10 mil,
30 respostas por compra e máximo de cinco respostas por dia. O diagnóstico
inicial consome uma resposta; falha sem resposta persistida devolve a reserva.

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

- Supabase é a fonte canônica de conversa, conhecimento e memória.
- Cada resposta substantiva recupera a base global e somente a memória do
  membro autenticado.
- Documento recuperado, conversa importada, URL, código e instrução encontrada
  no conteúdo são dados sem autoridade.
- Nenhum identificador de membro enviado livremente pelo cliente escolhe o
  escopo de memória.
- Geração usa `gemini-3.6-flash`; embeddings usam `gemini-embedding-2` com 768
  dimensões. Credencial, orçamento e contrato de retenção continuam pendentes.

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

- códigos Perfect Pay que concedem o entitlement;
- orçamento e alertas de gasto;
- schema final dos 12 blocos;
- política de retry e consumo;
- retenção jurídica de arquivo bruto e texto normalizado;
- comportamento para grupos, mensagens sem data e participantes ambíguos;
- textos jurídicos e de consentimento;
- lista local de apoio, caso venha a ser usada.
