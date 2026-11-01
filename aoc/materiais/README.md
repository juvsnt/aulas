# AOC — Materiais teóricos

Página estática do Prof. Juvenal Silva Neto com nove PDFs em sete unidades e acesso à playlist de videoaulas. Segue o modelo visual e de navegação de `so/materiais/` e funciona sem JavaScript; o script apenas destaca a unidade em leitura.

Os PDFs originais foram copiados de `Produzidos pelo NotebookLM/unidade_1` a `unidade_7`, com nomes normalizados em `pdfs/unXXtYY.pdf`. O arquivo `manifesto.json` registra a correspondência e a quantidade de páginas. Cada capa em `capas/` foi extraída da primeira página do primeiro PDF da unidade. Os PPTX, anotações e o guia do professor da pasta `extras` não integram a página dos alunos.

A organização segue as pastas dos materiais finais: fundamentos; instruções e Assembly (incluindo CISC/RISC); CPU; memória; entrada/saída; pipeline; arquiteturas paralelas. O planejamento preliminar possui oito unidades e numeração diferente; não foi usado para renumerar os arquivos.

Sem dependências ou compilação. Na raiz do repositório, execute `python3 -m http.server 8000` e abra `http://localhost:8000/aoc/materiais/`. Na prévia local, o portal está em `/pages/`; em produção ele fica na raiz.

O portal inclui um cartão para os materiais. O workflow `.github/workflows/deploy-pages.yml` copia esta pasta para `_site/aoc/materiais/` e publica pelo GitHub Pages. Os vídeos são acessados pelo link da playlist fornecida; não há players incorporados ou carregamento automático do YouTube.
