"""Gera paginas estaticas a partir dos roteiros abaixo e dos fontes em arquivos/.
Ferramenta docente: alunos usam C11/Bash. Execute na raiz: python3 sd/praticas/gerar.py.
"""
from pathlib import Path
from html import escape as h
import zipfile

ROOT = Path(__file__).resolve().parent
D = []
def pratica(un, num, titulo, fonte, natureza, objetivo, prever, executar, referencia,
            explicar, mudar, variante, ref_variante, registrar, limite, docente, pdf=None, status=0):
    D.append(dict(un=un, num=num, titulo=titulo, fonte=fonte, natureza=natureza,
        objetivo=objetivo, prever=prever, executar=executar, referencia=referencia,
        explicar=explicar, mudar=mudar, variante=variante, ref_variante=ref_variante,
        registrar=registrar, limite=limite, docente=docente,
        pdf=pdf or f'un{un:02}t01', status=status))

pratica(1, 1, 'Quem produz e quem agrega?', 'estacao', 'Processos e pipe reais, na mesma máquina',
 'A estação de AOC tornou-se um serviço em SO. Agora um produtor envia quatro leituras e um agregador calcula o relatório. Identifique os participantes e a fronteira de comunicação antes de propor sua distribuição entre máquinas.',
 'Desenhe produtor → canal → agregador. Para as leituras 12, 18, 24 e 30, preveja quantidade, total e média. Dois processos nesta experiência significam duas máquinas? O que ocorre se a única máquina parar?',
 './estacao 8 30',
 'Mensagem: produtor=P id=1 valor=12\nMensagem: produtor=P id=2 valor=18\nMensagem: produtor=P id=3 valor=24\nMensagem: produtor=P id=4 valor=30\nLeituras=4 Total=84 Media=21.00 Relatorio=COMPLETO',
 'fork cria o produtor filho; o pai é o agregador. Cada processo possui seu espaço de memória. pipe cria um canal unidirecional: o filho fecha a ponta de leitura e envia texto; o pai fecha a ponta de escrita, reconstrói registros e soma. waitpid recolhe o filho. As linhas Fragmento e o número de chamadas podem variar; observe as mensagens completas. A soma só recebe um valor porque ele atravessou o canal, e não porque o filho alterou uma variável privada do pai.',
 'Mude apenas a última leitura: use 36 em vez de 30. Preveja o novo total e a média antes de executar. Localize em dados[] a origem do valor e em enviar a passagem para o outro processo.',
 './estacao 8 36', 'Leituras=4 Total=90 Media=22.50 Relatorio=COMPLETO',
 'Registre as duas saídas e explique o papel de fork, pipe e waitpid. Compare esta arquitetura com uma função que calcula tudo no mesmo processo. Que requisito justificaria colocar o produtor em outra máquina? Qual fronteira de falha ainda é compartilhada?',
 'O pipe é IPC local. Este teste não mede escalabilidade, heterogeneidade entre computadores ou sobrevivência à queda da máquina. Não há sensor físico. Uma aplicação distribuída pode ter componentes centralizados e continuar com pontos únicos de falha.',
 'Quantidade 4, total 84 e média 21; variante 90 e 22,5. Exigir distinção entre processo, máquina e serviço. A necessidade de sensores geograficamente separados é uma justificativa possível; criar processos, sozinho, não demonstra esse requisito.')

pratica(2, 2, 'Como bytes viram mensagens?', 'estacao', 'Enquadramento em pipe real; extensão TCP opcional',
 'O agregador deve reconhecer um registro mesmo quando o fluxo chega em pequenos fragmentos. O formato da aplicação é id espaço valor seguido por quebra de linha. Investigue serialização, limites e completude.',
 'Uma chamada write obriga o receptor a receber tudo em uma única read? O que delimita a mensagem no nosso formato? Preveja se ler um byte por chamada muda o total das quatro leituras.',
 './estacao 8 30', 'Leituras=4 Total=84 Media=21.00 Relatorio=COMPLETO\nAs linhas Fragmento variam; cada Mensagem só aparece após o delimitador.',
 'enviar repete write se necessário. O laço do pai aceita read parcial, acumula bytes em linha e só interpreta ao encontrar \\n. O limite do buffer evita aceitar registros sem tamanho máximo. EOF é fim de fluxo, não um delimitador implícito de mensagem. Fechar todas as pontas de escrita permite observar EOF. O texto evita depender do layout, padding e ordem dos bytes de uma struct C. read bloqueante não transforma a aplicação inteira em um protocolo de requisição e resposta; um pipe também não implementa uma fila persistente.',
 'Reduza apenas o limite de leitura para 1 byte. Depois use o caso corte, que retira a quebra de linha do último registro. Preveja o que será aceito e se o relatório poderá ser declarado completo.',
 './estacao 1 30\n./estacao 1 30 corte',
 'Sem corte: Leituras=4 Total=84 Media=21.00 Relatorio=COMPLETO\nCom corte: Registro incompleto: nao incorporado\nLeituras=3 Total=54 Media=18.00 Relatorio=INCOMPLETO\nO último comando termina com código 1, intencionalmente.',
 'Compare fragmentos com registros. Explique por que o total válido não depende do tamanho de read e por que o último registro cortado fica fora do relatório. Proponha campos de uma chamada remota enviar_leitura(id, valor) e diga o que um stub de RPC esconderia e que falhas continuariam possíveis.',
 'A fragmentação é provocada pelo limite de read; não mede pacotes, perdas ou latência de rede. TCP é fluxo de bytes e também exige enquadramento na aplicação. UDP preserva fronteiras de datagramas, mas a aplicação precisa tratar truncamento, perdas, duplicatas e ordenação conforme seus requisitos. Não equipare TCP a confirmação de processamento da leitura.',
 'Com passo 1 são 20 leituras com dados no lote completo e 19 no cortado. No passo 8, não exigir contagem fixa. Resultado incompleto é um erro tratado, não falha da atividade. Relacionar serialização com RPC/API, sem afirmar implementação de RPC, REST ou broker.', status=1)

pratica(3, 3, 'Qual evento pode ter causado outro?', 'lamport', 'Modelo determinístico de eventos e relógios',
 'O produtor A envia m para B; B responde r para A. Compare horários físicos fictícios e relógios de Lamport sem ajustar o relógio do servidor.',
 'Desenhe A1 → A2(envia m) → A3 → A4(recebe r) e B1 → B2 → B3(recebe m) → B4(envia r). Acrescente as duas setas de mensagem. Preveja os timestamps de A4 e B3. L(A1) menor que L(B2) prova causalidade?',
 './lamport 20', 'A1 local fisico=10 L=1\nB2 local fisico=31 L=2\nA2 envia m fisico=12 L=2\nB3 recebe m fisico=33 L=3\nB4 envia r fisico=35 L=4\nA4 recebe r fisico=16 L=5',
 'local incrementa o contador antes de registrar. receber aplica max(relógio local, timestamp recebido) + 1. O parâmetro desloca apenas os horários físicos de B, não sua velocidade: representa desvio, não deriva. A ordem de impressão foi escolhida pelo roteiro; ela não estabelece por si só causalidade entre processos. Acontece-antes decorre da ordem local, envio/recebimento e transitividade. A1 e B2 não estão ligados por um caminho dirigido. Ordenar pares (L,id) resolve empates por convenção, sem demonstrar causa.',
 'Altere apenas o desvio de B de +20 para -20. Antes de executar, indique quais colunas e relações devem permanecer iguais.',
 './lamport -20', 'B2 local fisico=-9 L=2\nB3 recebe m fisico=-7 L=3\nB4 envia r fisico=-5 L=4\nA4 recebe r fisico=16 L=5',
 'Registre a tabela de todos os eventos e o diagrama com as setas. Explique um par causal e um par concorrente. A estação precisa de horário civil para auditoria, ordem causal para aplicação de atualizações, ou dos dois? Justifique sem atribuir precisão física ao contador lógico.',
 'Não há relógios remotos reais, espera, NTP ou medição de RTT. Lamport respeita acontece-antes, mas timestamps crescentes não bastam para detectar causalidade. Sincronização física exige hipóteses de erro e atraso; não é substituída pelo modelo.',
 'B3=3 e A4=5 nas duas execuções. A1 e B2 são concorrentes mesmo com 1<2. Os horários negativos são números fictícios do modelo, não timestamps do Linux. Pedir comparação com Cristian/NTP no PDF, sem executar mudança de relógio.')

pratica(4, 4, 'Quem tem permissão para atualizar?', 'coordenacao', 'Modelo de token e seleção de líder',
 'Três participantes querem atualizar o relatório. Um único token circula no anel P1 → P2 → P3 → P1. Investigue o que preserva o acesso exclusivo e o que permite continuar após uma falha.',
 'Quem entra em cada uma das seis rodadas? Se P2 parar antes de passar o token, outro participante pode criar um novo token imediatamente sem risco? Diferencie segurança e progresso.',
 './coordenacao', 'Atualizacoes=6; um unico titular por rodada neste modelo\nSelecao com visao unica: maior id vivo=P3',
 'titular guarda o único token do modelo e o laço concede uma entrada por rodada. vivo descreve uma falha conhecida pelo simulador. A escolha do maior id percorre uma visão única dos membros; não implementa mensagens de eleição em anel nem Bully. As duas visões impressas ao final mostram que aplicar a mesma regra sobre membros diferentes pode produzir dois líderes. Um algoritmo distribuído precisa tratar descoberta, mensagens atrasadas e autoridade antiga.',
 'Execute o cenário falha: apenas P2 deixa de estar disponível antes da segunda rodada. Mantenha seis rodadas e não acrescente token de recuperação. Preveja quantas atualizações ocorrerão.',
 './coordenacao falha', 'Rodada=2 token com P2 indisponivel: sem progresso\nAtualizacoes=1; um unico titular por rodada neste modelo\nSelecao com visao unica: maior id vivo=P3',
 'Anote quem recebeu a última permissão e por que a ausência de duas entradas simultâneas não garante atendimento futuro. Compare o anel com coordenador central e Ricart–Agrawala: de quem cada um espera autorização? Descreva por que eleger P3 não prova que P2 perdeu uma permissão antiga.',
 'O programa é sequencial e ilustra um invariante, sem provar correção para todos os escalonamentos. A falha é injetada e conhecida; timeout em rede só levantaria suspeita. Não implementa consenso, eleição completa ou recuperação segura do token.',
 'Normal 6, falha 1. Segurança preservada por construção, progresso perdido. Centralizado depende do coordenador; Ricart–Agrawala clássico espera respostas dos demais. Desenhar manualmente a circulação de uma mensagem de eleição no anel e confrontar com seleção central do modelo. Regenerar token exige impedir uso do antigo, não apenas escolher id maior.')

pratica(5, 5, 'Todos receberam na mesma ordem?', 'grupo', 'Modelo de chegada e entrega causal em dois receptores',
 'X define calibração +2; Y avalia uma leitura 22 usando essa calibração; Z é um registro independente. Quem gerou Y já conhecia X: X → Y. Os receptores recebem R1: Y,X,Z e R2: Z,X,Y.',
 'Preveja o alerta de Y em cada receptor se a aplicação processar imediatamente na chegada. Ordenação FIFO por remetente resolveria uma dependência entre X e Y enviados por remetentes diferentes?',
 './grupo chegada', 'R1: Entrega Y leitura=22 correcao=0 alerta=NAO\nR2: Entrega Y leitura=22 correcao=2 alerta=SIM\nPendentes=0 em ambos.',
 'chegou e entregue são estados distintos. No modo causal, Y fica retida até que sua dependência X esteja entregue; o laço reexamina mensagens após cada avanço. Z não depende de X nem de Y. Entregar causalmente não exige uma ordem total entre eventos independentes. Os dois receptores representam um grupo selecionado, não todos os computadores de uma rede.',
 'Mude apenas a política de chegada para causal. Depois mantenha a política causal e retire X do roteiro de chegada com sem-x. Preveja os alertas e a fila pendente.',
 './grupo causal\n./grupo causal sem-x', 'Causal: ambos entregam Y com correcao=2 alerta=SIM.\nR1 entrega X,Y,Z; R2 entrega Z,X,Y: ordens totais diferentes.\nCausal sem-x: Pendentes=1 em cada receptor; Y não é entregue.',
 'Compare as ordens de chegada e entrega. Explique por que bloquear Y preserva a dependência, mas não recupera X. Para distribuir uma calibração aos sensores interessados, escolha unicast, broadcast ou grupo e justifique. O que flooding precisaria para evitar retransmitir duplicatas indefinidamente? Qual custo ou atraso gossip acrescentaria à convergência?',
 'O programa conhece uma dependência explícita e três mensagens; não implementa multicast de rede nem um algoritmo geral de relógios vetoriais. Ausência e reordenação são injetadas. Garantia de ordem e garantia de entrega são propriedades diferentes.',
 'Na chegada R1 não alerta e R2 alerta. Causal: os dois alertam, sem impor a mesma posição de Z. Sem X, uma pendência por receptor. FIFO só trata cada emissor; pedir ID/histórico e limites de propagação para flooding e distinguir TTL de saltos de TTL de cache em P10.')

pratica(6, 6, 'Convergir é suficiente?', 'replicas', 'Modelo de escritas concorrentes e reconciliação',
 'Duas réplicas partem de total 84. Sem comunicação entre elas nesse intervalo, A incorpora +12 e B incorpora +18. A intenção é preservar ambos os incrementos, chegando a 114.',
 'Qual valor cada cliente observa antes da reconciliação? Se o desempate escolher a escrita de B, as cópias convergirão? Isso garante que todas as leituras recebidas foram incorporadas?',
 './replicas', 'Apos escritas isoladas: A=96 B=102\nReconciliadas: A=102 B=102 Esperado_sem_perdas=114',
 'O modo padrão aplica uma regra explícita: B vence o empate de versão por identificador. A convergência pode ocorrer mesmo perdendo a intenção de A. No modo soma, cada produtor possui seu componente de incremento; o merge usa máximo por componente, e só depois calcula 84 + componentes. Não some totais de réplicas, pois isso contaria o estado inicial mais de uma vez. As leituras locais durante o intervalo continuam divergentes.',
 'Troque apenas a regra de reconciliação por soma. Observe no código a reaplicação do mesmo merge e preveja se ela duplicará os incrementos.',
 './replicas soma', 'Apos escritas isoladas: A=96 B=102\nReconciliadas: A=114 B=114 Esperado_sem_perdas=114',
 'Registre valores antes/depois e explique a diferença entre convergência e preservação das operações. Indique por que componentes com merge por máximo suportam repetição neste caso. Essa política serviria para reservar o último assento ou para decrementos arbitrários? Declare o contrato que a estação precisa oferecer aos leitores.',
 'Incrementos são não negativos, com um produtor por componente e conjunto fixo de produtores. O exemplo é um modelo pequeno de contador convergente, sem persistência, rede ou prova de linearizabilidade. Não generalize essa reconciliação para qualquer tipo de dado nem confunda consistência de réplicas com invariantes de uma aplicação.',
 'A=96 e B=102 durante isolamento. Regra B converge em 102, perdendo +12; componentes chegam a 114 sem duplicar merge. Uma reserva com limite exige outro mecanismo. Eventual convergência depende de voltar a trocar estados e de cessarem ou serem consideradas as atualizações relevantes.')

pratica(7, 7, 'Preparar equivale a confirmar?', 'transacao', 'Máquina de estados didática do 2PC',
 'Duas partes do serviço devem incorporar o mesmo lote adicional +12. A estação exige tudo ou nada na confirmação: compare votos, decisão e valor visível. Cada participante começa em 84.',
 'Se ambos votarem SIM, em que fase o valor pode mudar para 96? Se um votar NÃO, o outro pode manter sua atualização? E se o coordenador ficar indisponível após os votos SIM?',
 './transacao sim', 'P1 voto=SIM estado=PREPARADO saldo_visivel=84\nP2 voto=SIM estado=PREPARADO saldo_visivel=84\nRegistro modelado do coordenador=COMMIT\nResultado=CONFIRMADO\nSaldos: P1=96 P2=96',
 'O enum separa INICIAL, PREPARADO, CONFIRMADO e ABORTADO. A primeira fase coleta votos; a segunda aplica uma decisão única. A alteração só é incorporada quando o estado passa a CONFIRMADO. O cenário falha interrompe o protocolo antes do registro da decisão. O observador do modelo sabe onde ocorreu a falha; os participantes preparados não podem inferir uma decisão apenas porque não recebem resposta.',
 'Primeiro mude o voto de P2 para NÃO. Depois retorne aos votos SIM e interrompa o coordenador com falha. Compare os dois cenários separadamente com o caso original.',
 './transacao nao\n./transacao falha', 'nao: Resultado=ABORTADO; Saldos: P1=84 P2=84\nfalha: Resultado=PENDENTE; Saldos: P1=84 P2=84',
 'Monte uma tabela dos três cenários com votos, estados, decisão conhecida e valores. Por que PREPARADO não significa efeito confirmado? Que registros um participante e o coordenador precisariam gravar antes de anunciar decisões recuperáveis? Diferencie atomicidade, isolamento e durabilidade.',
 'Os registros são impressos, não gravados de forma durável. Não há banco, WAL, bloqueio real, recuperação após crash ou isolamento de transações concorrentes. O programa termina exibindo PENDENTE; o bloqueio pertence ao protocolo modelado, sem deixar processos presos no laboratório.',
 'SIM/SIM confirma 96/96; NÃO aborta 84/84; falha após votos mantém preparados em 84/84. Exigir persistência de preparo e decisão para recuperação. 2PC coordena decisão de commit; não implementa sozinho todas as propriedades ACID.')

pratica(8, 8, 'Repetir duplica o efeito?', 'repeticao', 'Modelo de omissão de resposta, retry e deduplicação',
 'O serviço incorpora a requisição P1:5, de valor 12, mas sua resposta não chega ao cliente. O cliente tenta novamente com o mesmo identificador. Investigue o que ele sabe e o que o servidor precisa lembrar.',
 'Partindo de 84, preveja o total após duas tentativas sem deduplicação. Um timeout comprova que a primeira requisição não foi aplicada? Que informação deve permanecer igual no reenvio?',
 './repeticao sem', 'Resposta suprimida: cliente observa timeout, causa desconhecida.\nCliente recebe resposta=108\nTotal=108 Efeitos=2',
 'O primeiro efeito acontece antes da omissão da resposta. O modo dedup registra o identificador e a resposta e, na repetição, devolve a resposta anterior sem reaplicar o incremento. reinicio mantém o efeito, mas apaga a tabela volátil entre as tentativas. O cliente não distingue lentidão, resposta perdida e queda apenas pelo timeout; aqui o observador conhece a falha injetada.',
 'Ative dedup mantendo a mesma sequência de duas tentativas. Depois use reinicio para perder apenas a tabela de identificadores, preservando o efeito já aplicado.',
 './repeticao dedup\n./repeticao reinicio', 'dedup: Cliente recebe resposta=96; Total=96 Efeitos=1\nreinicio: Cliente recebe resposta=108; Total=108 Efeitos=2',
 'Explique as três saídas. Por que persistir só o efeito ou só o identificador pode ser insuficiente? Relacione ID, resposta e efeito em uma decisão de recuperação. Compare um failover que transfere estado para o backup com outro que conserva apenas o programa executável.',
 'O ID é fixo e há somente duas tentativas. Não existe timeout medido, reinício real ou armazenamento atômico e durável. O caso dedup não demonstra uma garantia geral de exactly-once. Heartbeats também produzem suspeitas sob atraso, não certeza universal de queda.',
 'Sem tabela 108/2, com tabela 96/1, tabela perdida 108/2. Necessários identificadores estáveis e escopo claro de retenção; preservar atomicamente efeito e metadados conforme o protocolo. Não prometer tolerância bizantina apenas por replicar processos.')

pratica(9, 9, 'Qual versão do arquivo o cliente lê?', 'cache', 'Modelo de cache de arquivo e revalidação',
 'A abre o relatório de valor 84 e mantém uma cópia. B atualiza o servidor para 96. A faz nova leitura. Investigue o que a transparência de acesso esconde e o que ela não garante.',
 'Se A usar sua cópia sem consultar o servidor, lerá 84 ou 96? Usar o mesmo nome de arquivo significa observar automaticamente a última escrita remota?',
 './cache', 'B escreve no servidor: valor=96 versao=2\nA le: valor=84 versao=1 Atual=NAO',
 'copia e versao_copia representam cache de um cliente. A escrita de B avança a versão do servidor. Com revalidar, A compara versões antes da segunda leitura e recarrega se necessário. A numeração de versões é fornecida pelo modelo. Um sistema de arquivos distribuído real possui regras próprias de cache, abertura, fechamento, falhas e concorrência.',
 'Mude apenas a política de A para consultar a versão antes de ler novamente.',
 './cache revalidar', 'A consulta versao e recarrega cache.\nA le: valor=96 versao=2 Atual=SIM',
 'Compare valor e versão em A. Qual consulta adicional é necessária para evitar a leitura antiga neste cenário? Desenhe aplicação → VFS/cliente → rede → servidor e situe onde caberia o cache. Explique por que repetir as chamadas de arquivo de SO não prova acesso remoto.',
 'Nenhum filesystem remoto é montado; não há NFS, SMB, RPC real nem escrita em arquivo. Não extrapole o resultado para todas as opções de montagem ou versões de NFS. Transparência de acesso não elimina erros ou esperas percebidas pela aplicação.',
 'Sem revalidação A=84/v1, com revalidação A=96/v2. A comparação de versões custa comunicação num sistema real; o programa não a mede. Não executar mount/exportfs e não assumir que /home do LIAC é NFS.', pdf='un09t01')

pratica(9, 10, 'O nome mudou de destino?', 'nomes', 'Modelo de resolução com TTL e tempo virtual',
 'O nome estável estacao/relatorio resolve inicialmente para no1. Em t=2 o serviço muda para no2, mas o resolvedor já guardou a resposta antiga. Consulte nos instantes virtuais 0, 3 e 11.',
 'Com TTL=10, qual destino será retornado em t=3? Mudar o mapeamento na autoridade invalida instantaneamente todas as cópias? Distinga nome, identificador e endereço.',
 './nomes 10', 't=0 consulta autoridade; estacao/relatorio -> no1 expira=10\nt=3 usa cache; estacao/relatorio -> no1 expira=10\nt=11 consulta autoridade; estacao/relatorio -> no2 expira=21\nConsultas=2',
 'cache guarda a resposta e expira guarda seu prazo no tempo virtual. Uma consulta à autoridade renova o TTL. Quando t alcança expira, há nova resolução. O nome pode permanecer igual apesar da mudança de destino. Mesmo resolver no2 não comprova que ele responde. TTL aqui é validade temporal de cache, diferente do limite de saltos em propagação de mensagens.',
 'Reduza apenas o TTL para 1. Mantenha migração e consultas nos mesmos instantes.',
 './nomes 1', 't=0 consulta autoridade; estacao/relatorio -> no1 expira=1\nt=3 consulta autoridade; estacao/relatorio -> no2 expira=4\nt=11 consulta autoridade; estacao/relatorio -> no2 expira=12\nConsultas=3',
 'Compare destinos e número de consultas. Que compromisso aparece entre atualização do destino e frequência de consultas? Dê um exemplo de resolução de nome conhecido e outro de descoberta por capacidade. Situe raiz, TLD, autoridade e resolvedor num DNS real, indicando quais partes o modelo omite.',
 'Não consulta DNS nem descobre serviços de rede. Os instantes são inteiros fictícios, sem sleep. DNS real permite diferentes registros, cadeias de cache e políticas; reduzir um TTL novo não apaga retroativamente uma resposta antiga já cacheada.',
 'TTL10 fornece no1 em t3 e usa duas consultas. TTL1 fornece no2 em t3 e usa três. O cache inicial de cada execução é vazio; a experiência não modela alterar TTL de caches já existentes.', pdf='un09t02')

pratica(9, 11, 'Compartilhar memória resolve a concorrência?', 'memoria', 'Modelo de cópias de página e exclusividade',
 'Dois participantes recebem cópias da página com total 84. A adiciona 12; B adiciona 18. A abstração de memória compartilhada deve coordenar visibilidade e acesso, ainda que a sintaxe da aplicação pareça local.',
 'Se B calcular sobre sua cópia antiga, qual total enviará ao dono? A aparência de variável compartilhada torna ler-calcular-escrever uma operação indivisível?',
 './memoria', 'B escreve; valor no dono=102 Esperado_sem_perdas=114\nUltima copia sobrescreve total: incremento de A perdido.',
 'a e b representam cópias da mesma página; dono representa a versão recebida pelo nó responsável. No modo exclusiva, a escrita de A invalida a cópia de B; antes de modificar, B busca a versão atual. O roteiro já serializa os acessos completos de A e B: a combinação de ordem exclusiva e recarga preserva os dois incrementos. Invalidação isolada, sem controlar a operação inteira, não garante esse resultado para intercalações arbitrárias.',
 'Ative exclusiva mantendo os mesmos incrementos e a ordem de acesso do modelo.',
 './memoria exclusiva', 'A obtem exclusividade; copia de B invalidada.\nB busca pagina atual antes de escrever.\nB escreve; valor no dono=114 Esperado_sem_perdas=114',
 'Registre a versão usada por B e o total final. Descreva as mensagens de aquisição, invalidação e busca que uma implementação remota exigiria. Se A usa x e B usa y na mesma página, por que ainda poderia haver tráfego entre eles? Compare DSM com arquivo remoto e banco de dados.',
 'Não usa memória remota, page fault real, mmap compartilhado ou threads. É uma sequência explícita de estados em um processo. Falso compartilhamento é uma análise da granularidade de página, sem benchmark de latência.',
 'Sem recarga 102; com exclusividade na sequência fornecida 114. Não atribuir atomicidade a DSM por definição. Relacionar à região crítica de SO e ao custo de granularidade, sem transportar medidas de RAM local para rede.', pdf='un09t03')

pratica(10, 12, 'Quem pode incorporar uma leitura?', 'seguranca', 'Modelo de autorização e prevenção de repetição',
 'Três pedidos chegam ao serviço: sensor01 envia +12 com sequência 1; leitor01 tenta +18; sensor01 repete a mesma sequência 1. As identidades são assumidas como autenticadas por um mecanismo externo. Investigue o que a política consegue proteger sob essa hipótese.',
 'Sem autorização e sem controle de repetição, qual será o total partindo de 84? Se apenas sensor01 puder escrever, ainda haverá uma duplicata aceita? Autenticar alguém lhe concede qualquer permissão?',
 './seguranca aberto', 'sensor01 seq=1 valor=12 ACEITO\nleitor01 seq=1 valor=18 ACEITO\nsensor01 seq=1 valor=12 ACEITO\nTotal=126',
 'pode_escrever é a política por identidade. politica aplica a autorização; replay acrescenta a comparação da sequência com a última aceita. A sequência pertence a cada principal, não é um contador único para todos. O modelo supõe ordem crescente de um único emissor, sem reinício nem mensagens legítimas reordenadas. Rejeitar sequências antigas exige uma política de sessão e persistência num serviço real. Um campo de nome enviado pelo cliente, sozinho, não é autenticação.',
 'Ative politica e compare com aberto. Em seguida ative replay sem mudar os pedidos.',
 './seguranca politica\n./seguranca replay', 'politica: leitor01 NEGADO; Total=108\nreplay: leitor01 NEGADO; repeticao NEGADA; Total=96',
 'Monte a matriz identidade × operação e classifique cada rejeição. Escolha mecanismos de produção para identidade, confidencialidade e integridade, explicando por que o programa não os testa. O que ocorreria se um cliente pudesse forjar o principal? Como menor privilégio se relaciona à conta restrita do LIAC?',
 'Não há criptografia, autenticação real, TLS, assinatura, certificado ou armazenamento durável. Não enviar credenciais reais nem testar contas alheias. Proteger contra replay depende de vincular a sequência e o conteúdo à identidade autenticada; não basta acrescentar um contador em texto não confiável.',
 'Aberto126, política108, replay96. Explicar que TLS/SSH são protocolos padronizados, não rotinas caseiras a implementar aqui. Hash sem chave, por si só, não autentica uma mensagem contra alteração maliciosa. Relacionar perda da tabela com P08.')

TITULOS = {1:'Participantes e fronteiras',2:'Mensagens e comunicação',3:'Tempo e causalidade',
           4:'Coordenação e liderança',5:'Comunicação em grupo',6:'Concorrência e réplicas',
           7:'Transações distribuídas',8:'Tolerância a falhas',9:'Arquivos, nomes e memória',10:'Segurança'}

def par(s): return '<p>'+h(s)+'</p>'
def section(title, content): return '<section class="etapa"><h2>'+h(title)+'</h2>'+content+'</section>'
def campo(id, label):
    return f'<div class="question"><label for="{id}">{h(label)}</label><textarea id="{id}" placeholder="Escreva sua previsão, evidência, explicação e limites."></textarea></div>'
def comando(text, label='Execute no terminal', run='main', status=0):
    return f'<div class="command" data-run="{run}" data-status="{status}"><div class="command-head"><span>{h(label)}</span><button class="copy" type="button" aria-label="Copiar: {h(label)}">Copiar</button></div><pre tabindex="0"><code>{h(text)}</code></pre></div>'
def esperado(s):
    return '<details class="expected"><summary>Referência para comparação · abra depois de prever</summary><pre tabindex="0">'+h(s)+'</pre></details>'
def feito(n):
    return f'<label class="done"><input type="checkbox" id="feito-{n}" data-step="{n}">Concluí a investigação e expliquei as evidências</label>'
def page(unit, title, subtitle, body, n=0, prev=None, nxt=None):
    sub = unit not in ('inicio','professor')
    prefix = '../' if sub else ''
    discipline = '../../' if sub else '../'
    controls = '<div class="controls"><button type="button" id="theme" aria-pressed="false">Alternar tema</button><button type="button" id="download-answers">Baixar respostas</button></div>'
    progress = f'<p id="progress-count">0/{n} etapas</p><progress max="{max(n,1)}" value="0" aria-label="Investigações concluídas"></progress>' if n else ''
    links=[]
    if prev: links.append(f'<a href="{prev}">← Anterior</a>')
    if nxt: links.append(f'<a href="{nxt}">Próxima →</a>')
    return f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="description" content="{h(subtitle)}"><meta name="theme-color" content="#13202a"><title>{h(title)} · Práticas SD | LIAC</title><link rel="stylesheet" href="{prefix}styles.css"><script src="{prefix}script.js" defer></script></head>
<body data-unit="{unit}"><a class="skip" href="#conteudo">Pular para o conteúdo</a><div class="wrap"><nav class="topnav" aria-label="Navegação principal"><a href="{discipline}">← Disciplina SD</a><a href="{prefix}index.html">Percurso das práticas</a><a href="{prefix}professor.html">Guia docente</a><a href="https://terminal.liac-lab.dev" target="_blank" rel="noopener">Abrir terminal ↗ <span class="sr-only">(nova aba)</span></a></nav><header class="hero"><p class="label">LIAC · UNEMAT · Sistemas Distribuídos</p><h1>{h(title)}</h1><p class="lede">{h(subtitle)}</p>{controls}<p class="status" id="save-status" aria-live="polite">Respostas ficam apenas neste navegador quando permitido. Baixe antes de sair; não há envio automático.</p>{progress}</header><main id="conteudo">{body}</main><nav class="footer-nav" aria-label="Sequência do percurso">{''.join(links)}</nav><footer>Prof. Me. Juvenal Silva Neto · LIAC · UNEMAT, Campus de Alto Araguaia<br><a href="{prefix}professor.html">Guia docente e referências</a></footer></div></body></html>'''

def preparar(un):
    return section('Prepare sua pasta',
        par('Use sua conta pessoal no terminal Linux. Faça a prática indicada pelo professor. Cole um bloco por vez; as pastas são independentes por unidade. O bloco do programa cria ou substitui somente o fonte com o nome indicado. Recompile se editar o código. Não é necessário Python para estas atividades.')+
        comando(f'mkdir -p ~/atividades/sd-estacao/un{un:02}\ncd ~/atividades/sd-estacao/un{un:02}\npwd\ncommand -v bash gcc')+
        par('Confira o caminho e a presença do GCC. Se faltar uma ferramenta ou fork/pipe forem bloqueados, registre a mensagem e avise o professor; use a saída docente identificada como análise documental. Download no celular não transfere arquivos ao terminal. Não há instalação com sudo, acesso à conta de colegas ou necessidade de rede no núcleo das práticas.'))

def fonte(nome, run='main'):
    text=(ROOT/'arquivos'/f'{nome}.c').read_text()
    return '<details class="source"><summary>Programa C fornecido · abra, leia e copie</summary>'+par('A infraestrutura está pronta. Antes de executar, localize as operações destacadas na explicação da prática. O bloco abaixo escreve o fonte e compila com C11, avisos e sem otimização.')+comando(f"cat > {nome}.c <<'FIM'\n{text}FIM\ngcc -std=c11 -O0 -Wall -Wextra -Wpedantic {nome}.c -o {nome}", 'Criar e compilar '+nome+'.c',run)+f'<p><a href="../arquivos/{nome}.c" download>Baixar fonte {nome}.c</a> para revisão ou preparação.</p></details>'

def tcp():
    return section('Extensão opcional — comunicação TCP real em loopback',
        par('Execute somente se o professor confirmar que sockets locais são permitidos na conta utilizada, ou em WSL/laboratório autorizado. O núcleo em pipe continua completo sem esta extensão. Não altere firewall nem procure outras portas. O programa usa 127.0.0.1, porta atribuída pelo sistema, um filho e limite de cinco segundos. Não escuta nas interfaces da rede.')+
        campo('tcp-previsao','Que partes de pipe são substituídas por socket, bind, listen, connect e accept? A quebra de linha ainda é necessária?')+
        fonte('tcp_local','optional')+comando('./tcp_local','Executar TCP após autorização do ambiente','optional')+
        esperado('TCP loopback: leituras=4 total=84 resultado=OK\nSe bloqueado, registre o erro ou encerramento por tempo limite e mantenha a investigação em pipe.')+
        par('O filho conecta, envia quatro linhas e fecha a conexão. O pai aceita uma conexão, recebe um byte por chamada, recompõe linhas e soma. send pode aceitar só parte dos bytes: o laço completa o envio. recv é deliberadamente limitado a um byte; isso não demonstra como o TCP segmentou pacotes. A conexão é unidirecional nos dados da aplicação: o cliente não recebe uma resposta de processamento. O alarme é contingência do programa, não detector de falhas distribuídas. Em caminhos de erro, o sistema fecha descritores ao encerrar o processo; no caminho normal o pai também recolhe o filho.')+
        campo('tcp-evidencia','Registre ambiente, resultado ou bloqueio, operação de conexão e enquadramento. O que foi observado em TCP que não havia no pipe? O que ainda faltaria para afirmar comunicação entre máquinas distintas?'))

for un in range(1,11):
    items=[d for d in D if d['un']==un]
    body=section('Uma estação, vários nós',
        par('Leituras didáticas: 12, 18, 24 e 30; total 84 e média 21. O mesmo serviço de AOC e SO agora é investigado por suas fronteiras de comunicação, ordem de eventos e hipóteses de falha. Os participantes dos modelos não são máquinas reais.')+
        par('Ciclo de trabalho: prever → executar → interpretar → mudar uma condição → registrar uma decisão. Guarde trechos de saída acompanhados de explicação; eles serão retomados no dossiê final. Um modelo em C continua sendo um modelo, mesmo quando produz resultados exatos.'))
    body+=preparar(un)
    body+='<nav class="steps-nav" aria-label="Investigações desta unidade">'+''.join(f'<a href="#p{d["num"]:02}">P{d["num"]:02}</a>' for d in items)+'</nav>'
    for d in items:
        n=d['num']; id=f'p{n:02}'
        body+=f'<section class="etapa" id="{id}"><p class="label">P{n:02} · {h(d["natureza"])}</p><h2>{h(d["titulo"])}</h2>'
        body+=f'<p class="small">Base conceitual: <a href="../../materiais/pdfs/{d["pdf"]}.pdf" target="_blank" rel="noopener">Material da unidade {un} (PDF, nova aba)</a>. Tempo de referência: 60–90 min, ajustável pelo professor.</p>'
        body+=par(d['objetivo'])+campo(id+'-previsao','Antes de executar: '+d['prever'])
        body+=fonte(d['fonte'])+comando(d['executar'])+esperado(d['referencia'])
        body+='<h3>Interprete o programa e a saída</h3>'+par(d['explicar'])
        body+='<h3>Mudança orientada</h3>'+par(d['mudar'])
        body+=campo(id+'-mudanca','Preveja a variante antes de executá-la. Que condição muda, que resultado você espera e por quê?')
        body+=comando(d['variante'],'Executar mudança orientada','variant',d['status'])+esperado(d['ref_variante'])
        body+=campo(id+'-evidencia','Evidência e decisão: '+d['registrar'])
        body+='<div class="dica"><strong>Limites da conclusão:</strong> '+h(d['limite'])+'</div>'+feito(n)+'</section>'
    if un==2: body+=tcp()
    body+=section('Leve uma evidência para o dossiê',
        par('Baixe suas respostas neste aparelho e guarde as saídas que justificam suas decisões. O arquivo exportado não é enviado ao professor. Use o canal e o prazo definidos na disciplina. Se trabalhar em grupo, alterne operador, observador e relator; cada estudante deve conseguir explicar uma decisão.')+
        '<p><a href="../sintese/">Consultar os requisitos do dossiê final →</a></p>')
    folder=ROOT/f'un{un:02}';folder.mkdir(exist_ok=True)
    prev='../index.html' if un==1 else f'../un{un-1:02}/'
    nxt='../sintese/' if un==10 else f'../un{un+1:02}/'
    (folder/'index.html').write_text(page(f'un{un:02}',TITULOS[un],f'Unidade {un} · '+', '.join(f'P{d["num"]:02}' for d in items)+' · investigações em C11',body,len(items),prev,nxt))

intro=section('Da estação ao serviço distribuído',
    par('Em AOC você investigou a estação; em SO, o serviço que recebe leituras. Aqui você examina participantes, mensagens, coordenação, cópias e recuperação. O lote continua 12, 18, 24 e 30: total 84 e média 21.')+
    '<div class="diagram" role="img" aria-label="Produtores enviam leituras ao agregador, que gera relatório e troca estado com réplicas.">Produtores → mensagens → agregador → relatório<br>Agregador ↔ réplicas · clientes consultam o serviço</div>'+
    par('São 12 investigações organizadas nas dez unidades conceituais, mais uma síntese. Todas têm pergunta, previsão, programa fornecido, execução, interpretação, mudança orientada e registro de evidências. Faça a atividade indicada pelo professor; cada investigação estima 60–90 minutos, e a unidade 9 contém três investigações. Essa estimativa não define a carga horária institucional.'))
intro+=section('Antes de começar',
    par('Use Bash e GCC/C11 no terminal Linux do LIAC. Não há Python para o aluno, instalação, downloads no terminal ou serviços persistentes. Os programas terminam sozinhos. As pastas ficam em ~/atividades/sd-estacao/un01 a un10. Copie os blocos do roteiro; o ZIP é para preparação e revisão, pois baixar no celular não transfere arquivos para a conta remota.')+
    par('P01 e P02 executam processos e pipe reais na mesma máquina. P03 a P12 executam modelos determinísticos com hipóteses declaradas. A extensão TCP da unidade 2 é opcional e depende de ambiente autorizado; localhost pode estar bloqueado no LIAC. Esses experimentos não equivalem a executar em máquinas independentes.')+
    par('As respostas ficam neste navegador, sem envio automático, nota ou presença. Exporte antes de sair. A leitura, o código e a navegação funcionam sem JavaScript; nesse caso registre as respostas em arquivo próprio. A marcação de conclusão é apenas uma ajuda pessoal.'))
intro+='<section class="etapa"><h2>Escolha a investigação</h2><ul class="route">'
for un,title in TITULOS.items():
    ds=[d for d in D if d['un']==un]
    intro+=f'<li><span class="badge">UNIDADE {un:02} · '+', '.join(f'P{d["num"]:02}' for d in ds)+f'</span><h3><a href="un{un:02}/">{h(title)}</a></h3>'
    intro+=par(' · '.join(d['titulo'] for d in ds))+par('Execução real de IPC local' if un in (1,2) else 'Modelo executável com limites explícitos')+'</li>'
intro+='<li><span class="badge">P13 · SÍNTESE</span><h3><a href="sintese/">Qual arquitetura atende à estação?</a></h3><p>Reúna evidências, declare requisitos e defenda decisões de comunicação, consistência e recuperação.</p></li></ul></section>'
intro+=section('Preparação e mediação', '<p><a href="professor.html">Guia do professor: planejamento, resultados, avaliação e homologação</a></p><p><a href="arquivos/sd-estacao-fontes.zip" download>Baixar fontes e diagnóstico (.zip)</a> · <a href="../materiais/">Materiais teóricos</a></p>')
(ROOT/'index.html').write_text(page('inicio','Uma estação, vários nós','Sistemas Distribuídos · 12 investigações em C e um dossiê de arquitetura',intro,nxt='un01/'))

body=section('P13 — Defenda uma arquitetura',
    par('Sua equipe precisa decidir como a estação deve operar quando produtores, agregador e leitores estiverem em máquinas distintas. Use as evidências das 12 práticas para justificar o projeto. Não é necessário implementar um sistema completo nem afirmar que os modelos já o validaram.')+
    par('Cenário de referência: quatro produtores identificados enviam uma leitura inteira por minuto e um serviço mantém o relatório. O painel pode mostrar dados com até dois minutos de atraso, desde que informe a idade. Mensagens podem atrasar ou se repetir; um processo pode reiniciar. Não perder nem duplicar leituras já confirmadas é um requisito. Esses são requisitos para o projeto, não garantias medidas pelos programas. Declare a disponibilidade que pretende obter e o tratamento de dados ainda não confirmados.')+
    campo('p13-previsao','Antes de revisar o percurso, que arquitetura você escolheria: agregador único, primário com backup, réplicas ativas ou pares? Que risco principal você prevê?'))
body+=section('Monte o dossiê com os registros existentes',
    '<ol><li>Desenhe participantes, máquinas propostas, canais e fronteiras de falha. Compare sua opção com uma alternativa e explique o requisito que orientou a escolha.</li><li>Defina formato de mensagem, identificação do produtor, ID da leitura e resposta de confirmação. Distinga receber bytes de confirmar uma operação recuperável.</li><li>Declare dependências causais, versão de calibração e política para leitura antiga, conflitos e mensagens fora de ordem.</li><li>Defina estado que precisa sobreviver a reinício ou failover, inclusive IDs e respostas. Explique como evitar reaplicar leituras já confirmadas.</li><li>Defina resolução do serviço e suas permissões. Explique o que autentica os participantes e protege o canal, sem propor criptografia caseira.</li><li>Reúna pelo menos uma evidência explicada de cada unidade. Na U9, distinga arquivos, nomes e memória. Identifique observação real, modelo e proposta futura.</li></ol>'+
    campo('p13-arquitetura','Registre os requisitos, o desenho da arquitetura e a alternativa comparada. Onde permanecem pontos únicos de falha?')+
    campo('p13-evidencias','Reúna as evidências das dez unidades, incluindo a mudança orientada de cada uma. Para cada evidência, escreva o que permite concluir e o que fica sem teste.')+
    campo('p13-protocolo','Especifique mensagem, confirmação, ordenação, consistência, coordenação e recuperação. Que dados devem ser gravados de forma durável antes de confirmar? Por que replicar ou usar TCP, por si só, não atende ao requisito de não duplicar leituras?'))
body+=section('Teste seu argumento com dois incidentes',
    par('Incidente A: a leitura foi incorporada, a resposta se perdeu e o cliente reenviou depois do failover. Incidente B: um leitor resolve o nome para um destino antigo enquanto outro recebe uma calibração nova. Descreva a sequência esperada e a informação que o usuário deve ver; não esconda incerteza com um relatório aparentemente completo.')+
    campo('p13-incidentes','Como seu projeto reage a cada incidente? Cite P02/P05/P08/P10 quando pertinentes. Que comportamento deve ser testado em uma implementação real?')+
    campo('p13-validacao','Proponha um teste futuro em ambiente autorizado com duas máquinas, limites de duração e resultado verificável. Liste as hipóteses ainda não validadas, incluindo armazenamento, rede, segurança e precisão de tempo.')+feito(13))
body+=section('Entrega e defesa',
    par('Use os registros já produzidos; não crie 12 relatórios adicionais. Exporte esta síntese e as respostas das unidades, ou reúna-as no formato indicado pelo professor. Cada integrante explica uma decisão e sua evidência. O site não reúne arquivos automaticamente e não envia a entrega.')+
    par('Critérios da síntese, em 10 pontos: evidências e distinção entre observação/modelo/proposta (3), coerência entre requisitos e arquitetura (3), comparação de alternativas e limites (2), clareza e defesa individual das contribuições (2). O peso na disciplina e o prazo são definidos pelo professor.'))
folder=ROOT/'sintese';folder.mkdir(exist_ok=True)
body=body.replace('<section class="etapa">','<section class="etapa" id="p13">',1)
(folder/'index.html').write_text(page('sintese','Qual arquitetura atende à estação?','P13 · dossiê progressivo e defesa de decisões',body,1,'../un10/','../index.html'))

body=section('Base pedagógica e materiais',
    par('Este percurso segue as definições das práticas finais de AOC e SO: narrativa integradora, previsão antes de executar, código fornecido em C, interpretação, mudança orientada, evidências progressivas e decisões na síntese. Não é uma atividade de copiar comandos ou memorizar APIs.')+
    par('Foram consultados os 12 PDFs publicados de SD, organizados em dez unidades, e o roteiro anterior WSL das unidades 1–3. Os PDFs são imagens: a leitura foi apoiada por OCR local. O planejamento inicial fica preservado em ../PLANEJAMENTO_PRATICAS.md e no download histórico planejamento.md. Nenhum outro plano de ensino de SD foi identificado pelo professor nesta elaboração.')+
    par('A sequência contém 12 investigações e uma síntese. Como estimativa de preparação, reserve 60–90 minutos por investigação, mais uma sessão de síntese, com ajuste após aula piloto. U9 exige três blocos temáticos. Não transportar automaticamente os 13 ou 14 encontros de AOC/SO nem afirmar integralização de carga horária de SD sem o plano e calendário.')+
    '<p><a href="../materiais/">Materiais conceituais de SD</a> · <a href="planejamento.md" download>Planejamento inicial preservado</a> · <a href="arquivos/sd-estacao-fontes.zip" download>Fontes e diagnóstico</a></p>')
rows=''
for d in D:
    rows+=f'<tr><td>P{d["num"]:02} · U{d["un"]}</td><td><a href="un{d["un"]:02}/#p{d["num"]:02}">{h(d["titulo"])}</a></td><td>{h(d["natureza"])}</td><td><a href="../materiais/pdfs/{d["pdf"]}.pdf">{d["pdf"]}</a></td></tr>'
body+=section('Confronto com as unidades conceituais', '<div class="tbl"><table><thead><tr><th>Prática</th><th>Investigação</th><th>Evidência</th><th>Material</th></tr></thead><tbody>'+rows+'<tr><td>P13</td><td>Síntese de arquitetura</td><td>Dossiê e defesa</td><td>Todas as unidades</td></tr></tbody></table></div>')
body+=section('Cobertura e escolhas de adaptação',
    '<ul><li>U1: arquitetura, transparência, escalabilidade e heterogeneidade são discutidas a partir de processos locais, sem confundi-los com computadores autônomos.</li><li>U2: núcleo real de IPC e serialização; sockets TCP em extensão. UDP, API, RPC/RMI, bloqueio e filas são discutidos a partir das diferenças de contrato, sem exigir broker, MPI ou serviço web.</li><li>U3: Lamport e causalidade em modelo; tempo físico, desvio, deriva e NTP são confrontados conceitualmente, sem alterar relógio do servidor.</li><li>U4: token e perda de progresso; seleção por maior ID com visão única. Eleição em anel, Bully, coordenador e Ricart–Agrawala são comparações documentais, sem alegar implementação desses protocolos.</li><li>U5: chegada versus entrega causal. Unicast/broadcast/multicast, flooding, FIFO, ordem total e gossip são discutidos; não se afirma execução de multicast IP ou algoritmo geral de difusão.</li><li>U6: escritas concorrentes, divergência e reconciliação. O contador por componentes é uma extensão didática para testar preservação de incrementos e repetição de merge, não uma solução para todo estado compartilhado.</li><li>U7: 2PC modelado, votos e estados. Logs duráveis e recuperação são requisitos analisados, sem banco de dados ou comprovação de todas as propriedades ACID.</li><li>U8: omissão de resposta, repetição, deduplicação e perda de metadados. Heartbeat, failover e replicação são relacionados no registro; o programa não mede disponibilidade ou tolerância bizantina.</li><li>U9: três investigações distintas em vez de reduzir arquivos, nomes e DSM a uma prática única. Sem montagem NFS, DNS externo ou páginas remotas reais.</li><li>U10: política e repetição sob identidade previamente autenticada. SSH/TLS, confidencialidade e integridade são decisões documentadas; não se implementa criptografia.</li></ul>')
body+=section('Homologação no LIAC antes da turma',
    par('O planejamento registra documentação local do LIAC com uma CPU por conta, cerca de 1 GiB de RAM, 200 processos e 50 MB, além de recusa de conexões de saída, possivelmente inclusive para serviços locais. Isso é referência documental, não auditoria vigente. Nenhuma conta do LIAC foi acessada nem política alterada durante a elaboração.')+
    '<ol><li>Confirmar Bash, GCC/C11, biblioteca C/POSIX e criação de um filho com pipe na conta estudantil. O diagnóstico fornecido só consulta ferramentas e limites do shell; não homologa automaticamente o ambiente.</li><li>Conferir colagem, compilação, exportação e leitura em aparelho móvel real. Preparar o primeiro acesso antes da investigação conceitual.</li><li>Executar o núcleo com as quotas reais. Os modelos não criam processos; estacao e a extensão TCP criam um filho. São lotes finitos, sem stress ou serviços persistentes.</li><li>Confirmar a regra de rede com o responsável. Somente se permitido, executar TCP loopback em porta efêmera; não contornar bloqueio. WSL pode ser ambiente alternativo autorizado, preparado antes da aula.</li><li>Se IPC não for possível, oferecer saídas de referência identificadas e avaliar análise documental; registrar que a execução real ficou pendente. Se apenas TCP for bloqueado, o núcleo em pipe permanece executável.</li><li>Definir canal, formato e prazo de entrega. Campos ficam no navegador; não constituem presença, nota ou envio ao servidor.</li></ol>'+
    par('O roteiro WSL anterior permanece em sd/un01-02-03/. As instruções antigas de instalação com sudo, portas fixas, escuta ampla ou execução contínua não são transferidas ao terminal compartilhado.')+
    '<p><a href="arquivos/verificar-ambiente.sh" download>Diagnóstico de leitura do ambiente</a></p>')
body+=section('Mediação e organização do tempo',
    par('Como referência para um bloco inicial de 60 minutos: 5 para pergunta/previsão, 30 para execução acompanhada, 15 para interpretação e alteração e 10 para registro/discussão. A extensão para 90 minutos acomoda leitura do código e discussão. Não retirar a interpretação para caber no relógio; redistribuir o trabalho conforme o plano docente.')+
    par('Em grupos, alternar operador, observador e relator. Pedir explicação individual de uma decisão. Antes de copiar, registrar previsão; depois localizar no código a operação que explica o resultado. Oferecer apoio nos cabeçalhos, tratamento de erros e APIs POSIX. O objetivo é raciocinar sobre comunicação e propriedades, sem exigir domínio prévio de toda a infraestrutura.')+
    par('Caminho recomendado: validar P01–P03 em aula piloto e então estender. As unidades são independentes nos arquivos e podem ser retomadas; o dossiê é progressivo. O professor seleciona o bloco da aula, especialmente na U9. Se usar a extensão de rede, reservar tempo próprio e registrar a natureza da experiência.'))
body+=section('Cuidados conceituais na leitura dos slides',
    par('Usar os slides como base de discussão e explicitar as hipóteses de suas sínteses. Processos locais não compartilham automaticamente variáveis privadas; memória compartilhada exige mecanismo específico. IP e porta identificam endpoints sob regras de vinculação, não uma correspondência universal de uma porta com um processo. TCP entrega um fluxo ordenado quando a conexão funciona, sem confirmar que a aplicação persistiu uma operação.')+
    par('Lamport preserva acontece-antes, sem provar sua recíproca. Replicação, eleição e transparência não garantem disponibilidade contínua por si sós; dependem do modelo de falhas, da comunicação e do protocolo. Consistência forte deve ser definida por um contrato, sem prometer visibilidade instantânea universal. 2PC não fornece sozinho isolamento nem durabilidade. O comportamento de NFS em falha depende de versão, operação e opções; não prometer sempre erro imediato. Hash não autenticado não prova integridade contra atacante capaz de alterar também o hash.'))
body+=section('Avaliação e dossiê',
    par('Rubrica por investigação, em 10 pontos: previsão justificada (2), evidências e comparação (3), interpretação conceitual e limites (3), mudança orientada e relação com o serviço (2). Não pontuar rapidez, número de comandos, contagem variável de fragmentos ou velocidade do equipamento. Restrições reais documentadas pedem análise alternativa, sem penalização automática.')+
    par('Na P13: evidências e distinção real/modelo/proposta (3), coerência entre requisitos e arquitetura (3), comparação e limites (2), clareza e defesa individual (2). Definir pesos no plano de ensino. A entrega reúne registros existentes, sem exigir 12 novos relatórios. O cenário final explicita quatro produtores, leituras por minuto, atraso permitido do painel e não duplicação de leituras confirmadas. A proposta deve reconhecer o que ainda precisaria de implementação e teste.'))
for d in D:
    body+=section(f'P{d["num"]:02} — respostas e intervenção',par(d['docente']))
body+=section('Síntese — elementos esperados',
    par('Uma solução possível é primário com backup e ID estável por produtor/leitura, confirmação após registro recuperável de efeito e deduplicação, mensagens com versão de calibração e leituras do painel marcadas com idade. Isso só atende aos requisitos se persistência, replicação, troca de autoridade e recuperação forem definidas e testadas. Não dar como resolvidos split-brain, perda de disco, canais inseguros ou eleição por simplesmente desenhar um backup.')+
    par('No incidente A, o novo primário deve conhecer tanto o efeito quanto o ID/resposta para não reaplicar. No B, nome cacheado e calibração têm políticas distintas de versão/validade. Esperar reconhecimento de dados antigos e de incerteza. Aceitar outras arquiteturas quando os requisitos e compromissos estiverem demonstrados.'))
body+=section('Referências técnicas e manutenção',
    '<ul><li><a href="https://pubs.opengroup.org/onlinepubs/9799919799/functions/read.html">POSIX: read</a> e <a href="https://pubs.opengroup.org/onlinepubs/9799919799/functions/pipe.html">pipe</a>.</li><li><a href="https://www.rfc-editor.org/rfc/rfc9293.html">IETF RFC 9293: TCP</a>.</li><li><a href="https://lamport.azurewebsites.net/pubs/time-clocks.pdf">Lamport (1978): Time, Clocks, and the Ordering of Events in a Distributed System</a>.</li><li><a href="https://www.postgresql.org/docs/18/sql-prepare-transaction.html">PostgreSQL: exemplo real de preparação e confirmação separadas</a>.</li></ul>'+
    par('Ferramentas do professor: gerar.py mantém páginas e ZIP a partir dos roteiros e fontes; verificar.py executa os blocos e as variantes em pastas temporárias e verifica conteúdo, links e pacote. Python e Playwright são ferramentas de manutenção, sem dependência para os alunos.')+
    par('Nesta elaboração, os blocos do HTML, as mudanças orientadas, os limites de entrada e os cenários alternativos passaram na validação local com avisos como erros e UBSan. A extensão TCP loopback também foi executada em ambiente local autorizado. A interface foi conferida em navegador emulado nas larguras 320, 390, 768 e 1440, incluindo fontes abertas, persistência, isolamento por unidade, exportação, cópia, tema, ausência de armazenamento e navegação sem JavaScript.')+
    par('Essa validação não substitui homologação no LIAC, aparelho físico ou aula piloto. A extensão TCP é verificada separadamente com --tcp em ambiente autorizado. Não há teste de comunicação entre máquinas distintas. A interface funciona como site estático sem backend.'))
(ROOT/'professor.html').write_text(page('professor','Guia do professor','Planejamento, mediação, respostas e condições do laboratório',body))

# Pacote inclui apenas fontes dos alunos e diagnóstico, sem ferramentas Python.
with zipfile.ZipFile(ROOT/'arquivos/sd-estacao-fontes.zip','w',zipfile.ZIP_DEFLATED) as z:
    for path in sorted((ROOT/'arquivos').iterdir()):
        if path.suffix in ('.c','.sh'):
            info=zipfile.ZipInfo(path.name,date_time=(2026,11,3,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(info,path.read_bytes())
print('Geradas: entrada, dez unidades, sintese, guia docente e pacote de fontes.')
