# Linha de montagem de instruções — AOC, Unidade 6

Atividade individual sobre pipeline e desempenho: três atividades de até
30 min no Terminal Linux do LIAC e uma síntese. Base: slides da unidade
(`materiais/pdfs/un06t01.pdf`) e capítulo 8 de Silva e Borges,
*Arquitetura de Computadores: uma introdução* (citado, não reproduzido).

| Arquivo | Finalidade |
| --- | --- |
| `pagina.modelo.html` | Texto da página; `construir.py` gera `public/index.html`. |
| `estudo.modelo.html` | Estudo dirigido da teoria (seção 8.1 e slides); `construir.py` gera `public/estudo.html`, que grava `estudo-pipeline.txt`. |
| `public/arquivos/*.c` | Programas dos alunos (C11), inseridos na página como blocos copiáveis. |
| `public/app.js` | Salvamento no navegador, botão Copiar e bloco que grava `entrega-pipeline.txt` no LIAC. |
| `verificar.py` | Executa os blocos da página numa HOME temporária e testa o arquivo final. |
| `docente-local/` | Planejamento e guia docente; ignorado pelo Git, nunca publicar. |

```bash
python3 aoc/pipeline/construir.py
python3 aoc/pipeline/verificar.py
node --check aoc/pipeline/public/app.js
```

A1 é simulação (`pipeline.c`, pipeline didático de 5 estágios). A2 combina a
simulação de bolhas/adiantamento com medição real do somador de ponto
flutuante (`cadeias.c`). A3 é medição real da predição de desvios
(`desvios.c`). Todos compilam com `-O1`: `-O0` mediria a memória e `-O2`
vetoriza as cadeias. A publicação copia só `index.html` e `public/`.
