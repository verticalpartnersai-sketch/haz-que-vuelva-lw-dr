# Integrações

## Estado

A infraestrutura e os contratos estão em produção sem credenciais versionadas.
Operações com efeito externo continuam falhando de forma fechada quando
mapeamento, entitlement, segredo ou feature flag estiver ausente.

| Provedor/direção | Responsabilidade prevista | Estado |
|---|---|---|
| Perfect Pay | eventos de compra, cancelamento, reembolso e chargeback | webhook ativo; três produtos e dois order bumps mapeados |
| Supabase Auth/PostgreSQL/Storage | identidade, banco, arquivos privados, RLS e RAG | projeto cloud e migrações ativos; cadastro público fechado e callbacks de produção configurados |
| Resend | convites e emails transacionais | chave, outbox e DNS configurados; envio real ainda não exercitado |
| Gemini | geração e embeddings da VUELVE IA | Container e binding privados configurados; geração bloqueada até smoke real e gate jurídico |
| Cloudflare Workers/Containers | borda, DNS, TLS e execução | marketing e membros publicados; agente sem rota pública após a publicação de endurecimento |

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

Upsell e downsell equivalentes podem mapear para o mesmo entitlement por meio
do wildcard de plano do produto. Order bumps não usam wildcard: cada
`plan_itens[].item_code` precisa de uma oferta exata `item:<item_code>`.

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

- fixture redigida de compra/revogação para cada um dos cinco mapeamentos;
- aprovação comercial dos produtos no painel Perfect Pay;
- smoke de entrega para um destinatário Resend autorizado;
- primeiro admin com TOTP;
- backups, observabilidade, alertas e rollback no Cloudflare.

A topologia e a sequência operacional estão em
[Publicação no Cloudflare](CLOUDFLARE-DEPLOYMENT.md).
