# SO — Atividades por unidade

Uma atividade avaliativa exclusiva por unidade, independente dos percursos
`praticas/` e `praticas-servidor/`. Cada atividade tem uma **Parte A** (estudo
de caso investigativo em aula, no terminal do LIAC) e uma **Parte B** (lista de
problemas conceituais para o relatório). Os alunos usam C11 e Bash; Python é
apenas ferramenta de manutenção docente.

| Pasta | Unidade | Situação |
| --- | --- | --- |
| `un02/` | II — Processos, gerência da CPU e concorrência (un02t01–t08) | Publicada; falta homologar no LIAC |

## Estrutura de uma unidade

- `unXX/pagina.modelo.html` — fonte editável da página do aluno.
- `unXX/index.html` — página gerada (não editar à mão).
- `unXX/professor.html` — guia docente com mediação, gabarito e rubrica (só local).
- `unXX/arquivos/` — programas C e scripts entregues aos alunos.
- `unXX/PLANEJAMENTO.md` — decisões, alinhamento com os PDFs e pendências (só local).
- `styles.css`, `script.js` — compartilhados, derivados das práticas. Respostas
  ficam no navegador com o prefixo `so-atividade-` e são exportadas em TXT.

## Manutenção

```bash
python3 -I construir.py un02   # gera un02/index.html injetando os fontes de arquivos/
python3 -I verificar.py un02   # confere e executa o roteiro inteiro (~1 min)
```

O modelo usa diretivas no início da linha: `@@CMD`/`@@OUT` … `@@END`, `@@SRC
arquivo`, `@@Q id | rótulo` e `@@DONE n | texto` (detalhes em `construir.py`).
Os fontes não podem conter uma linha `FIM`, que é o delimitador do heredoc.

O verificador exige que todos os arquivos de `arquivos/` apareçam na página,
executa os blocos numa única sessão Bash em pasta temporária, testa as mudanças
orientadas em cópias e falha se algum processo da atividade ficar ativo.

## Publicação

O workflow `.github/workflows/deploy-pages.yml` copia `so/atividades` para
`_site/so/atividades` e remove as ferramentas de manutenção (`*.py`, modelos,
README). Endereço: `/aulas/so/atividades/unXX/`.

O repositório é público. Por isso `unXX/professor.html` (gabarito) e
`unXX/PLANEJAMENTO.md` estão no `.gitignore` e existem **somente no computador
do professor** — faça cópia de segurança deles fora do git.
