(() => {
  const key = 'so-atividade-' + document.body.dataset.unit + '-v1';
  const boxes = [...document.querySelectorAll('[data-step]')];
  const fields = [...document.querySelectorAll('textarea')];
  const status = document.querySelector('#save-status');
  let state = {};
  try { state = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) {}
  const update = () => {
    const n = boxes.filter(b => b.checked).length;
    const progress = document.querySelector('progress');
    if (progress) { progress.max = boxes.length; progress.value = n; }
    const count = document.querySelector('#progress-count');
    if (count) count.textContent = `${n}/${boxes.length} etapas`;
  };
  for (const b of boxes) b.checked = state[b.id] === true;
  for (const f of fields) f.value = typeof state[f.id] === 'string' ? state[f.id] : '';
  const save = () => {
    state = Object.fromEntries([...boxes.map(b => [b.id, b.checked]), ...fields.map(f => [f.id, f.value])]);
    try { localStorage.setItem(key, JSON.stringify(state)); if (status) status.textContent = 'Respostas salvas neste navegador.'; }
    catch (_) { if (status) status.textContent = 'O navegador não permite salvar. Baixe suas respostas antes de sair.'; }
    update();
  };
  boxes.forEach(b => b.addEventListener('change', save));
  fields.forEach(f => f.addEventListener('input', save));
  update();
  document.querySelectorAll('.copy').forEach(button => button.addEventListener('click', async () => {
    const code = button.closest('.command').querySelector('code').textContent;
    try { await navigator.clipboard.writeText(code); button.textContent = 'Copiado'; }
    catch (_) { const range = document.createRange(); range.selectNodeContents(button.closest('.command').querySelector('code')); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); button.textContent = 'Selecione e copie'; }
    setTimeout(() => { button.textContent = 'Copiar'; }, 2500);
  }));
  document.querySelector('#download-answers')?.addEventListener('click', () => {
    const text = [document.title, 'Nome: ____________________', ...fields.map(f => document.querySelector(`label[for="${f.id}"]`).textContent + '\n' + (f.value || '[sem resposta]'))].join('\n\n');
    const url = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = `so-atividade-${document.body.dataset.unit}-respostas.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.querySelector('#theme')?.addEventListener('click', () => {
    const dark = getComputedStyle(document.documentElement).colorScheme === 'dark';
    document.documentElement.dataset.theme = dark ? 'light' : 'dark';
    document.querySelector('#theme').setAttribute('aria-pressed', String(!dark));
  });
})();
