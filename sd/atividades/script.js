(() => {
  const unidade = document.body.dataset.unit;
  const chave = 'sd-atividade-' + unidade + '-v1';
  const campos = [...document.querySelectorAll('textarea, input[id]:not([type="checkbox"])')];
  const caixas = [...document.querySelectorAll('input[type="checkbox"][id]')];
  const status = document.querySelector('#save-status');
  let estado = {};
  try { estado = JSON.parse(localStorage.getItem(chave) || '{}') || {}; } catch (_) {}
  for (const c of campos) if (typeof estado[c.id] === 'string') c.value = estado[c.id];
  for (const c of caixas) c.checked = estado[c.id] === true;

  const rotulo = (el) => {
    if (el.dataset.entrega) return el.dataset.entrega;
    const l = document.querySelector(`label[for="${el.id}"]`);
    return l ? l.textContent.trim() : (el.getAttribute('aria-label') || el.id);
  };
  const valor = (id) => (document.getElementById(id)?.value || '').trim();
  const perguntas = [...document.querySelectorAll('textarea[data-entrega]')];
  const tabela = [...document.querySelectorAll('[data-tabela]')];

  // Lista do que falta: a mesma regra vale para o aviso e para o botão.
  const pendencias = () => {
    const falta = [];
    if (!valor('nome')) falta.push('Nome completo');
    if (!valor('matricula')) falta.push('Matrícula');
    if (!valor('evidencias') && !document.getElementById('evid-captura')?.checked)
      falta.push('Evidências (cole a saída ou marque a opção da captura)');
    if (tabela.some(c => !/^\d+$/.test(c.value.trim()))) falta.push('Tabela de mensagens (todos os números)');
    perguntas.forEach((p, i) => { if (!p.value.trim()) falta.push(`Pergunta ${i + 1}`); });
    return falta;
  };
  const lista = document.querySelector('#situacao');
  const atualizar = () => {
    if (!lista) return;
    const falta = pendencias();
    const itens = ['Identificação', 'Evidências', 'Tabela de mensagens', ...perguntas.map((_, i) => `Pergunta ${i + 1}`)];
    lista.replaceChildren(...itens.map(item => {
      const li = document.createElement('li');
      const pendente = falta.some(f => f.startsWith(item) || (item === 'Identificação' && (f === 'Nome completo' || f === 'Matrícula')));
      li.className = pendente ? 'pendente' : 'ok';
      li.textContent = (pendente ? 'Falta: ' : 'Pronto: ') + item;
      return li;
    }));
  };
  const salvar = () => {
    estado = Object.fromEntries([...campos.map(c => [c.id, c.value]), ...caixas.map(c => [c.id, c.checked])]);
    try { localStorage.setItem(chave, JSON.stringify(estado)); if (status) status.textContent = 'Salvo neste navegador. Nada é enviado automaticamente.'; }
    catch (_) { if (status) status.textContent = 'Este navegador não permite salvar: gere o arquivo antes de sair.'; }
    atualizar();
  };
  [...campos, ...caixas].forEach(c => c.addEventListener(c.type === 'checkbox' ? 'change' : 'input', salvar));
  atualizar();

  document.querySelectorAll('.copy').forEach(botao => botao.addEventListener('click', async () => {
    const code = botao.closest('.command').querySelector('code');
    try { await navigator.clipboard.writeText(code.textContent); botao.textContent = 'Copiado'; }
    catch (_) { const r = document.createRange(); r.selectNodeContents(code); const s = getSelection(); s.removeAllRanges(); s.addRange(r); botao.textContent = 'Selecione e copie'; }
    setTimeout(() => { botao.textContent = 'Copiar'; }, 2500);
  }));

  const nomeArquivo = (nome) => {
    const base = nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'aluno';
    return `P05_SD_${base}.txt`;
  };
  document.querySelector('#gerar-entrega')?.addEventListener('click', () => {
    const aviso = document.querySelector('#gerar-status');
    const falta = pendencias();
    if (falta.length) {
      aviso.textContent = 'Ainda falta: ' + falta.join('; ') + '.';
      aviso.className = 'status pendente';
      return;
    }
    const linha = '='.repeat(40);
    const celula = (id) => valor(id).padStart(5);
    const evid = valor('evidencias') || '[enviada em captura de tela anexa]';
    const texto = [
      'P05 - Uma mensagem para todos',
      'Sistemas Distribuídos - UNEMAT, Campus de Alto Araguaia',
      `Nome: ${valor('nome')}`,
      `Matrícula: ${valor('matricula')}`,
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      linha, '1) EVIDÊNCIAS (python3 p05.py evidencias)', evid,
      linha, '2) TABELA DE MENSAGENS',
      'Situação       Dest  Dados  Conf.  Total',
      `Unicast           1 ${celula('t1-dados')}  ${celula('t1-conf')}  ${celula('t1-total')}`,
      `Difusão           3 ${celula('t3-dados')}  ${celula('t3-conf')}  ${celula('t3-total')}`,
      `Difusão           6 ${celula('t6-dados')}  ${celula('t6-conf')}  ${celula('t6-total')}`,
      linha, '3) RESPOSTAS',
      ...perguntas.map(p => `${rotulo(p)}\n${p.value.trim()}\n`)
    ].join('\n');
    const url = URL.createObjectURL(new Blob([texto + '\n'], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = nomeArquivo(valor('nome')); a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    aviso.textContent = `Arquivo ${a.download} gerado. Envie-o` +
      (document.getElementById('evid-captura')?.checked ? ' junto com a captura de tela.' : '.');
    aviso.className = 'status ok';
  });

  document.querySelector('#theme')?.addEventListener('click', () => {
    const escuro = getComputedStyle(document.documentElement).colorScheme === 'dark';
    document.documentElement.dataset.theme = escuro ? 'light' : 'dark';
    document.querySelector('#theme').setAttribute('aria-pressed', String(!escuro));
  });
})();
