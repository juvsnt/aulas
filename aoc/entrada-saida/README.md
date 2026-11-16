# Quem chama a CPU? — AOC, Unidade 5

Atividade individual sobre entrada/saída, interfaces e barramentos: três
atividades de até 30 min no Terminal Linux do LIAC e uma síntese. Publicada em
https://juvsnt.github.io/aulas/aoc/entrada-saida/.

| Arquivo | Finalidade |
| --- | --- |
| `pagina.modelo.html` | Texto da página; `construir.py` gera `public/index.html`. |
| `public/arquivos/*.c` | Programas dos alunos (C11), inseridos na página como blocos copiáveis. |
| `public/app.js` | Salvamento no navegador, botão Copiar e bloco que grava `entrega-es.txt` no LIAC. |
| `verificar.py` | Executa os blocos da página numa HOME temporária e testa o arquivo final. |
| `docente-local/` | Planejamento e guia docente; ignorado pelo Git, nunca publicar. |

```bash
python3 aoc/entrada-saida/construir.py
python3 aoc/entrada-saida/verificar.py
node --check aoc/entrada-saida/public/app.js
```

A1 é medição real (`/proc/interrupts`). A2 e A3 são medições reais de
analogias em software (polling × bloqueio; custo por pedido de leitura), não
medem periférico nem DMA. A publicação copia só `index.html` e `public/`.
Python é ferramenta docente; os alunos usam C e Bash.
