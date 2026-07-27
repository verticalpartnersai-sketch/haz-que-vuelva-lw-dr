# Rastreabilidade da ingestão Oracle

## Propósito e precedência

Este documento registra como as cinco notas autorizadas do Obsidian Oracle
foram reconciliadas com a documentação versionada. O Oracle é contexto de
produto; não autoriza backend, integrações, uso de dados reais ou mudança de
gate.

A precedência aplicada foi:

1. instrução explícita mais recente do usuário;
2. decisões já aprovadas e versionadas neste repositório;
3. notas Oracle 00–04;
4. propostas e referências antigas citadas pelo Oracle.

Estados usados:

- `CANÔNICO`: contrato atual de produto ou experiência;
- `FUTURO`: requisito documentado para um gate posterior, ainda não
  implementado;
- `PENDENTE`: exige decisão, dado ou validação antes de virar contrato;
- `CONFLITO`: diverge de uma decisão mais recente e não foi adotado.

## Fontes ingeridas

| ID | Nota Oracle | Leitura |
|---|---|---|
| O00 | `00 - INDEX - Área de Membros e IA.md` | integral |
| O01 | `01 - Área de Membros - Experiência e Acessos.md` | integral |
| O02 | `02 - VUELVE IA - Fluxo, Dados e Resposta.md` | integral |
| O03 | `03 - Privacidade, Segurança e Limites.md` | integral |
| O04 | `04 - Ordem para Codex e QA da Etapa 6.md` | integral |

## Matriz de decisões

| Fonte | Decisão extraída | Estado | Destino canônico | Justificativa |
|---|---|---|---|---|
| O00–O04 | Interface pública em espanhol neutro LATAM e termos de produto em espanhol | `CANÔNICO` | [Produto](PRODUCT.md) | Confirma a direção já aprovada |
| O01 | Mostrar somente produtos comprados | `CONFLITO` | [Produto](PRODUCT.md) | A decisão explícita mais recente exige catálogo completo, com cards bloqueados e modal de oferta |
| O01 | Papéis de suporte e serviço de integração | `FUTURO` | [Privacidade, segurança e auditoria](PRIVACY-SECURITY-AUDIT.md) | São escopos operacionais futuros; os únicos perfis de interface atuais continuam `member` e `admin` |
| O00–O04 | Códigos, nomes e preços propostos para cinco produtos | `PENDENTE` | [Produto](PRODUCT.md) | O usuário ainda fornecerá o catálogo final e os IDs externos |
| O01/O04 | Upsell e downsell equivalentes concedem o mesmo acesso | `FUTURO` | [Integrações futuras](INTEGRATIONS-FUTURE.md) | Regra útil para o futuro mapeamento, dependente do catálogo final |
| O01/O03 | PDFs em espanhol privados; versões PT-BR não são expostas | `FUTURO` | [Privacidade, segurança e auditoria](PRIVACY-SECURITY-AUDIT.md) | Requisito de conteúdo futuro, sem storage implementado |
| O01 | Produtos editoriais sem expiração | `PENDENTE` | [Produto](PRODUCT.md) | O próprio Oracle marca a duração para aprovação |
| O01/O04 | Download de PDF versus leitura autenticada | `CANÔNICO` | [Produto](PRODUCT.md) | A decisão atual permite ambos, sempre com autorização e cópia marcada |
| O02/O04 | VUELVE IA com um caso ativo, janela de 30 dias e análise em 12 blocos | `FUTURO` | [VUELVE IA futura](VUELVE-IA-FUTURE.md) | Define a experiência pretendida, sem autorizar IA ou persistência |
| O02/O04 | Limites de entrada e respostas | `CANÔNICO` | [VUELVE IA futura](VUELVE-IA-FUTURE.md) | A decisão atual fixa 30 mil caracteres, cinco atualizações, 30 respostas por compra e cinco por dia |
| O02 | Entrada por texto, `.txt` e `.zip` com `.txt`; imagem, áudio e OCR fora do MVP | `FUTURO` | [VUELVE IA futura](VUELVE-IA-FUTURE.md) | Contrato de formato futuro, sujeito ao gate técnico e jurídico |
| O02/O03 | Conversa importada e documentos RAG são dados não confiáveis | `FUTURO` | [VUELVE IA futura](VUELVE-IA-FUTURE.md) | Compatível com a regra já aprovada de proteção contra prompt injection |
| O02 | Pipeline modular de caso, importação, fatos, política, análise, geração, validação e retenção | `FUTURO` | [Arquitetura](ARCHITECTURE.md) | Modelo de domínio, não esquema de banco nem ordem de implementação |
| O02 | Provedor de IA não definido | `CANÔNICO` | [VUELVE IA futura](VUELVE-IA-FUTURE.md) | Decisão posterior escolheu Gemini para geração/embedding e Supabase para RAG |
| O03 | Dados sintéticos até gate jurídico específico | `FUTURO` | [Privacidade, segurança e auditoria](PRIVACY-SECURITY-AUDIT.md) | Nenhum dado real pode entrar em desenvolvimento/QA antes das validações |
| O03 | Consentimentos separados para termos, terceiros, marketing e depoimentos | `FUTURO` | [Privacidade, segurança e auditoria](PRIVACY-SECURITY-AUDIT.md) | Requisito para identidade/casos futuros |
| O03 | Logs, analytics e suporte não recebem conversa bruta | `FUTURO` | [Privacidade, segurança e auditoria](PRIVACY-SECURITY-AUDIT.md) | Minimização e auditoria sem vigilância |
| O03 | Exclusão deve alcançar arquivo, texto, mensagens, fatos, análises, chat, cache, fila e backups conforme política | `FUTURO` | [Privacidade, segurança e auditoria](PRIVACY-SECURITY-AUDIT.md) | Contrato ponta a ponta para gates posteriores |
| O03 | Reembolso/chargeback revoga somente o item correspondente | `FUTURO` | [Integrações futuras](INTEGRATIONS-FUTURE.md) | Confirma a regra de entitlement já documentada |
| O03 | Segurança, não contato e risco vencem reconexão | `FUTURO` | [VUELVE IA futura](VUELVE-IA-FUTURE.md) | Regra de produto e segurança, fora do LLM quando crítica |
| O03 | Retenção, subprocessadores, base legal MX/CO, suporte excepcional e incidente | `PENDENTE` | [Privacidade, segurança e auditoria](PRIVACY-SECURITY-AUDIT.md) | Dependem de decisão jurídica e operacional |
| O04 | Começar fundamentos, auth, uploads, IA e webhooks | `CANÔNICO` | [Checklist](PROJECT-CHECKLIST.md) | Passou a valer apenas após a aprovação explícita do frontend e abertura do Gate 5 |
| O04 | Perfect Pay em staging/simulação | `FUTURO` | [Integrações futuras](INTEGRATIONS-FUTURE.md) | Adapter local está autorizado; smoke test aguarda conta, IDs e payloads reais |
| O04 | Matriz futura de QA por acesso, isolamento, segurança, exclusão e responsividade | `FUTURO` | [Checklist](PROJECT-CHECKLIST.md) | Será refinada quando cada gate for autorizado |

## Conclusão da ingestão

O Oracle ampliou o contexto de domínio, principalmente para VUELVE IA,
privacidade, segurança, retenção e QA. Ele não aprovou valores comerciais nem
liberou fornecedores ou dados reais; a autorização posterior do Gate 5 veio do
usuário, não do Oracle.
