# Por dentro do console: sete investigações · Laboratório AOC

Trilha alternativa de práticas em **C11** para a disciplina de **Arquitetura e Organização de Computadores (AOC)**, projetada com nível de dificuldade calibrado para facilitar a compreensão dos estudantes sem abrir mão do rigor conceitual.

A narrativa integradora é o funcionamento de um **videogame retrô 2D**: o aluno investiga como o hardware do computador dá vida a um jogo, desde a representação da vida e itens em bits até a movimentação em Assembly, o ciclo de dano na CPU, a renderização do mapa na memória cache, o joystick e savegame em barramentos de E/S, a meta dos 60 FPS no pipeline e a horda de 1.000 monstros em processadores multicore.

---

## Organização das 7 Unidades

| Unidade | Tema do Jogo | Conteúdo de AOC | Programa em C | Evidência / Método |
| :---: | :--- | :--- | :--- | :--- |
| **01** | Vidas e inventário em bits | Bits, bytes, overflow e máscaras lógicas | `personagem.c` | Execução real e demonstração de overflow de 8 bits |
| **02** | Movimentação e colisão na tela | ISA, Assembly x86-64 e desvios | `movimento.c` | Compilação C e desmontagem com `objdump` |
| **03** | Ciclo da CPU no combate | Caminho de dados, PC, IR, ULA e flag ZF | `cpu_game.c` | Simulação do ciclo Busca-Decodifica-Executa |
| **04** | Mapa da fase na memória cache | Hierarquia de memória e localidade espacial | `mapa_cache.c` | Varredura por linha (hits) vs. por coluna (misses) |
| **05** | Joystick e gravação do savegame | E/S, polling, interrupção e buffers | `io_game.c` | Gravação de arquivo em bloco vs. byte a byte |
| **06** | Meta de 60 FPS e pipeline | Estágios de pipeline, bolhas e speedup | `pipeline_fps.c` | Simulação temporal de quadros e análise de stuttering |
| **07** | Horda de 1.000 inimigos | Multiprocessadores e Lei de Amdahl | `inimigos_multicore.c` | Particionamento de dados e limites de aceleração |

---

## Por que esta trilha é mais acessível?

1. **Eliminação da complexidade acidental em C:**
   - Nenhum uso de ponteiros avançados, aritmética de ponteiros com `memcpy` de floats ou chamadas de sistema obscuras do Linux.
   - Zero uso de `fork()`, `pipe()` ou manipulação de processos concorrentes de baixo nível (conteúdos que pertencem à disciplina de Sistemas Operacionais).
2. **Códigos C limpos e diretos (15 a 30 linhas):**
   - Nomes de variáveis autoexplicativos em português (`vida`, `pocao_cura`, `status`, `pos_x`, `borda`).
   - Uso exclusivo das bibliotecas padrão básicas (`<stdio.h>`, `<stdlib.h>`, `<string.h>`, `<time.h>`).
3. **Metáfora visual e intuitiva:**
   - Todo estudante entende o conceito de vida de personagem, mapa de blocos, botões de controle e quadros por segundo (60 FPS).
   - O feedback do aprendizado é imediato: o aluno vê o bug de overflow acontecendo e entende na hora o motivo.

---

## Verificação e Manutenção do Professor

Na raiz do repositório:

```bash
# Executa e valida todos os blocos dos roteiros HTML e asserções
python3 aoc/praticas-game/verificar.py

# Confere a sintaxe do script de persistência local
node --check aoc/praticas-game/script.js

# Inicia servidor local para prévia
python3 -m http.server 8000
```

Abra `http://localhost:8000/aoc/praticas-game/` no navegador para testar a navegação e a responsividade em celular/desktop.
