# SO — Atividades por unidade

Uma atividade avaliativa exclusiva por unidade, independente dos percursos
`praticas/` e `praticas-servidor/`. Cada atividade tem uma **Parte A** (estudo
de caso investigativo em aula, no terminal do LIAC) e uma **Parte B** (lista de
problemas conceituais para o relatório). Os alunos usam C11 e Bash; Python é
apenas ferramenta de manutenção docente.

| Pasta | Unidade | Situação |
| --- | --- | --- |
| `un02/` | II — Processos, gerência da CPU e concorrência (un02t01–t08) | Publicada; falta homologar no LIAC |
| `un03/` | III — Gerência de memória (un03t01–t06): 3 atividades de até 30 min + 8 problemas | Publicada (9ac25ab); falta homologar no LIAC |
| `un04/` | IV — Arquivos e sistemas de arquivos (un04t01–t04): 3 atividades de até 30 min + 8 problemas | Pronta localmente; não publicada; falta homologar no LIAC |
| `un04-passos/` | IV — Versão simples (só t01 e t02): árvore, atributos, permissões e FD; um comando por passo; código C no nano, separado de compilar e rodar | Publicada em 17/11/2026; falta homologar no LIAC |
| `un04-blocos/` | IV — Prática 2 (t03 e t04): volume, blocos, fragmentação interna, extents e mapa de bits; um comando por passo | Publicada em 17/11/2026; testada no LIAC |
| `un04-codigo/` | IV — Investigar código C pronto: syscalls, FD, E/S com e sem buffer, argc/argv, diretórios (atividade separada) | Pronta localmente; não publicada; falta homologar no LIAC |
| `un05/` | V — Gerência de dispositivos (só t01 e t02): bloco × caractere em /dev, polling × interrupção (`espera.c` + /proc/stat), buffer e cache com dd, síntese | Publicada em 24/11/2026; testada no LIAC (cota de disco: arquivos de 10 MiB) |

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
python3 -I construir.py un03
python3 -I verificar.py un03   # ~5 s
python3 -I construir.py un04   # acrescenta '# fim do bloco' e links @@SLIDE
python3 -I verificar.py un04   # cola cada bloco com '~' no fim; ~3 s
python3 -I construir.py un04-codigo
python3 -I verificar.py un04-codigo   # 17 verificacoes
python3 -I construir.py un04-passos
python3 -I verificar.py un04-passos   # 16 verificacoes; exige 1 linha com comentario por passo
python3 -I construir.py un04-blocos
python3 -I verificar.py un04-blocos   # 9 verificacoes
python3 -I construir.py un05
python3 -I verificar.py un05   # 11 verificacoes; ~20 s (dd e esperas de 2 s e 10 s)
```

O modelo usa diretivas no início da linha: `@@CMD`/`@@OUT` … `@@END`, `@@SRC
arquivo`, `@@Q id | rótulo [| dica]` e `@@DONE n | texto` (detalhes em `construir.py`).
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
