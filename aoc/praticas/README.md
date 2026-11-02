# Laboratório AOC — Uma estação, sete investigações

Sete roteiros móveis para o terminal Linux do LIAC, ligados por uma estação didática de monitoramento. Cada um contém objetivo, previsão, comandos copiáveis, explicação, saídas esperadas, interpretação e desafio. O percurso está em `index.html`; `professor.html` apresenta planejamento, dependências, critérios e referências.

## Contexto e organização

Dados brutos: 12, 18, 24 e 30 °C, total 84, média 21. Calibração: +2; alerta quando a leitura corrigida >=24; dois alertas. As pastas independentes usam `~/atividades/aoc-estacao/un01` a `un07`.

| Unidade | Investigação | Natureza |
| --- | --- | --- |
| 1 | Arquitetura, bytes, bases, sinal, overflow explícito, lógica e floats | Inventário real e representação por software |
| 2 | C, Assembly, bytes do executável e CISC/RISC | Compilação x86-64 real; comparação de ISAs conceitual |
| 3 | PC, IR, ULA, controle, flags e memória | CPU didática; GDB real opcional |
| 4 | Cache, conflitos, localidade e hierarquia | Inventário real e cache simulada |
| 5 | Entrada, buffer, relatório, polling/interrupção/DMA | Arquivo real e modelo de custos |
| 6 | Pipeline, bolhas, CPI, clock e speedup | Modelo temporal com hipóteses explícitas |
| 7 | Somas parciais, processos, quota e Amdahl | Processos locais reais; arquiteturas especializadas conceituais |

A ordem segue as sete pastas finais, incluindo os três PDFs de instruções/Assembly/CISC-RISC na unidade 2. As capas de memória e E/S possuem numeração antiga, registrada no guia docente.

## Ambiente e limites

Analisados os nove PDFs de AOC e os documentos locais do projeto `labhw_dellxps`: guia de implantação, tutorial v4 e proposta de interface móvel. Foram usados apenas dados necessários ao planejamento; não foram publicadas configurações administrativas ou credenciais.

A documentação descreve Mint 22.3, i7-6700 e restrições por conta (uma CPU, 1 GiB, 200 processos e 50 MB), sem rede externa e sem sudo. O estado atual do LIAC e os pacotes precisam de homologação pelo professor. Nenhum acesso ao servidor foi realizado nem sua configuração alterada.

Dependências dos alunos: Bash, GCC (C11), biblioteca C/POSIX do Linux, Binutils e utilitários Linux comuns. GDB é apenas complementar. Não há instalação ou downloads pelo terminal do aluno. Os blocos here-document criam os arquivos por colagem; o pacote ZIP é para revisão/preparação, não pressupõe transferência automática do navegador ao servidor.

Todos os testes locais criam menos de 1 MiB de arquivos de trabalho. Os programas são finitos; a prática 7 abre apenas dois trabalhadores. Os tempos reais não têm alvo de aceleração e não devem ser usados para ranquear estudantes.

## Página e manutenção

- `un01/` a `un07/`: roteiros estáticos; o conteúdo e os links funcionam sem JavaScript.
- `styles.css`: base visual adaptada do Terminal de Bolso, com fontes de fallback locais.
- `script.js`: cópia, tema, progresso e respostas locais por unidade; exportação TXT no aparelho do aluno. Sem backend e sem envio automático de dados.
- `arquivos/`: fontes legíveis, GDB opcional, diagnóstico somente de leitura e ZIP correspondente.
- `verificar.py`: executa os blocos principais extraídos do HTML em diretórios temporários e confere resultados e desafios.

Ao alterar um programa, atualize o bloco correspondente no roteiro e o ZIP. O verificador confirma a integridade do pacote e os resultados. Os endereços e instruções geradas pelo compilador podem mudar; as saídas que variam estão identificadas.

## Verificação e publicação

Ferramentas de manutenção do professor (Python somente para o verificador e servidor local; não é usado pelos alunos). Na raiz do repositório:

```bash
python3 aoc/praticas/verificar.py
node --check aoc/praticas/script.js
python3 -m http.server 8000
```

Abra `/aoc/praticas/`. O CSS da página de entrada da disciplina está em `pages/disciplinas.css` no repositório e é copiado para a raiz na publicação. O workflow do GitHub Pages copia `aoc/praticas` para `_site/aoc/praticas`.

A extensão GDB não foi executada localmente por ausência dessa ferramenta. Android/iPhone físicos e as quotas reais requerem teste no LIAC. O roteiro principal pode ser conferido com navegador emulado e sem JavaScript; isso não substitui uma aula piloto no servidor.

## Integração com hardware e planejamento

As sete unidades possuem uma conexão de bancada com campo exportável nas respostas. O dossiê progressivo termina em uma recomendação de hardware para dois cenários de uso da estação, com requisitos declarados, evidências e limites. A observação pode usar máquinas desligadas, fotos e documentação identificadas. O guia docente propõe 13 blocos de 60 minutos, retoma RISC/CISC após CPU e integra a avaliação à rubrica existente. A distribuição deve ser conferida com a carga horária institucional; não equivale automaticamente às 60 horas-aulas do PPC.

## Linguagem das investigações

Todos os programas dos alunos estão em C11. Os roteiros fornecem fontes, compilação GCC com avisos e sem otimização, execução e explicações das operações relevantes. A U7 usa processos POSIX/Linux (fork, pipe, waitpid), com infraestrutura fornecida; não pressupõe domínio dessas APIs. C++ não é necessário. Os simuladores continuam sendo modelos didáticos, mesmo compilados em C. Na U1, a interpretação com sinal é matemática e o truncamento explícito; a saída float32 é referida ao alvo Linux x86-64. A U5 conta chamadas fread da biblioteca, sem inferir chamadas de sistema ou transferências de disco.
