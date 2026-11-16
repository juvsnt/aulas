/* Atividade da Unidade 5 de AOC: salva respostas no navegador e prepara o
   bloco de comandos que grava o arquivo final na pasta do aluno no LIAC.
   Nada e enviado pela rede. */
(function (root) {
  'use strict';

  const PASTA = '~/atividades/aoc-entrada-saida';
  const ARQUIVO = 'entrega-es.txt';

  /* Bloco Bash que grava o texto. O delimitador nunca coincide com uma
     linha escrita pelo aluno, e as aspas impedem a expansao do conteudo. */
  function comandoEntrega(conteudo) {
    if (typeof conteudo !== 'string') throw new Error('Conteúdo inválido.');
    const linhas = conteudo.split(/\r?\n/);
    let fim = 'FIM_ENTREGA_AOC';
    while (linhas.includes(fim)) fim += '_X';
    return 'mkdir -p ' + PASTA + ' &&\n' +
      'cd ' + PASTA + ' &&\n' +
      "if cat > " + ARQUIVO + " <<'" + fim + "'\n" + linhas.join('\n') + '\n' + fim + '\n' +
      'then\n' +
      "  printf 'Arquivo final salvo na sua pasta do LIAC:\\n%s/" + ARQUIVO + "\\n' \"$PWD\"\n" +
      '  ls -l ' + ARQUIVO + '\n' +
      'else\n' +
      "  printf 'Nao foi possivel salvar. Baixe suas respostas e avise o professor.\\n' >&2\n" +
      '  false\n' +
      'fi\n' +
      '# fim do bloco';   /* o terminal pode grudar "~" aqui; e so comentario */
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {comandoEntrega};
    return;
  }

  const doc = root.document;
  const key = 'aoc-atividade-' + doc.body.dataset.unit + '-v1';
  const boxes = [...doc.querySelectorAll('[data-step]')];
  const fields = [...doc.querySelectorAll('textarea')];
  const status = doc.querySelector('#save-status');
  let state = {};
  try { state = JSON.parse(root.localStorage.getItem(key) || '{}') || {}; } catch (_) { state = {}; }

  const update = () => {
    const n = boxes.filter(b => b.checked).length;
    const progress = doc.querySelector('progress');
    if (progress) { progress.max = boxes.length; progress.value = n; }
    const count = doc.querySelector('#progress-count');
    if (count) count.textContent = n + '/' + boxes.length + ' etapas';
  };
  for (const b of boxes) b.checked = state[b.id] === true;
  for (const f of fields) f.value = typeof state[f.id] === 'string' ? state[f.id] : '';

  const save = () => {
    state = Object.fromEntries([...boxes.map(b => [b.id, b.checked]), ...fields.map(f => [f.id, f.value])]);
    try {
      root.localStorage.setItem(key, JSON.stringify(state));
      if (status) status.textContent = 'Respostas salvas neste navegador.';
    } catch (_) {
      if (status) status.textContent = 'O navegador não permite salvar. Baixe suas respostas antes de sair.';
    }
    update();
    const bloco = doc.querySelector('#entrega-comando');
    if (bloco && !bloco.hidden) {
      bloco.hidden = true;   /* resposta mudou: o bloco antigo ficou desatualizado */
      const aviso = doc.querySelector('#preparar');
      if (aviso) aviso.textContent = 'Preparar arquivo final (respostas mudaram)';
    }
  };
  boxes.forEach(b => b.addEventListener('change', save));
  fields.forEach(f => f.addEventListener('input', save));
  update();

  const texto = () => {
    const rotulo = f => {
      const label = doc.querySelector('label[for="' + f.id + '"]');
      return (label ? label.textContent : f.id).replace(/\s+/g, ' ').trim();
    };
    return [
      doc.title,
      'Gerado em: ' + new Date().toLocaleString('pt-BR'),
      ...fields.map(f => '## ' + rotulo(f) + '\n' + (f.value.trim() || '[sem resposta]'))
    ].join('\n\n');
  };

  doc.addEventListener('click', async event => {
    const button = event.target.closest('.copy');
    if (!button) return;
    const code = button.closest('.command').querySelector('code');
    try { await root.navigator.clipboard.writeText(code.textContent); button.textContent = 'Copiado'; }
    catch (_) {
      const range = doc.createRange(); range.selectNodeContents(code);
      const sel = root.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      button.textContent = 'Selecione e copie';
    }
    setTimeout(() => { button.textContent = 'Copiar'; }, 2500);
  });

  doc.querySelector('#preparar')?.addEventListener('click', event => {
    const vazias = fields.filter(f => !f.value.trim() && !f.id.endsWith('previsao')).length;
    if (vazias && !root.confirm(vazias + ' resposta(s) ainda em branco. Preparar mesmo assim?')) return;
    doc.querySelector('#entrega-codigo').textContent = comandoEntrega(texto());
    doc.querySelector('#entrega-comando').hidden = false;
    event.target.textContent = 'Preparar arquivo final';
  });

  doc.querySelector('#download-answers')?.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([texto() + '\n'], {type: 'text/plain;charset=utf-8'}));
    const a = doc.createElement('a');
    a.href = url; a.download = 'aoc-un05-respostas.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  doc.querySelector('#theme')?.addEventListener('click', () => {
    const dark = root.getComputedStyle(doc.documentElement).colorScheme === 'dark';
    doc.documentElement.dataset.theme = dark ? 'light' : 'dark';
    doc.querySelector('#theme').setAttribute('aria-pressed', String(!dark));
  });
})(typeof window !== 'undefined' ? window : globalThis);
