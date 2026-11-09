'use strict';
const $ = s => document.querySelector(s);
const steps = ['prever', 'executar', 'interpretar', 'modificar', 'revisar'];
const fields = {
  previsao: ['O que você acha que vai acontecer?', 'Escreva uma previsão curta e diga por quê. Ela não vale pontos; você poderá mudar de ideia.'],
  ambiente: ['Em qual ambiente você executou?', 'Cole a saída de bash observar.sh. Não inclua sua senha nem informações pessoais de outras pessoas.'],
  saida_inicial: ['Resultado com a matriz 1024', 'Cole a saída completa do comando, incluindo as rodadas, os RESUMOS e a CONFERENCIA.'],
  mediana_linhas: ['Mediana por linhas, em ms', 'Copie mediana_parede_ms do RESUMO linhas. Aceita ponto ou vírgula.'],
  mediana_colunas: ['Mediana por colunas, em ms', 'Copie mediana_parede_ms do RESUMO colunas.'],
  comparacao: ['O que os números mostram?', 'Use valores reais para comparar. Se houver muita variação ou pouca diferença, explique isso.'],
  saida_mudanca: ['Resultado com a matriz 512', 'Cole a saída completa da execução menor.'],
  explicacao: ['Como você explica o que encontrou?', 'Relacione sua explicação aos números. Uma hipótese não é uma certeza.'],
  limites: ['O que limita sua conclusão?', 'Cite pelo menos uma influência além da cache e diga como ela pode afetar a comparação.'],
  saida: ['Resultado da primeira execução da cadeia', 'Cole as cinco rodadas e os resumos de todos os tamanhos.'],
  resultados: ['Sua tabela de tempos por acesso', 'Uma linha por tamanho: KiB | ns_por_acesso_parede | ns_por_acesso_cpu. Use os RESUMOS da primeira execução.'],
  saida_repeticao: ['Resultado da execução em ordem inversa', 'Cole a saída completa para comparar os mesmos tamanhos em outra ordem.']
};
const activities = {
  matriz: {
    title: 'Linhas ou colunas?', number: 1,
    objective: 'Objetivo: comparar os tempos de duas formas de ler a mesma matriz e explicar como usar dados vizinhos pode ajudar a cache.',
    resources: 'Recursos: terminal LIAC, programa em C pronto, esta página e uma calculadora, se desejar.',
    keys: ['previsao','ambiente','saida_inicial','mediana_linhas','mediana_colunas','comparacao','saida_mudanca','explicacao','limites'],
    required: {prever:['previsao'], executar:['ambiente','saida_inicial'], interpretar:['mediana_linhas','mediana_colunas','comparacao'], modificar:['saida_mudanca','explicacao','limites']},
    rubric: [['4 pontos','Registra as duas execuções com conferência OK, extrai corretamente as medianas e compara os tempos.'],['4 pontos','Relaciona a leitura de dados vizinhos à localidade espacial (spatial locality) e usa evidências para discutir o efeito do tamanho da matriz.'],['2 pontos','Aponta uma limitação e evita afirmar que tempo é contagem de faltas na cache (cache misses) ou prova isolada da cache.']],
  },
  cadeia: {
    title: 'Perto ou longe?', number: 2,
    objective: 'Objetivo: comparar o tempo por busca em conjuntos de tamanhos diferentes e explicar por que o espaço limitado da cache pode influenciar esse tempo.',
    resources: 'Recursos: terminal LIAC, o mesmo programa em C, dados de cache informados pelo Linux e esta página.',
    keys: ['previsao','ambiente','saida','resultados','comparacao','saida_repeticao','explicacao','limites'],
    required: {prever:['previsao'], executar:['ambiente','saida'], interpretar:['resultados','comparacao'], modificar:['saida_repeticao','explicacao','limites']},
    rubric: [['4 pontos','Registra as duas execuções e monta uma tabela coerente para os cinco tamanhos, com unidades.'],['4 pontos','Compara pelo menos dois tamanhos com valores, verifica se a tendência se repete e relaciona a hipótese à capacidade limitada da cache.'],['2 pontos','Distingue hipótese de certeza e aponta influência de outros fatores, sem declarar descoberta exata de L1, L2 ou L3.']],
  }
};
const STORAGE_KEY = 'aoc-cache-fisica-respostas-v2';
let active = 'matriz';
const state = {}, prepared = {};
for (const key of Object.keys(activities)) state[key] = {answers:{}, step:'prever', saved:null, dirty:false};
let storageUnavailable = false;
try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (stored && typeof stored === 'object') {
    if (Object.hasOwn(activities, stored.active)) active = stored.active;
    for (const key of Object.keys(activities)) {
      const value = stored.activities?.[key];
      if (!value || typeof value !== 'object') continue;
      if (steps.includes(value.step)) state[key].step = value.step;
      if (typeof value.saved === 'string' && Number.isFinite(Date.parse(value.saved))) state[key].saved = value.saved;
      for (const field of activities[key].keys) {
        if (typeof value.answers?.[field] === 'string') state[key].answers[field] = value.answers[field].slice(0,20000);
      }
    }
  }
} catch (_) { storageUnavailable = true; }
const text = (tag, value, cls) => { const el = document.createElement(tag); el.textContent = value; if (cls) el.className = cls; return el; };
function message(value, error=false) { $('#action-message').textContent = value; $('#action-message').className = error ? 'error' : ''; }
function date(value) { return new Date(value).toLocaleString('pt-BR'); }
function status() {
  const s = state[active];
  $('#save-status').textContent = s.dirty || storageUnavailable
    ? 'O navegador não confirmou o salvamento. Baixe suas respostas antes de sair.'
    : s.saved ? 'Respostas e etapa salvas neste navegador em ' + date(s.saved) : 'As respostas serão salvas automaticamente neste navegador.';
  $('#save-status').className = s.dirty || storageUnavailable ? 'error' : '';
}
function save() {
  const saved = new Date().toISOString();
  const snapshot = {active, activities:{}};
  for (const key of Object.keys(activities)) snapshot.activities[key] = {answers:state[key].answers, step:state[key].step, saved:key===active?saved:state[key].saved};
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    state[active].saved = saved;
    for (const s of Object.values(state)) s.dirty = false;
    storageUnavailable = false; status(); return true;
  } catch (_) {
    state[active].dirty = true; storageUnavailable = true; status(); return false;
  }
}
function changed(key, value) {
  state[active].answers[key] = value;
  state[active].dirty = true;
  delete prepared[active];
  save();
}
function field(key, parent) {
  const [title, help] = fields[key], label = document.createElement('label');
  label.htmlFor = 'answer-' + key; label.textContent = title;
  const hint = text('p', help, 'field-help'); hint.id = 'help-' + key;
  const el = document.createElement(key.startsWith('mediana_') ? 'input' : 'textarea');
  el.id = 'answer-' + key; el.dataset.answer = key;
  el.setAttribute('aria-describedby', hint.id); el.maxLength = 20000;
  if (key.startsWith('mediana_')) { el.inputMode='decimal'; el.maxLength=30; }
  el.value = state[active].answers[key] || '';
  el.addEventListener('input', () => { changed(key, el.value); if (key.startsWith('mediana_')) ratio(); });
  parent.append(label, hint, el);
}
function paragraph(parent, value, cls) { parent.append(text('p', value, cls)); }
function command(parent, value) {
  const box = document.createElement('div'); box.className='command';
  const pre = text('pre', value), button = text('button', 'Copiar comandos'); button.type='button';
  button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(value); button.textContent='Copiado. Cole no terminal.'; }
    catch (_) { button.textContent='Selecione o texto abaixo e copie.'; }
  }); box.append(button, pre); parent.append(box);
}
function setup(parent) {
  const details = document.createElement('details');
  details.append(text('summary', 'Preparar os arquivos no LIAC — abra se ainda não preparou'));
  paragraph(details, 'Copie este bloco inteiro. No terminal LIAC, cole e pressione Enter. Ele cria uma pasta só para estas atividades, coloca nela os arquivos prontos e prepara o programa para rodar. Se os arquivos já existem nessa pasta, este bloco repõe os fontes fornecidos; seus relatórios .txt continuam guardados.');
  command(details, window.AOC_SETUP);
  paragraph(details, 'O comando gcc é o compilador (compiler): transforma o texto em C em um programa executável. -O2 escolhe a otimização (optimization) usada igualmente nos testes; os avisos -Wall e -Wextra ajudam a detectar problemas. Não é necessário decorar essas opções.');
  paragraph(details, 'Ao terminar, devem aparecer informações do ambiente. Se aparecer “gcc: command not found”, “Permission denied”, falta de memória ou erro de compilação, pare e chame o professor. Não tente instalar nada.');
  parent.append(details);
}
function ratio() {
  const el = $('#ratio'); if (!el) return;
  const a = Number((state.matriz.answers.mediana_linhas || '').replace(',','.'));
  const b = Number((state.matriz.answers.mediana_colunas || '').replace(',','.'));
  el.textContent = a > 0 && b > 0 ? `Colunas ÷ linhas = ${(b/a).toFixed(2)}. Acima de 1: colunas levaram mais tempo; abaixo de 1: linhas levaram mais tempo. Compare também as rodadas antes de concluir.` : 'Preencha as duas medianas para calcular a razão entre os tempos.';
}
function render() {
  const a=activities[active], s=state[active], parent=$('#steps'); parent.replaceChildren();
  $('#activity-title').textContent=a.title; $('#activity-label').textContent=`ATIVIDADE ${a.number} · ATÉ 30 MINUTOS`;
  $('#activity-objective').textContent=a.objective; $('#resources').textContent=a.resources;
  $('#step').value=s.step;
  document.querySelectorAll('[data-activity]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.activity===active)));
  const headings = {prever:'1. Antes de rodar: faça uma previsão',executar:'2. Execute no terminal e guarde o resultado',interpretar:'3. Compare os números com calma',modificar:'4. Mude uma condição e confira sua explicação',revisar:'5. Confira o que você vai entregar'};
  const heading=text('h3',headings[s.step],'step-heading'); heading.tabIndex=-1; parent.append(heading);
  if (s.step==='prever') {
    paragraph(parent, active==='matriz' ? 'Uma matriz (two-dimensional array) é uma tabela de números. Neste programa em C, a organização é por linhas (row-major order): os números de uma linha ficam lado a lado na memória. Ler por linhas (row-wise traversal) usa os vizinhos antes de passar à linha seguinte. Ler por colunas (column-wise traversal) pula de uma linha para outra. Os dois caminhos vão ler os mesmos números e fazer a mesma soma.' : 'Imagine uma caça ao tesouro: cada pista diz onde está a próxima. Nosso programa segue uma cadeia de referências (pointer chasing): cada posição da memória indica a próxima, em uma ordem embaralhada. Para descobrir a próxima posição, ele precisa ler a atual. A mesma cadeia é percorrida muitas vezes.');
    paragraph(parent, active==='matriz' ? 'Qual caminho você acha que terminará primeiro? Por quê? Não execute ainda.' : 'Se a quantidade de dados crescer de 8 KiB para 16 MiB, o tempo de cada busca será sempre igual? Registre sua ideia antes de executar.');
    field('previsao',parent); paragraph(parent,'Avance depois de registrar sua previsão. Ela é um ponto de partida, não uma resposta que precisa estar certa.');
  }
  if(s.step==='executar') {
    setup(parent);
    paragraph(parent,'Não é necessário baixar arquivos no terminal nem acessar a internet por ele. Os comandos são colados. Os arquivos também estão disponíveis para o professor no pacote de fontes.');
    const link=text('a','Baixar os fontes em ZIP'); link.href='arquivos/cache-fisica-fontes.zip'; parent.append(link);
    command(parent, 'cd ~/atividades/aoc-cache-fisica\nbash observar.sh | tee ambiente.txt\n' + (active==='matriz' ? './cache_lab matriz 1024 | tee matriz-1024.txt' : './cache_lab cadeia | tee cadeia-a.txt'));
    paragraph(parent,'O trecho “| tee nome.txt” mostra a resposta na tela e guarda uma cópia no arquivo. Para reler depois, digite cat seguido do nome: por exemplo, cat ambiente.txt. Não cole sua senha nesta página.');
    paragraph(parent,active==='matriz' ? '1024 é a quantidade de linhas e também de colunas. O programa faz cinco rodadas, alterna qual caminho vem primeiro e confere se as somas estão corretas. Antes de cronometrar, faz uma leitura de aquecimento (warm-up), como uma volta de reconhecimento.' : 'São cinco tamanhos de dados: 8, 32, 256, 2048 e 16384 KiB. Cada um é medido cinco vezes. O número de buscas por rodada é igual em todos. Cada posição da cadeia ocupa 64 bytes. O número lido indica a próxima posição, que pode estar longe. Esse tamanho escolhido no programa não descobre o tamanho real da linha da cache (cache line).');
    paragraph(parent,'Espere o terminal voltar a mostrar a linha em que você pode digitar. Procure CONFERENCIA e OK. Se o teste for interrompido ou der erro, guarde a mensagem e peça ajuda; não interprete uma execução incompleta como resultado normal.','note');
    field('ambiente',parent); field(active==='matriz'?'saida_inicial':'saida',parent);
    paragraph(parent,'Avance quando tiver uma execução completa e tiver registrado o ambiente e a saída. Esses arquivos são resultados de trabalho. Na última etapa, você vai preparar um arquivo final para a entrega no LIAC.');
  }
  if(s.step==='interpretar') {
    paragraph(parent,'RESUMO reúne os resultados. mediana_parede_ms é o valor do meio entre as cinco medidas do tempo total decorrido (wall-clock time; elapsed time). mediana_cpu_ms considera o tempo de CPU (CPU time), contabilizado para o programa; inclui esperas por dados da memória durante a execução. maior_dividido_menor compara a rodada mais demorada com a mais rápida: perto de 1 significa pouca variação; valores maiores pedem mais cuidado.');
    if(active==='matriz') {
      field('mediana_linhas',parent); field('mediana_colunas',parent);
      const p=text('p','','note'); p.id='ratio'; parent.append(p);
      paragraph(parent,'Compare linhas e colunas. A diferença foi grande ou pequena? As rodadas contam uma história parecida? O tempo de CPU aponta na mesma direção que o tempo total?');
    } else {
      paragraph(parent,'Use ns_por_acesso_parede e ns_por_acesso_cpu. O programa divide o tempo pelo número de buscas. Não compare apenas o tempo total: queremos saber o custo médio de uma busca neste percurso.');
      field('resultados',parent);
      paragraph(parent,'Compare pelo menos dois tamanhos e cite os valores. Os conjuntos maiores demoraram mais por busca? Houve alguma exceção? Se os valores variaram muito, diga isso.');
    }
    field('comparacao',parent); paragraph(parent,'Avance depois de comparar os resultados com números. Não é preciso que eles confirmem sua previsão.');
  }
  if(s.step==='modificar') {
    if(active==='matriz') {
      paragraph(parent,'Agora mude somente o tamanho da matriz: de 1024 para 512. O programa continua lendo por linhas e por colunas. Compare os caminhos dentro de cada tamanho; uma matriz menor também tem menos elementos, então terminar antes, por si só, não prova um efeito da cache.');
      command(parent,'cd ~/atividades/aoc-cache-fisica\n./cache_lab matriz 512 | tee matriz-512.txt'); field('saida_mudanca',parent);
      paragraph(parent,'Explique como usar dados vizinhos pode ajudar a aproveitar os blocos (blocks) trazidos à cache. A diferença entre linhas e colunas mudou com a matriz menor? Use números e diga se sua hipótese ficou mais forte ou se o teste não foi suficiente.');
    } else {
      paragraph(parent,'Repita os mesmos tamanhos, agora do maior para o menor. Mudar a ordem ajuda a perceber se a tendência se mantém em outra execução; não elimina todas as interferências.');
      command(parent,'cd ~/atividades/aoc-cache-fisica\n./cache_lab cadeia inversa | tee cadeia-b.txt'); field('saida_repeticao',parent);
      paragraph(parent,'Compare novamente pelo menos dois tamanhos usando os valores das duas execuções. A tendência se repetiu? Consulte os tamanhos L1, L2 e L3 do ambiente, os níveis de cache (cache levels): L1 fica mais perto do núcleo, e os outros níveis costumam oferecer mais espaço. Seus tempos são compatíveis com a ideia de que dados maiores deixam de caber nas memórias mais rápidas?');
    }
    field('explicacao',parent);
    paragraph(parent,'Outras influências possíveis: colegas usando o servidor, mudança de núcleo (core migration) durante a execução, frequência variável do processador (CPU frequency scaling), busca antecipada de dados (data prefetching) pelo processador e tradução de endereços (address translation), que converte os endereços usados pelo programa em endereços da memória física. Não dá para atribuir toda diferença somente à cache. Você não precisa decorar esses termos: escolha uma influência e explique seu efeito com palavras simples.');
    field('limites',parent); paragraph(parent,'Avance depois de guardar a segunda execução e escrever sua explicação e sua limitação.');
  }
  if(s.step==='revisar') {
    paragraph(parent,'Leia abaixo os resultados e as explicações que você reuniu. Se faltar algo, volte à etapa correspondente. O professor avaliará somente o arquivo final entregue pelo procedimento já usado no LIAC.');
    parent.append(text('pre',review()));
    const button=text('button','Preparar arquivo final para o LIAC'); button.id='open-prepare'; button.type='button'; button.addEventListener('click',openPrepare); parent.append(button);
    if(prepared[active]) {
      const panel=document.createElement('section'); panel.id='final-panel'; panel.className='receipt';
      const heading=text('h3','Agora salve o arquivo final no LIAC'); heading.tabIndex=-1; panel.append(heading);
      paragraph(panel,'Copie o bloco abaixo, cole no terminal LIAC e pressione Enter. Ele grava entrega-'+active+'.txt na sua pasta ~/atividades/aoc-cache-fisica. Se esse arquivo já existir, será atualizado com esta versão.');
      command(panel,prepared[active].command);
      paragraph(panel,'Confira a mensagem “Arquivo final salvo” e o caminho mostrado no terminal. Para reler, use cat ~/atividades/aoc-cache-fisica/entrega-'+active+'.txt. Guarde esse arquivo e siga o procedimento de entrega já utilizado pela turma no LIAC.');
      paragraph(panel,'Preparar os comandos ou baixar o texto nesta página não confirma recebimento pelo professor. Você ainda pode revisar suas respostas e preparar novamente o arquivo final.');
      const download=text('button','Baixar arquivo final (.txt)'); download.id='download-final'; download.type='button'; download.className='secondary'; download.addEventListener('click',()=>downloadText(prepared[active].content,'entrega-'+active+'.txt')); panel.append(download); parent.append(panel);
    }
  }
  const rubric=$('#rubric'); rubric.replaceChildren(); const list=document.createElement('ul');
  for(const [score,description] of a.rubric) list.append(text('li',score+': '+description)); rubric.append(list);
  $('#previous').disabled=steps.indexOf(s.step)===0;
  $('#next').disabled=s.step==='revisar';
  status(); ratio();
}
function review() {const a=activities[active],s=state[active];return a.title+'\n\n'+a.keys.map(k=>fields[k][0]+'\n'+(s.answers[k]||'(não preenchido)')).join('\n\n');}
function downloadText(content, filename) {
  const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function validate(keys) {
  const s=state[active];
  for(const k of keys) {
    if(!(s.answers[k]||'').trim()) return 'Preencha: '+fields[k][0];
    if(k.startsWith('mediana_')) {const value=Number(s.answers[k].replace(',','.'));if(!Number.isFinite(value)||value<=0||value>=1e9)return 'Informe uma mediana positiva em milissegundos.';}
  }
  return '';
}
function go(step, check=false) {
  const s=state[active];
  if(check) {const problem=validate(activities[active].required[s.step]||[]);if(problem){message(problem,true);return;}}
  s.step=step; s.dirty=true; save();
  message('');render();$('.step-heading').focus();
}
function openPrepare() {
  const problem=validate(activities[active].keys.filter(k=>k!=='previsao'));
  if(problem){message(problem,true);return;}
  $('#review-text').textContent=review();$('#confirm').showModal();
}
function prepareFinal() {
  const content = 'VERSÃO FINAL — AOC · UNIDADE 4\n' +
    'Prof. Me. Juvenal Silva Neto · UNEMAT · Campus de Alto Araguaia\n' +
    'Preparada em: ' + new Date().toISOString() + '\n\n' + review();
  prepared[active]={content, command:window.AOC_RELATORIO.comando(content,active)};
  save(); $('#confirm').close(); render();
  message('Comandos preparados. Cole-os no terminal para salvar o arquivo final na sua pasta do LIAC.');
  $('#final-panel h3').focus();
}
document.querySelectorAll('[data-activity]').forEach(button=>button.addEventListener('click',()=>{active=button.dataset.activity;save();message('');render();}));
$('#step').addEventListener('change',event=>go(event.target.value));
$('#previous').addEventListener('click',()=>go(steps[steps.indexOf(state[active].step)-1]));
$('#next').addEventListener('click',()=>go(steps[steps.indexOf(state[active].step)+1],true));
$('#save').addEventListener('click',()=>{if(save())message('Respostas e etapa salvas neste navegador.');else message('Não foi possível salvar no navegador. Baixe suas respostas e guarde o texto no LIAC.',true);});
$('#backup').addEventListener('click',()=>{
  downloadText('RESPOSTAS EM ELABORAÇÃO — NÃO É VERSÃO FINAL\n\n'+review(),'aoc-cache-'+active+'-respostas.txt');
  message('Respostas baixadas no aparelho em que você abriu a página. Para a entrega, prepare o arquivo final e salve-o no LIAC.');
});
$('#cancel-prepare').addEventListener('click',()=>$('#confirm').close());$('#confirm-prepare').addEventListener('click',prepareFinal);
window.addEventListener('beforeunload',event=>{if(Object.values(state).some(s=>s.dirty)){event.preventDefault();event.returnValue='';}});
render();
