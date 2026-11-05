"""Gera <atividade>/index.html a partir de <atividade>/pagina.modelo.html.
Ferramenta de manutencao docente. Uso: python3 -I construir.py p05-difusao

Diretivas do modelo (cada uma no inicio de uma linha):
  @@CMD titulo            ... @@END  comando em azul com "$ " e botao Copiar
  @@OUT exata|aprox rotulo ... @@END saida esperada (exata ou aproximada)
  @@SRC arquivo                      arquivo de arquivos/ em here-document recolhivel
  @@ENTREGA id | rotulo              pergunta que entra no arquivo de entrega
  @@PENSAR texto                     pergunta para pensar (nao entra na entrega)
O texto fora das diretivas e copiado sem alteracao.
"""
from html import escape
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent


def linhas(texto):
    """Comandos ganham o prompt visual "$ " (CSS); corpo de here-document nao."""
    out, fim = [], None
    for ln in texto.split('\n'):
        if fim is not None:
            cls = 'heredoc'
            if ln == fim:
                fim = None
        else:
            cls = 'cmd' if ln.strip() else 'vazia'
            m = re.search(r"<<\s*'?(\w+)'?\s*$", ln)
            if m:
                fim = m.group(1)
        out.append(f'<span class="{cls}">{escape(ln)}</span>')
    return '\n'.join(out)


def comando(titulo, texto):
    rotulo = escape(titulo or 'Execute no terminal')
    return ('<div class="command"><div class="command-head"><span>' + rotulo +
            '</span><button class="copy" type="button" aria-label="Copiar: ' + rotulo +
            '">Copiar</button></div><pre tabindex="0"><code>' + linhas(texto) +
            '</code></pre></div>')


def saida(tipo, rotulo, texto):
    padrao = {'exata': 'Saída esperada',
              'aprox': 'Saída esperada · os tempos podem variar um pouco'}[tipo]
    return (f'<div class="expected saida-{tipo}"><div class="expected-label">' +
            escape(rotulo or padrao) + '</div><pre tabindex="0">' + escape(texto) +
            '</pre></div>')


def fonte(pasta, nome):
    conteudo = (pasta / 'arquivos' / nome).read_text(encoding='utf-8')
    if 'FIM\n' in conteudo.splitlines(keepends=True):
        raise SystemExit(f'{nome} contem uma linha FIM; o here-document quebraria.')
    bloco = f"cat > {nome} <<'FIM'\n{conteudo}FIM"
    return ('<details class="source"><summary>Plano B: criar <code>' + escape(nome) +
            '</code> colando o código</summary>' +
            comando(f'Cole no terminal para criar {nome}', bloco) + '</details>')


def entrega(ident, rotulo):
    num = re.search(r'\d+', ident)
    tag = f'ENTREGA · Pergunta {num.group()}' if num else 'ENTREGA'
    return (f'<div class="question entrega"><span class="tag-entrega">{tag}</span>'
            f'<label for="{ident}">{escape(rotulo)}</label>'
            f'<textarea id="{ident}" data-entrega="{escape(rotulo)}" required '
            f'placeholder="Responda com suas palavras e cite o que a saída mostrou."></textarea></div>')


def construir(atividade):
    pasta = ROOT / atividade
    linhas_modelo = (pasta / 'pagina.modelo.html').read_text(encoding='utf-8').splitlines()
    html, i = [], 0
    while i < len(linhas_modelo):
        linha = linhas_modelo[i]
        if linha.startswith(('@@CMD', '@@OUT')):
            partes = linha.split(' ', 2) + ['', '']
            corpo = []
            i += 1
            while linhas_modelo[i] != '@@END':
                corpo.append(linhas_modelo[i])
                i += 1
            texto = '\n'.join(corpo)
            if partes[0] == '@@CMD':
                html.append(comando(linha[6:].strip(), texto))
            else:
                html.append(saida(partes[1], partes[2].strip(), texto))
        elif linha.startswith('@@SRC '):
            html.append(fonte(pasta, linha.split()[1]))
        elif linha.startswith('@@ENTREGA '):
            ident, _, rotulo = linha[10:].partition('|')
            html.append(entrega(ident.strip(), rotulo.strip()))
        elif linha.startswith('@@PENSAR '):
            html.append('<p class="pensar"><span class="tag-pensar">Para pensar · não entra '
                        'na entrega</span> ' + escape(linha[9:].strip()) + '</p>')
        elif linha.startswith('@@'):
            raise SystemExit(f'Diretiva desconhecida na linha {i + 1}: {linha}')
        else:
            html.append(linha)
        i += 1
    (pasta / 'index.html').write_text('\n'.join(html) + '\n', encoding='utf-8')
    print(f'{atividade}/index.html gerado')


if __name__ == '__main__':
    construir(sys.argv[1] if len(sys.argv) > 1 else 'p05-difusao')
