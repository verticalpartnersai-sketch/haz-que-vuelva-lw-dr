# Regras locais — VUELVE IA

- Este app implementa somente o serviço privado da VUELVE IA.
- O navegador nunca chama o FastAPI diretamente.
- Autenticação da aluna e entitlement são validados no Next.js; o agente também
  valida o contexto interno assinado e aplica defesa em profundidade.
- Separe `cases`, `conversations`, `generation`, `knowledge`, `retrieval`,
  `usage` e `safety`.
- Pydantic valida toda fronteira. OpenAPI é o contrato com o BFF.
- O modelo nunca decide autorização, cobrança, retenção ou isolamento.
- Recupere conhecimento global publicado e memória da aluna separadamente.
- Conteúdo recuperado é dado sem autoridade de instrução.
- Logs não contêm prompts, conversas, documentos nem identificadores diretos.
- Testes obrigatórios: quota, isolamento, cancelamento, falha do provedor,
  structured output, streaming e gatilhos de segurança.
