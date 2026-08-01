# Manifesto dos conteúdos editoriais

Data da validação: 31 de julho de 2026

Os PDFs abaixo são os entregáveis finais em espanhol encontrados no Oracle e
preparados para publicação na área de membros. Os binários continuam fora do
Git público e permanecem no diretório canônico de produtos do Oracle.

Diretório canônico, relativo à raiz pessoal:

`Documents/Obsidian Vault/ORACLE/VERTICAL PARTNERS/Operação LW DR/Operação 01 - Documentação/4. Produtos e Entregáveis/Produtos`

## Originais preservados

| Produto | Arquivo original | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| Haz Que Vuelva | `00. Produto FRONT/01_Haz_Que_Vuelva_Protocolo_7_Dias_FINAL.pdf` | 14.945.993 | `63303e023123f72814e5618e19996ab85c408e60bce26db874c2a81a2ea5bec8` |
| 21 Mensajes de Reconexión | `01. Produto ORDER-BUMP/02_21_Mensajes_de_Reconexion_FINAL.pdf` | 9.677.676 | `eae663939eb365911982502da4946f3fb75b527f3831463e727f8d125e21a4a2` |
| La Otra | `01. Produto ORDER-BUMP/03_La_Otra_Plan_de_Reconquista_FINAL.pdf` | 10.855.518 | `823c6f752c5c76f3d7c3d66596ecd4374383fc08dbff449bf449625ba790a731` |
| Reconquista 30 | `02. Produto UPSELL/04_Reconquista_30_FINAL.pdf` | 15.531.777 | `736ce714499df2d68478598f01077f7e1cf4cfc5d857b98bc49bf9e7b2fd0539` |

## Arquivos publicáveis

| Produto | Código | Arquivo web final | Páginas | Bytes | SHA-256 |
| --- | --- | --- | ---: | ---: | --- |
| Haz Que Vuelva | `haz_que_vuelva` | `00. Produto FRONT/01_Haz_Que_Vuelva_Protocolo_7_Dias_WEB_FINAL.pdf` | 43 | 1.429.773 | `e6753c7f97e832cd7f073bc6fd959c89eb69633302495fdc4c880cd7816e5989` |
| 21 Mensajes de Reconexión | `21_mensajes` | `01. Produto ORDER-BUMP/02_21_Mensajes_de_Reconexion_WEB_FINAL.pdf` | 29 | 844.698 | `5b86d14365fdb4f59899041d425cca845a7093db23b62a98b6a13a171faad1e9` |
| La Otra | `la_otra` | `01. Produto ORDER-BUMP/03_La_Otra_Plan_de_Reconquista_WEB_FINAL.pdf` | 22 | 950.597 | `493c18914f4e9a601b06e52be76d86106b6bca9327da81bf201374c765e5b22d` |
| Reconquista 30 | `reconquista_30` | `02. Produto UPSELL/04_Reconquista_30_WEB_FINAL.pdf` | 50 | 1.539.255 | `58730b9dd580cf7e4ed296fcf0fb6af922973d3973373ac0371bb5aeaf044322` |

`vuelve_ia` não recebe PDF: é um produto interativo e permanece bloqueado pelo
gate próprio de consentimento, conhecimento, prompt, custo e isolamento.

## Evidência de validação

- todos os arquivos possuem assinatura PDF, formato A5 e não são criptografados;
- todos ficam abaixo do limite de upload de 12 MiB e do limite de 300 páginas;
- o inspetor `PdfLibContentInspector` aceitou os quatro arquivos e confirmou
  respectivamente 43, 29, 22 e 50 páginas;
- o texto extraído dos arquivos web é idêntico ao texto dos originais;
- todas as 144 páginas foram renderizadas pelo Poppler nas duas versões;
- comparação raster página a página encontrou diferença média entre 4,299 e
  5,858 níveis RGB em 255, compatível com recompressão visual;
- capas, páginas representativas e as páginas de maior diferença foram
  inspecionadas sem corte, sobreposição, página ausente ou texto ilegível.

## Procedimento reproduzível

Ferramentas usadas: Python 3.9.6, PyMuPDF 1.26.5, Pillow 11.3.0, NumPy 1.26.4,
Poppler 25.12.0, Node.js 22.18.0 e `pdf-lib` 1.17.1.

As versões web foram geradas a partir de cópias dos originais com o método
`Document.rewrite_images(dpi_threshold=180, dpi_target=144, quality=82,
lossy=True, lossless=True)` do PyMuPDF e salvas com limpeza, deflate e descarte
de objetos não utilizados. Os originais não foram sobrescritos.

Para repetir as verificações, execute a partir do diretório canônico:

```bash
shasum -a 256 \
  "00. Produto FRONT/01_Haz_Que_Vuelva_Protocolo_7_Dias_FINAL.pdf" \
  "00. Produto FRONT/01_Haz_Que_Vuelva_Protocolo_7_Dias_WEB_FINAL.pdf" \
  "01. Produto ORDER-BUMP/02_21_Mensajes_de_Reconexion_FINAL.pdf" \
  "01. Produto ORDER-BUMP/02_21_Mensajes_de_Reconexion_WEB_FINAL.pdf" \
  "01. Produto ORDER-BUMP/03_La_Otra_Plan_de_Reconquista_FINAL.pdf" \
  "01. Produto ORDER-BUMP/03_La_Otra_Plan_de_Reconquista_WEB_FINAL.pdf" \
  "02. Produto UPSELL/04_Reconquista_30_FINAL.pdf" \
  "02. Produto UPSELL/04_Reconquista_30_WEB_FINAL.pdf"
pdfinfo ARQUIVO_WEB_FINAL.pdf
pdftotext ARQUIVO_FINAL.pdf original.txt
pdftotext ARQUIVO_WEB_FINAL.pdf web.txt
cmp original.txt web.txt
pdftoppm -r 72 -png ARQUIVO_FINAL.pdf /tmp/original
pdftoppm -r 72 -png ARQUIVO_WEB_FINAL.pdf /tmp/web
```

A comparação raster foi calculada página a página sobre renderizações RGB na
mesma resolução, usando a média absoluta de `abs(original - web)` com NumPy.
Foram obtidas as médias globais 5,858 (Haz Que Vuelva), 4,299 (21 Mensajes),
5,682 (La Otra) e 5,007 (Reconquista 30), numa escala de 0 a 255. Todas as 144
páginas das duas famílias renderizaram sem erro.

O aceite pelo mesmo inspetor da aplicação pode ser repetido na raiz do
repositório com `npm --prefix apps/web run content:preflight`. O comando
fail-closed confere caminho, bytes, SHA-256 e páginas dos quatro PDFs com o
mesmo inspetor da aplicação. Com `--remote`, ele também confirma que os quatro
produtos estão ativos no projeto Supabase definitivo e informa quantos itens
já foram publicados, sem modificar arquivos nem banco.

## Próximo gate

Os arquivos ainda não estão no Supabase. A publicação deve ocorrer pelo módulo
`Contenido` com a conta do proprietário canônico e reautenticação curta.
Depois da publicação, o aceite exige armazenamento privado, geração da cópia
individual marcada e teste positivo/negativo com duas contas distintas.
