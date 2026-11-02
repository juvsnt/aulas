# SO — Um serviço, cinco investigações

Percurso de práticas em C11 para o terminal Linux do LIAC. Um serviço recebe
quatro leituras (12, 18, 24, 30), calcula o total 84 e produz um relatório.
As cinco unidades conceituais são acompanhadas por 13 práticas de 60 minutos;
a P14 integra as evidências e decisões em um dossiê.

## Planejamento e fontes

O planejamento anterior `planejamento_unidades_so.md`, na pasta docente
`2-SO/Minhas aulas/3-AI`, prevê 14 encontros, 42 horas presenciais e uma hora
de laboratório por encontro. Os 26 materiais publicados são organizados em
cinco unidades: fundamentos (4), processos/concorrência (8), memória (6),
arquivos (4) e dispositivos (4). A unidade VI do planejamento é a síntese final,
não uma sexta unidade de PDFs.

O PPC, seção SO da Resolução 058/2023–CONEPE, registra 60 horas-aulas,
T=3/P=1 e distribuição presencial/a distância de 45/15. A divergência com as
42 horas previstas no planejamento precisa de conferência no calendário e no
plano de ensino; o percurso não afirma integralização automática.

O guia docente apresenta o confronto P01–P14, as adaptações, a mediação,
referências técnicas, respostas de desafios e avaliação. Os materiais antigos
P01/P02/P03 e o Terminal de Bolso continuam disponíveis; não foram substituídos
ou removidos. Não se publicou uma cópia dos documentos administrativos.

## Organização

| Pasta | Práticas | Evidências |
| --- | --- | --- |
| un01 | P01–P02 | Inventário, programa C, biblioteca/API e erro controlado; strace opcional |
| un02 | P03–P06 | Processo finito, fork/exec/wait, modelo FCFS/SJF/RR, threads e mutex |
| un03 | P07–P09 | Buffer de 1 MiB, mapas reais, tradução e substituição simuladas |
| un04 | P10–P11 | Arquivos/links/permissões reais; alocação e bitmap simulados |
| un05 | P12–P13 | read/write, sysfs, driver documental e modelo FCFS/SSTF de HDD |
| sintese | P14 | Serviço e dossiê: evidência de cada unidade e decisões justificadas |

O site funciona sem JavaScript para leitura e navegação. `script.js` acrescenta
cópia, tema, marcação de práticas, respostas locais e exportação TXT. Não há
backend, envio automático, nota ou presença. Chaves de armazenamento usam
prefixo próprio `so-servico-`, independente de AOC. Cada fonte no HTML corresponde
ao arquivo em `arquivos/` e ao ZIP. O download no aparelho não transfere arquivos
para a conta do terminal.

## Ambiente e limites

Alunos: Bash, GCC/C11, biblioteca C/POSIX, pthreads e utilitários Linux usuais.
Python é somente uma ferramenta de manutenção do professor, não do aluno.
O ambiente LIAC precisa de homologação com a conta de aluno. A documentação
informa uma CPU de quota, cerca de 1 GiB de memória, 200 processos e 50 MB de
arquivos; isso não foi auditado no servidor.

Cada programa termina sem interação. Somente P04 cria um filho; P06 usa duas
threads; P03 acompanha um sleep finito de dois segundos e o recolhe com wait.
Não há sudo, rede de saída, montagem/formatação, discos brutos, mudança de módulos,
chown, stress de memória ou deadlock real. Os arquivos gerados no conjunto dos
testes, incluindo cópias das variantes e executáveis, ficam abaixo de 1 MiB.
Não se exige ganho de velocidade ou valores fixos de PID/endereço/contadores.

P06 usa acessos atômicos separados com interleaving controlado para demonstrar
perda de atualização sem data race de C; mutex protege a operação completa.
A P11 troca a imagem de disco montada do planejamento por um modelo de alocação,
sem afirmar equivalência com testar um filesystem real. Ferramentas opcionais
(strace, lsmod, modinfo, etc.) possuem alternativa documental rotulada.

## Verificação e publicação

Na raiz do repositório:

```bash
python3 so/praticas/verificar.py
node --check so/praticas/script.js
python3 -m http.server 8000
```

Abra `/so/praticas/`. O verificador executa blocos principais em pastas
temporárias, compara referências e mudanças propostas, confere limites de
entrada, fontes no HTML e integridade do ZIP. As extensões opcionais não fazem
parte desse teste. Os programas também foram compilados com avisos tratados
como erros e executados com verificação de comportamento indefinido.

A validação no navegador cobre larguras 320, 390, 768 e 1440, persistência local,
exportação, cópia, tema, navegação sem JavaScript e destinos locais. Isso não
substitui dispositivos físicos ou aula piloto no LIAC.

O workflow copia `so/praticas` para `_site/so/praticas`. As entradas estão na
página da disciplina, no portal e nos materiais. Alterações ficam locais até
commit/push autorizado. Para atualizar fontes, modifique também o bloco HTML,
as saídas afetadas, o ZIP e execute o verificador.
