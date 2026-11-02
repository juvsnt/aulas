# Sistemas Distribuídos — Materiais teóricos

Página estática do Prof. Juvenal Silva Neto com doze PDFs em dez unidades e acesso à playlist fornecida. Segue a identidade visual e a navegação dos materiais de SO e AOC. O conteúdo e os links funcionam sem JavaScript; o script apenas destaca a unidade em leitura.

Os originais vieram das pastas `notebook-lm/unidade 01` a `unidade 10`. Os nomes foram normalizados em `pdfs/unXXtYY.pdf`, preservando a sequência. A unidade 9 contém arquivos, nomes e memória compartilhada distribuída. `manifesto.json` registra a correspondência com os originais e a quantidade de páginas. As capas em `capas/` foram extraídas da primeira página do primeiro PDF de cada unidade. Os PPTX e os documentos da pasta `extras` não integram a página dos alunos.

Não há dependências ou compilação. Na raiz do repositório, execute `python3 -m http.server 8000` e abra `http://localhost:8000/sd/materiais/`. Na prévia local, o portal está em `/pages/`; em produção ele fica na raiz.

O workflow `.github/workflows/deploy-pages.yml` copia esta pasta para `_site/sd/materiais/`. Os vídeos são acessados pelo link da playlist, sem carregamento automático de players do YouTube.
