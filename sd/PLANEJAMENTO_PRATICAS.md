# SD — retomada das práticas

> Atualização de 03/11/2026: este documento preserva o planejamento inicial.
> O percurso produzido está em [praticas/](praticas/), com 12 investigações,
> síntese, fontes em C e guia docente. As pendências descritas abaixo
> registram o estado da proposta na retomada de 02/11.

## Base consultada e decisão de ambiente

Retomada em 02/11/2026. Referências: os 12 materiais em
`materiais/manifesto.json`, os percursos `../aoc/praticas/` e
`../so/praticas/` e o roteiro WSL em `un01-02-03/`.
O professor ainda deve identificar se há outro planejamento de ensino.
Esta proposta não fixa número de encontros nem integralização da carga horária.

O guia de implantação do LIAC, na pasta local docente `labhw_dellxps`,
seção D.4, descreve recusa de toda conexão de saída das contas estudantis,
**inclusive para serviços locais**. Portanto, não se deve pressupor que
TCP/UDP em localhost funcionem. Isso é evidência documental, não auditoria
da configuração atual. Nenhuma conexão ao servidor foi realizada.

Os limites documentados são uma CPU, 1 GiB de RAM, 200 processos e 50 MB
por aluno. O roteiro WSL exige adaptação: retirar instalação com sudo,
portas fixas e escuta em todas as interfaces. Não alterar firewall para
viabilizar a atividade. Uso de sockets depende de homologação docente.

## Narrativa proposta

**Uma estação, vários nós:** continuar as leituras 12, 18, 24 e 30, total
84 e média 21, agora investigando como produtores e um agregador trocam
mensagens, ordenam eventos, coordenam mudanças e enfrentam falhas.

Cada prática terá previsão, execução finita, interpretação, mudança de
uma condição, evidência e decisão justificada. Fontes em C11, Bash e APIs
POSIX fornecidas com explicação; sem exigir Python dos estudantes.

Processos locais não serão apresentados como máquinas independentes.
Pipes permitem estudar IPC real, mas não demonstram transporte por rede,
partições físicas ou independência entre máquinas. Os modelos de protocolos
declararão hipóteses, falhas injetadas e propriedades não demonstradas.

## Sequência conceitual inicial

| Unidade | Investigação proposta | Natureza e evidência |
| --- | --- | --- |
| 1 — Fundamentos | Quem produz, agrega e responde? | Dois processos locais finitos; identificar processo, máquina e serviço e limites da representação |
| 2 — IPC | Como uma leitura vira mensagem? | Pipe real com enquadramento explícito e tratamento de leitura parcial; TCP apenas em ambiente homologado |
| 3 — Tempo | Qual evento pode ter causado outro? | Modelo de eventos e relógios de Lamport; mostrar que ordem de timestamps não prova causalidade |
| 4 — Coordenação | Quem pode atualizar o relatório? | Modelo de exclusão mútua e eleição; distinguir segurança de progresso |
| 5 — Comunicação em grupo | Todos receberam na mesma ordem? | Entregas modeladas com atraso/reordenação controlados; comparar ordem de chegada e causal |
| 6 — Concorrência e compartilhamento | Quando as réplicas divergem? | Modelo de atualizações concorrentes e política de reconciliação explícita |
| 7 — Transações | Preparar equivale a confirmar? | Modelo 2PC, votos, registro e bloqueio após falha do coordenador |
| 8 — Tolerância a falhas | Repetir uma requisição duplica seu efeito? | Falha/timeout injetados e deduplicação por identificador; timeout não prova queda |
| 9 — Arquivos, nomes e memória | Que cópia e que nome o cliente observa? | Três investigações curtas: cache de arquivo, resolução de nomes e memória compartilhada modeladas |
| 10 — Segurança | Quem pode enviar e modificar uma leitura? | Modelo de identidade, autorização e repetição de mensagem; não inventar criptografia nem afirmar segurança de produção |
| Síntese | Qual arquitetura atende ao cenário? | Dossiê com evidências, hipóteses, decisões e limites de cada unidade |

Esta tabela é uma proposta de elaboração. A distribuição por encontros e
os experimentos finais dependem da leitura detalhada dos PDFs e do plano
docente; os roteiros completos ainda não foram produzidos.

## Homologação necessária antes de definir o transporte

1. Conferir GCC/C11, Bash, pipes e criação de um único filho na conta de aluno.
2. Conferir a regra vigente para TCP/UDP local com o responsável pelo LIAC.
   Somente se permitido, testar cliente e servidor do próprio aluno em
   loopback, porta atribuída pelo sistema e tempo limite; sem varrer portas.
3. Conferir viabilidade de colar um bloco de código pelo celular e exportar
   as evidências. Download no navegador não transfere arquivos ao terminal.
4. Usar processos finitos, recolher filhos e fechar descritores. Evitar
   servidores persistentes, espera ilimitada e testes de carga.
5. Se sockets forem bloqueados, manter IPC local e modelos identificados;
   reservar comunicação entre máquinas para ambiente WSL/laboratório
   autorizado, com roteiro próprio. Não declarar equivalência entre ambos.

## Próximas entregas

Ler detalhadamente os materiais e confrontar o planejamento indicado pelo
professor; produzir primeiro o núcleo das unidades 1–3 e validá-lo antes de
estender o percurso. Cada roteiro deve trazer código copiável, compilação
com avisos, resultado interpretado e alteração orientada. O guia docente
deve conter respostas, mediação, critérios e alternativas de ambiente.
Publicação e integração ao portal ficam para depois da revisão do conteúdo.

## Definições retomadas de AOC e SO

A proposta de SD adota o percurso investigativo dos dois trabalhos finais,
incluindo os guias docentes, e não apenas seu formato de página. As decisões
abaixo orientam a elaboração; não representam roteiros já implementados.

- **Continuidade do problema:** AOC investigou a estação e SO investigou o
  serviço que processa suas leituras. SD investigará a cooperação entre
  produtores, agregador e réplicas desse serviço. A distribuição precisa
  responder a uma necessidade do cenário, explicitada pelo estudante.
- **Código fornecido, raciocínio exigido:** o aluno recebe fontes curtos em
  C11, comandos copiáveis e explicação das operações relevantes. APIs POSIX
  são infraestrutura acompanhada pelo professor. A avaliação incide na
  interpretação do protocolo, sem exigir memorização de chamadas de sistema.
- **Ciclo comum:** prever por escrito, executar, confrontar previsão e saída,
  alterar uma condição, explicar o efeito e registrar uma decisão. Copiar e
  compilar não basta como evidência de aprendizagem.
- **Mudança com propósito:** cada alteração deve testar uma hipótese, por
  exemplo, reenviar uma leitura, mudar uma ordem de entrega ou interromper
  um protocolo em um estado determinado. Evitar alterações arbitrárias de
  valores sem pergunta conceitual.
- **Experimentos delimitados:** distinguir execução real de processos e IPC,
  modelos de protocolos e observações de rede. Cada roteiro declara o que
  permite concluir e o que permanece sem teste.
- **Registros progressivos:** reunir previsões, trechos de saída e decisões
  em um único dossiê. Não exigir um relatório extenso novo por investigação.
  A síntese deve permitir defender uma arquitetura com evidências do percurso.
- **Acesso móvel:** blocos pequenos, pastas independentes, resultados
  comentados e leitura sem JavaScript. Cópia, respostas locais e exportação
  seguem o padrão das páginas anteriores quando os roteiros forem produzidos.

Não transportar automaticamente a quantidade de encontros de AOC ou SO para
SD. As dez unidades conceituais organizam o conteúdo; a quantidade de práticas
e sua duração serão ajustadas ao planejamento docente e à aula piloto.

## Proposta detalhada do primeiro núcleo — unidades 1 a 3

Título de trabalho: **Uma estação, vários nós — como confiar no relatório?**

Pergunta integradora: como obter um relatório explicável quando as leituras
são produzidas por participantes diferentes e as mensagens podem chegar em
ordens distintas, repetir ou deixar de chegar? O lote de referência continua
sendo 12, 18, 24 e 30, com total 84 e média 21. Identificadores de produtor e
de mensagem passam a fazer parte dos registros.

### Investigação 1 — Quem produziu este relatório?

**Vínculo:** U1, fundamentos; retomada do serviço de SO.

**Previsão:** representar produtor e agregador, indicando onde existem
processos, memória, máquina e canal. Prever se a alteração de uma variável
privada no filho muda a cópia mantida pelo pai.

**Execução proposta:** programa finito em C cria um filho. O filho representa
um produtor e envia as quatro leituras por um pipe; o pai agrega e apresenta
origem, quantidade, total e média. O suporte de comunicação será fornecido
e explicado, com tratamento de erros, fechamento de descritores e waitpid.

**Interpretação:** localizar quem calcula e quem comunica; separar memória
privada de dados enviados. Explicar por que processos na mesma máquina não
comprovam distribuição física, escalabilidade ou tolerância à queda da máquina.

**Mudança orientada:** alterar apenas a última leitura, de 30 para 36, e
prever total 90 e média 22,5. Depois localizar o envio que tornou o novo valor
observável no agregador. A mudança retoma a entrada de SO e introduz a
fronteira de comunicação como objeto de estudo de SD.

**Evidência e decisão:** desenho do percurso, saída de referência e variante,
explicação de uma fronteira de memória e requisito que justificaria mover o
produtor para outra máquina. Essa migração é uma proposta, não um teste realizado.

### Investigação 2 — Onde começa e termina uma mensagem?

**Vínculo:** U2, comunicação entre processos.

**Previsão:** responder se uma escrita corresponde necessariamente a uma
leitura e como o receptor saberá que recebeu uma leitura completa.

**Execução proposta:** produtor e agregador trocam registros textuais com
identificador e delimitador de linha. O receptor lê deliberadamente poucos
bytes por chamada, recompõe as linhas em buffer limitado e só então interpreta
os registros. O programa limita tamanho, quantidade e duração da execução e
identifica fim de fluxo com registro incompleto.

**Interpretação:** distinguir byte, fragmento e mensagem da aplicação.
Fragmentar as leituras deliberadamente demonstra o funcionamento do parser;
não mede fragmentação espontânea, pacotes ou perdas da rede. Explicar o papel
do enquadramento e o motivo de não enviar uma struct C bruta como formato
portável entre máquinas.

**Mudança orientada:** reduzir apenas a quantidade máxima de bytes lida por
chamada. Prever que os fragmentos mudam, mas os quatro registros e o total
84 permanecem. Um cenário adicional fornecido pelo professor encerra o fluxo
antes do delimitador final: o receptor deve informar registro incompleto,
sem convertê-lo silenciosamente em leitura válida.

**Evidência e decisão:** comparar fragmentos e mensagens reconstruídas e
justificar o formato adotado. TCP em loopback poderá ser uma extensão própria,
após homologação, preservando o parser; não será requisito do núcleo em pipes.

### Investigação 3 — O que os relógios permitem afirmar?

**Vínculo:** U3, tempo, sincronização e coordenação.

**Previsão:** ordenar um pequeno conjunto de eventos de dois participantes,
identificando eventos locais, envio e recebimento. Indicar quais relações
decorrem de mensagens e quais não possuem relação causal demonstrada.

**Execução proposta:** modelo determinístico em C imprime eventos, relógios
locais e timestamps de Lamport. O roteiro fornece as regras de incremento
local e de atualização no recebimento. Horários físicos fictícios, com desvios
declarados, permitem confrontar aparência cronológica e relação causal.

**Interpretação:** reconstruir as relações de precedência local e de
envio/recebimento. Mostrar com dois eventos concorrentes que timestamps de
Lamport diferentes não provam causalidade. Um desempate por identificador
estabelece uma ordem total convencional, sem criar uma causa entre eventos.

**Mudança orientada:** alterar apenas o desvio de um relógio físico fictício,
mantendo eventos e mensagens. Prever que os horários exibidos mudam, enquanto
as relações causais e os timestamps de Lamport permanecem. Atrasos reais,
sincronização NTP e precisão dos relógios não são medidos nesse modelo.

**Evidência e decisão:** diagrama dos eventos, tabela de timestamps e um par
concorrente explicado. Justificar quando a aplicação precisa de ordenação
lógica e quando também precisaria de uma referência de tempo físico.

## Mediação, avaliação e síntese propostas

Como referência inicial para um bloco de 60 minutos: 5 para pergunta e
previsão, 30 para execução acompanhada, 15 para interpretação e mudança e 10
para registro e discussão. É uma estimativa de organização, não garantia de
que cada investigação caiba em um encontro. Reservar retomada se o acesso
ou a leitura do código demandarem mais tempo.

Em duplas ou grupos, alternar operador, observador e relator, conforme o
tamanho do grupo. Cada estudante deve explicar uma previsão ou decisão.
O professor oferece apoio no C e solicita a relação entre a saída e o
conceito de SD, evitando reduzir a aula à operação do terminal.

Rubrica inicial, seguindo SO: previsão justificada (2), evidências e
comparação (3), interpretação conceitual e limites (3), mudança orientada e
relação com o serviço (2). Não pontuar velocidade de execução ou quantidade
de comandos. Uma restrição do ambiente deve ser registrada e discutida.

O dossiê final deverá propor uma arquitetura para a estação, identificar
participantes e canais, explicitar hipóteses de falha e requisitos, reunir
evidências das unidades e defender decisões de comunicação, ordenação,
consistência e recuperação. Cada afirmação deve indicar se foi observada,
modelada ou apenas proposta. Pesos e prazo dependem do plano de ensino.

## Critérios para passar da proposta aos roteiros

1. Confrontar os experimentos com a leitura detalhada dos 12 PDFs e com o
   planejamento anterior quando indicado pelo professor.
2. Confirmar o ambiente efetivo: terminal LIAC, WSL ou combinação dos dois;
   registrar separadamente o que cada ambiente permite observar.
3. Implementar e validar primeiro as três investigações acima, incluindo
   cenários de erro e alterações orientadas, antes de estender as demais.
4. Produzir para cada investigação roteiro do aluno, fonte correspondente,
   resultados de referência, respostas comentadas e orientações docentes.
5. Conferir coerência entre código, texto, resultados e pacote de fontes;
   validar acesso móvel e execução com os limites da conta estudantil.

A presente retomada detalha a proposta pedagógica. Não acrescenta programas,
não executa experimentos no LIAC e não publica páginas.
