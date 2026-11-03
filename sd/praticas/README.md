# SD — Uma estação, vários nós

Percurso de práticas em C11 para o terminal Linux do LIAC, seguindo as
práticas finais de AOC e SO. A estação fornece 12, 18, 24 e 30: total 84,
média 21. A investigação passa da máquina e do serviço às mensagens,
coordenação, réplicas, transações, falhas e proteção do serviço.

São 12 investigações em dez unidades e uma síntese (P13). Cada investigação
contém previsão, fonte fornecido, compilação, execução, interpretação,
mudança orientada, evidências e decisão. `professor.html` reúne cobertura,
mediação, respostas, rubricas e condições de homologação.

| Pasta | Práticas | Natureza da evidência |
| --- | --- | --- |
| un01 | P01: participantes e fronteiras | Um produtor filho, agregador pai e pipe reais |
| un02 | P02: bytes e mensagens | Pipe real; TCP loopback em extensão opcional |
| un03 | P03: tempo e causalidade | Modelo de eventos e Lamport |
| un04 | P04: token e liderança | Modelo de exclusão, falha do titular e visões de membros |
| un05 | P05: comunicação em grupo | Modelo de chegada, dependência causal e fila |
| un06 | P06: réplicas | Conflito, convergência e contador por componentes |
| un07 | P07: transações | Modelo 2PC, preparo, decisão e bloqueio |
| un08 | P08: falhas e repetição | Omissão de resposta, retry, deduplicação e perda de metadados |
| un09 | P09–P11: arquivos, nomes, DSM | Três modelos separados de cache, TTL e página compartilhada |
| un10 | P12: segurança | Autorização e replay sob identidade previamente autenticada |
| sintese | P13: arquitetura | Dossiê com requisitos, evidências, incidentes e defesa |

## Fontes e escolhas de ambiente

Foram consultados os 12 PDFs publicados da disciplina, com leitura apoiada
por OCR porque os slides são imagens, o roteiro WSL das unidades 1–3 e os
percursos finais de AOC e SO. O planejamento inicial fica preservado em
`../PLANEJAMENTO_PRATICAS.md` e `planejamento.md`. Outro plano docente de SD
ainda não foi indicado; as estimativas de 60–90 minutos por investigação
não definem carga horária institucional ou número obrigatório de encontros.

Alunos usam Bash, GCC/C11 e biblioteca C/POSIX. Não há Python, sudo,
instalação ou download no terminal. A documentação do LIAC registrada no
planejamento informa uma CPU, cerca de 1 GiB, 200 processos e 50 MB por
conta, com restrição de conexões possivelmente inclusive em localhost.
Esses dados não são auditoria da configuração atual. Nenhum acesso ao LIAC
ou alteração de políticas foi realizado.

`estacao.c` cria um filho, fecha descritores, trata leituras/escritas parciais
e recolhe o filho. Os demais programas do núcleo são modelos sequenciais,
sem threads ou processos adicionais. Os modelos terminam em poucos passos;
os programas de IPC têm alarme de contingência de cinco segundos. O teste
completo inclui fontes, executáveis e versões UBSan em menos de 1 MiB.

A extensão `tcp_local.c` requer ambiente autorizado: loopback 127.0.0.1,
porta atribuída pelo sistema, um filho e um único lote finito. Ela é separada
do núcleo e não demonstra comunicação entre máquinas. Não há escuta em todas
as interfaces, varredura de portas, captura de tráfego ou firewall alterado.
O roteiro WSL anterior permanece disponível em `../un01-02-03/`.

## Página e manutenção

O conteúdo, os fontes e a navegação funcionam sem JavaScript. O script
acrescenta cópia, tema, conclusão pessoal, respostas locais por unidade e
exportação TXT no aparelho, usando prefixo `sd-estacao-` independente de AOC
ou SO. Não há backend, envio automático, presença ou nota. Sem JavaScript,
o aluno registra em arquivo próprio. Exportações das unidades são reunidas
pelo aluno, sem agregação automática no site.

`gerar.py` mantém os roteiros e gera HTML e ZIP a partir de `arquivos/*.c`.
Para alterar uma atividade, edite o roteiro no gerador e/ou o fonte, ajuste
as referências e os testes e regenere. O ZIP inclui os 12 fontes C (incluindo
a extensão TCP) e o diagnóstico Bash. O download no navegador não coloca o
arquivo na conta Linux do aluno; os blocos here-document permitem colagem.

Ferramentas de manutenção do professor, na raiz do repositório:

```bash
python3 sd/praticas/gerar.py
python3 sd/praticas/verificar.py
node --check sd/praticas/script.js
python3 -m http.server 8000
```

Abra `/sd/praticas/`. O verificador executa os blocos principais e as mudanças
copiadas do HTML, compara resultados, testa limites de entradas e cenários
alternativos, compila com avisos como erros e usa UBSan, confere fontes/ZIP,
IDs, rótulos e links locais. A leitura deliberadamente fragmentada é testada
com limites de 1 a 16 bytes, registro cortado e valores de entrada distintos.

Em ambiente que permita explicitamente TCP local:

```bash
python3 sd/praticas/verificar.py --tcp
```

Essa opção também executa os blocos da extensão e o binário com UBSan;
sem a opção, a extensão é compilada mas não abre sockets. A homologação com
conta estudantil, quotas reais, aparelho físico e aula piloto continua necessária.

O workflow de Pages copia `sd/praticas` para `_site/sd/praticas`. O CSS da
página da disciplina é copiado de `pages/disciplinas.css` para a raiz pública.
Entradas do percurso ficam no portal, na página de SD e nos materiais.

## Validação desta elaboração

Os blocos dos roteiros, cenários alternativos, entradas inválidas e UBSan
passaram localmente. A execução com `--tcp` também passou em ambiente local
autorizado, com cerca de 456 KB de arquivos temporários no teste completo.

A interface foi conferida em navegador emulado nas larguras 320, 390, 768 e
1440 px, nas 13 páginas do percurso/guia e nas entradas de SD/materiais:
sem overflow da página, com fontes abertas, persistência, isolamento por
unidade, progresso, cópia, exportação TXT, tema, tratamento de armazenamento
indisponível e leitura/navegação sem JavaScript. Não houve erro de JavaScript.
Isso não substitui aparelho físico ou aula piloto no LIAC.
