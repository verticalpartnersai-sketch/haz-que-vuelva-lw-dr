# Integrações

## Estado

Adapters e contratos locais estão autorizados. Nenhuma integração externa está
ativa; não existem credenciais versionadas nem smoke tests reais autorizados.

| Provedor/direção | Responsabilidade prevista | Estado |
|---|---|---|
| Perfect Pay | eventos de compra, cancelamento, reembolso e chargeback | fornecedor definido; contratos e IDs pendentes |
| Supabase Auth/PostgreSQL/Storage | identidade, banco, arquivos privados, RLS e RAG | schemas locais criados; projeto cloud pendente |
| Resend | convites e emails transacionais | adapter e outbox implementados; domínio e smoke test pendentes |
| Gemini | geração e embeddings da VUELVE IA | adapters implementados e desligados; credencial e smoke test pendentes |
| Cloudflare Workers/Containers | borda, DNS, TLS e execução | configuração local e dry-runs prontos; conta, domínios e publicação pendentes |

## Perfect Pay

Quando autorizado, o adaptador deverá:

- validar autenticidade do evento;
- persistir ID externo e processar com idempotência;
- tolerar retry e ordem fora de sequência;
- mapear item externo para produto canônico;
- conceder somente o entitlement correspondente em compra aprovada;
- revogar somente o entitlement afetado em cancelamento, reembolso ou
  chargeback;
- registrar falha sem segredo ou payload sensível.

Upsell e downsell equivalentes podem mapear para o mesmo entitlement, mas os
códigos, preços e IDs finais continuam pendentes.

## Demais integrações

- SDK ou contrato externo fica atrás de adaptador.
- Segredos nunca chegam ao navegador nem entram na documentação.
- Falha de provedor não cria acesso especulativo nem arquivo público.
- Resend não concede acesso; convite apenas permite que a usuária defina senha.
- Supabase Storage permanece privado; o BFF valida objeto e entitlement e RLS
  impede leitura direta dos originais antes de emitir acesso curto.
- Cada projeto e credencial deve pertencer ao HAZ QUE VUELVA, sem reutilização
  de outro produto.

## Pesquisa antes de implementar

Antes de cada integração, reler o checklist e pesquisar documentação oficial
atual via Exa MCP. Registrar versão da API, autenticação, idempotência, limites,
retenção e divergências em [Pesquisa e fontes](RESEARCH.md) antes de escrever
código.

## Pendências

- catálogo final, IDs externos, preços e links de checkout;
- domínio e subdomínios;
- projetos próprios e credenciais;
- payloads e assinatura atuais da Perfect Pay;
- aplicação e validação cloud do schema, RLS e política de Storage;
- templates e remetente;
- contrato jurídico e política de dados do Gemini;
- conta, domínios, secrets, Containers, backups, observabilidade e rollback no
  Cloudflare.

A topologia e a sequência operacional estão em
[Publicação no Cloudflare](CLOUDFLARE-DEPLOYMENT.md).
