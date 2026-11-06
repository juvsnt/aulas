/* Gera um arquivo de texto por colagem, sem rede nem execucao das respostas. */
(function (root) {
  'use strict';
  function comando(conteudo, atividade) {
    if (!['matriz', 'cadeia'].includes(atividade) || typeof conteudo !== 'string') {
      throw new Error('Atividade ou conteúdo inválido.');
    }
    // O delimitador deve ser diferente de qualquer linha escrita pelo aluno.
    let fim = 'FIM_ENTREGA_AOC';
    const linhas = conteudo.split(/\r?\n/);
    while (linhas.includes(fim)) fim += '_X';
    const nome = 'entrega-' + atividade + '.txt';
    return 'mkdir -p ~/atividades/aoc-cache-fisica &&\n' +
      'cd ~/atividades/aoc-cache-fisica &&\n' +
      "if cat > " + nome + " <<'" + fim + "'\n" + conteudo + '\n' + fim + '\n' +
      'then\n' +
      "  printf 'Arquivo final salvo na sua pasta do LIAC:\\n'\n" +
      "  printf '%s/" + nome + "\\n' \"$PWD\"\n" +
      '  ls -l ' + nome + '\n' +
      'else\n' +
      "  printf 'Não foi possível salvar. Guarde suas respostas e avise o professor.\\n' >&2\n" +
      '  false\n' +
      'fi';
  }
  const api = {comando};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AOC_RELATORIO = api;
})(typeof window !== 'undefined' ? window : globalThis);
