# Integrações futuras

## Estado

Nenhuma integração está ativa ou autorizada no Gate 3. Este documento delimita
responsabilidades futuras sem inventar endpoints, payloads, IDs, chaves ou
contratos atuais.

| Provedor/direção | Responsabilidade prevista | Estado |
|---|---|---|
| Perfect Pay | eventos de compra, cancelamento, reembolso e chargeback | fornecedor definido; contratos e IDs pendentes |
| Supabase Auth/PostgreSQL | identidade, conversa canônica, autorização e RLS | direção definida; projeto e schema pendentes |
| Cloudflare R2 | arquivos privados e URLs temporárias | direção definida; bucket e política pendentes |
| Resend | convites e emails transacionais | direção definida; domínio e templates pendentes |
| Supermemory | base global aprovada e memória isolada por membro | direção definida; projeto e contratos pendentes |
| Modelo de IA | análise e resposta da VUELVE IA | provedor/modelo pendentes |
| Cloudflare/VPS | borda, DNS, TLS e execução | direção definida; topologia e operação pendentes |

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
- Supermemory não substitui o histórico canônico.
- Resend não concede acesso; convite apenas permite que a usuária defina senha.
- R2 não decide autorização; a aplicação emite acesso curto depois de validar
  objeto e entitlement.
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
- schema/RLS e política de storage;
- templates e remetente;
- contrato atual da Supermemory;
- provedor/modelo e política de dados da IA;
- topologia de VPS, Cloudflare, backups, observabilidade e rollback.
