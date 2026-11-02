# Por dentro do servidor: catorze investigações · Laboratório SO

Trilha alternativa de práticas em **C11** para a disciplina de **Sistemas Operacionais (SO)**, desenvolvida com contexto realista e nível de dificuldade calibrado para os estudantes do Bacharelado em Ciência da Computação (UNEMAT).

A narrativa integradora é a arquitetura e operação de um **servidor web na nuvem**: o aluno investiga como o sistema operacional gerencia chamadas de sistema, trabalhadores com `fork()`, escalonamento de requisições, exclusão mútua de curtidas com `pthread_mutex`, memória virtual com paginação de 4 KB, cache de imagens com LRU/FIFO, segurança de arquivos com inodos e permissões `chmod`, gravação de logs em buffer e métricas do kernel em `/proc`.

---

## Organização das 14 Práticas (P01 a P14)

| Prática | Unidade | Tema no Servidor | Conteúdo de SO | Programa / Método |
| :---: | :---: | :--- | :--- | :--- |
| **P01** | U01 | O servidor na nuvem | Inventário real do Linux e limites de conta | Bash: `uname`, `free`, `df`, `ps` |
| **P02** | U01 | Primeira requisição e Erro 404 | Syscalls (`open`, `read`, `write`), `errno` e kernel | `servidor_basico.c` |
| **P03** | U02 | Servidor em background | Estados de processos, sinais `STOP`/`CONT` e `wait` | Bash + sinais Linux |
| **P04** | U02 | Trabalhadores com fork | `fork()`, `exec()`, `waitpid()` e isolamento de RAM | `servidor_fork.c` |
| **P05** | U02 | Fila de requisições | Escalonamento: FCFS, SJF e Round Robin (quantum) | `escalonador_web.c` |
| **P06** | U02 | Contador de curtidas (Likes) | Threads concorrentes e exclusão mútua com Mutex | `contador_likes.c` (`-pthread`) |
| **P07** | U03 | Buffer de cache no Heap | Espaço de endereçamento e mapas em `/proc/self/maps` | `memoria_servidor.c` |
| **P08** | U03 | Tradução de memória virtual | Páginas de 4 KB, VPN, deslocamento e Page Fault | `traducao_paginas.c` |
| **P09** | U03 | Cache de imagens na RAM | Algoritmos de substituição de páginas: FIFO vs. LRU | `cache_paginas.c` |
| **P10** | U04 | Protegendo arquivos do site | Inodes, permissões de acesso (`chmod`) e symlinks | Bash: `chmod`, `ln -s`, `stat` |
| **P11** | U04 | Como o site fica no disco | Blocos de 4 KB no ext4 e fragmentação interna | `disco_blocos.c` |
| **P12** | U05 | Gravando o access.log | Buffers de E/S em lote vs. chamadas diretas | `logs_buffer.c` |
| **P13** | U05 | Painel de telemetria | Métricas de CPU, memória e disco em `/proc` | Bash: `/proc/loadavg`, `/proc/meminfo` |
| **P14** | Síntese | A vida de uma requisição web | Dossiê integrado dos subsistemas de E/S, CPU e RAM | Relatório e síntese técnica |

---

## Verificação e Manutenção do Professor

Na raiz do repositório:

```bash
# Executa e valida todos os blocos dos roteiros HTML e asserções
python3 so/praticas-servidor/verificar.py

# Confere a sintaxe do script de persistência local
node --check so/praticas-servidor/script.js

# Inicia servidor local para prévia
python3 -m http.server 8000
```

Abra `http://localhost:8000/so/praticas-servidor/` no navegador para testar a navegação e a responsividade em celular/desktop.
