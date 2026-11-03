"""Gera unXX/index.html a partir de unXX/pagina.modelo.html.
Ferramenta de manutencao docente; os alunos usam somente C e Bash.
Uso: python3 construir.py un02

Diretivas do modelo (cada uma no inicio de uma linha):
  @@CMD titulo        ... @@END   bloco de terminal com botao Copiar
  @@OUT [rotulo]      ... @@END   referencia para comparacao
  @@SRC arquivo                   fonte de arquivos/ em bloco recolhivel (cat > ... <<'FIM')
  @@Q id | rotulo                 pergunta com campo de resposta
  @@DONE n | texto                caixa de etapa concluida
O texto fora das diretivas e copiado sem alteracao. Os comandos e fontes
sao escapados aqui, para nunca divergirem dos arquivos em arquivos/.
"""
from html import escape
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent


def comando(titulo, texto):
    rotulo = escape(titulo or 'Execute no terminal')
    return ('<div class="command"><div class="command-head"><span>' + rotulo +
            '</span><button class="copy" type="button" aria-label="Copiar: ' + rotulo +
            '">Copiar</button></div><pre tabindex="0"><code>' + escape(texto) +
            '</code></pre></div>')


def saida(rotulo, texto):
    rotulo = rotulo or 'Referência para comparação · confira após prever'
    return ('<div class="expected"><div class="expected-label">' + escape(rotulo) +
            '</div><pre tabindex="0">' + escape(texto) + '</pre></div>')


def fonte(pasta, nome):
    conteudo = (pasta / 'arquivos' / nome).read_text()
    if 'FIM\n' in conteudo.splitlines(keepends=True):
        raise SystemExit(f'{nome} contem uma linha FIM; o heredoc quebraria.')
    bloco = f"cat > {nome} <<'FIM'\n{conteudo}FIM"
    return ('<details><summary>Criar <code>' + escape(nome) + '</code></summary><div>' +
            comando(f'Cole no terminal para criar {nome}', bloco) + '</div></details>')


def construir(unidade):
    pasta = ROOT / unidade
    linhas = (pasta / 'pagina.modelo.html').read_text().splitlines()
    saida_html, i = [], 0
    while i < len(linhas):
        linha = linhas[i]
        if linha.startswith(('@@CMD', '@@OUT')):
            tipo, _, titulo = linha.partition(' ')
            corpo = []
            i += 1
            while linhas[i] != '@@END':
                corpo.append(linhas[i])
                i += 1
            texto = '\n'.join(corpo)
            saida_html.append(comando(titulo, texto) if tipo == '@@CMD' else saida(titulo, texto))
        elif linha.startswith('@@SRC '):
            saida_html.append(fonte(pasta, linha.split()[1]))
        elif linha.startswith('@@Q '):
            ident, _, rotulo = linha[4:].partition('|')
            ident, rotulo = ident.strip(), rotulo.strip()
            saida_html.append(f'<div class="question"><label for="{ident}">{rotulo}</label>'
                              f'<textarea id="{ident}" placeholder="Hipótese, evidência, '
                              f'interpretação e limites."></textarea></div>')
        elif linha.startswith('@@DONE '):
            num, _, texto = linha[7:].partition('|')
            saida_html.append(f'<label class="done"><input type="checkbox" id="feito-{num.strip()}" '
                              f'data-step="{num.strip()}">{texto.strip()}</label>')
        elif linha.startswith('@@'):
            raise SystemExit(f'Diretiva desconhecida na linha {i + 1}: {linha}')
        else:
            saida_html.append(linha)
        i += 1
    (pasta / 'index.html').write_text('\n'.join(saida_html) + '\n')
    print(f'{unidade}/index.html gerado')


if __name__ == '__main__':
    construir(sys.argv[1] if len(sys.argv) > 1 else 'un02')
