# Pesquisa e fontes — VUELVE IA e marketing

> Continuação de [Pesquisa e fontes](RESEARCH.md), com decisões da VUELVE IA e
> das ofertas pós-compra do marketing.

## Registro de fontes — VUELVE IA conversacional, RAG e diagnóstico

Pesquisa atualizada em 1 de agosto de 2026 com Agent Reach/Exa e documentação
primária do Google.

- [Gemini API — System instructions](https://ai.google.dev/gemini-api/docs/system-instructions):
  instruções críticas pertencem a `systemInstruction`, separado do conteúdo da
  usuária e do contexto recuperado.
- [Gemini API — Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output):
  JSON Schema restringe a forma da resposta, mas a aplicação ainda precisa
  validar semanticamente o conteúdo recebido.
- [Gemini API — Embeddings](https://ai.google.dev/gemini-api/docs/embeddings):
  `gemini-embedding-2` aceita dimensionalidade configurável; consulta e
  documentos precisam usar instrução de tarefa compatível e o mesmo espaço de
  embedding.
- [Gemini API — File Search](https://ai.google.dev/gemini-api/docs/file-search):
  a arquitetura oficial combina divisão em chunks, embeddings e recuperação
  antes da geração, em vez de inserir todos os documentos em toda chamada.
- [Google AI — Responsible generative AI](https://ai.google.dev/responsible):
  recomenda políticas de uso, testes adversariais e barreiras determinísticas
  além das instruções do modelo.

Decisões: o prompt é versionado no Postgres e enviado como `systemInstruction`;
o material recuperado é delimitado como dado sem autoridade; respostas e
diagnósticos usam schema e validação Pydantic. A base canônica é `ai_documents`
e `ai_chunks` no Supabase/Postgres, não R2, porque a arquitetura atual já possui
pgvector e R2 foi removido do escopo. Documentos globais carregam `product_code`
e só entram na busca quando o BFF confirma o entitlement correspondente.

A exportação do WhatsApp é decodificada em memória, aceita apenas `.txt` UTF-8
ou `.zip` contendo exclusivamente `.txt`, aplica limites de tamanho, quantidade
de entradas, path traversal e taxa de compressão e não persiste o arquivo bruto.
O diagnóstico completo é reservado transacionalmente uma vez a cada 30 dias.
As respostas conversacionais usam uma janela móvel de 24 horas e não permitem
que o modelo decida ou altere cotas. Conteúdo real de conversas continua
bloqueado até a aprovação jurídica prevista no Oracle para México e Colômbia;
QA anterior a esse gate usa apenas dados sintéticos.

## Registro de fontes — encadeamento comercial UP2/D2

Pesquisa atualizada em 4 de agosto de 2026 com Agent Reach/Exa, documentação
oficial da Perfect Pay e o contrato comercial canônico do produto.

- [Perfect Pay — Upsell OneClick](https://help.perfectpay.com.br/article/141-upsell-one-click):
  cada oferta pós-compra cadastra o link do upsell e a página de obrigado; a
  página seguinte pode ser outra oferta da cadeia.
- [Perfect Pay — Página de Obrigado](https://help.perfectpay.com.br/article/128-como-configurar-minha-pagina-de-obrigado-na-perfect-pay):
  documenta a configuração do destino após a decisão comercial.
- [Shopify — Post-purchase product offer UX](https://shopify.dev/docs/apps/build/checkout/product-offers/ux-for-post-purchase-product-offers):
  recomenda que a oferta pós-compra preserve a confiança na marca com estilo
  coerente, imagem fiel do produto, descrição concisa e decisões claras.
- [NIST — Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence):
  recomenda transparência sobre limites, privacidade e avaliação antes do uso.

Decisão: a recusa de D1 conclui em `/gracias`; compras aceitas avançam pela
página de obrigado configurada no painel. A recusa de UP2 abre `/d2`, e a
recusa de D2 conclui em `/gracias`. D2 mantém exatamente os 30 dias, formatos,
limites e funções de VUELVE IA definidos no Oracle; somente a condição
comercial muda de US$20 para US$15. Nenhuma hero mostra preço, e o exemplo de
análise é sintético e explicitamente rotulado. O checkout de D2 permanece
fail-closed até existir `NEXT_PUBLIC_DOWNSELL_2_ACCEPT_URL` aprovada.

Essa regra de preço registra uma decisão anterior de 4 de agosto e foi
substituída pela decisão comercial posterior do mesmo dia descrita abaixo.

Decisão visual posterior: UP2 e D2 passaram a herdar diretamente o sistema
`r30-*` da página final, de UP1 e de D1, inclusive botões, ritmos, cards,
depoimentos e rodapé. O mockup inventado em HTML/CSS foi substituído por
capturas reais da VUELVE IA em desktop e mobile, obtidas localmente com uma
conversa sintética e integrações reais desativadas. ImageGen não foi usado para
fabricar uma tela do produto; somente variantes transparentes do logo aprovado
foram derivadas mecanicamente.

Pesquisa atualizada em 4 de agosto de 2026 com Agent Reach/Exa. A orientação
oficial da Shopify para ofertas pós-compra determina que, quando a oferta tem
desconto, o preço original deve aparecer riscado ao lado do preço reduzido; a
mesma documentação recomenda opções claras de aceitar ou recusar e rejeita
pressão enganosa. Decisão: UP1 e UP2 continuam sem preço na hero; D1 e D2,
que encerram a oferta dos respectivos produtos quando recusados, comunicam a
última oportunidade com `US$6,90 → US$4,90` e `US$20 → US$15`. A urgência é
baseada no fluxo real, sem contador ou escassez fabricada.

As capturas da VUELVE IA foram refeitas em desktop, tablet e mobile depois de
três interações sintéticas diferentes no modo de demonstração local. Nenhuma
integração real foi ativada e nenhum dado de aluna foi acessado. A seção
“Esto es lo que vas a abrir...” foi removida de UP2; as capturas multietapas
permanecem somente no mockup principal compartilhado por UP2 e D2.
