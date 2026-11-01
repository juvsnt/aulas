# Sistemas Operacionais — Materiais teóricos

Página estática do Prof. Juvenal Silva Neto com os 26 PDFs da disciplina,
organizados em cinco unidades, e o link para a playlist de videoaulas.

## Estrutura

- `index.html`: conteúdo, resumos e links; funciona sem JavaScript.
- `styles.css`: identidade visual, navegação responsiva e impressão.
- `script.js`: destaque da unidade em leitura, sem registrar dados do aluno.
- `pdfs/unXXtYY.pdf`: PDFs originais, com nomes normalizados por unidade e tema.
- `capas/unXX.webp`: miniaturas extraídas da primeira página do primeiro PDF de cada unidade.

As unidades seguem a organização das pastas fornecidas pelo professor:
fundamentos (4 materiais), processos e concorrência (8), memória (6),
arquivos (4), entrada/saída e armazenamento (4). Os nomes apresentados na
página foram padronizados para facilitar a leitura. Os PDFs não foram alterados.

Os arquivos vieram de `NotebookLM/un01` a `NotebookLM/un05`; os PPTX não foram
incluídos. Os nomes de arquivo `unXXtYY` preservam os códigos dos originais.
Para substituir um PDF, mantenha o código e atualize a quantidade de páginas,
o tamanho e, se necessário, a descrição no HTML. As capas devem ser atualizadas
se o primeiro material da unidade mudar.

## Prévia e publicação

Não há dependências nem etapa de compilação. Para conferir a integração com
os outros materiais, execute na raiz do repositório:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000/so/materiais/`. Na prévia pela raiz do repositório,
o portal está em `/pages/`; em produção, o workflow o coloca na raiz do site.

O workflow `.github/workflows/deploy-pages.yml` copia esta pasta para
`_site/so/materiais/`. O endereço após publicação é `/aulas/so/materiais/`.
Os PDFs são servidos pelo próprio site. Os links externos da playlist apontam
para o YouTube; não há carregamento automático de players ou rastreadores.
