"""Gera unXX/index.html a partir de unXX/pagina.modelo.html.
Ferramenta de manutencao docente; os alunos usam somente C e Bash.
Uso: python3 construir.py un02

Diretivas do modelo (cada uma no inicio de uma linha):
  @@CMD titulo        ... @@END   bloco de terminal com botao Copiar
  @@OUT [rotulo]      ... @@END   referencia para comparacao
  @@SRC arquivo                   fonte de arquivos/ em bloco recolhivel (cat > ... <<'FIM')
  @@Q id | rotulo [| dica]        pergunta com campo de resposta (dica opcional)
  @@DONE n | texto                caixa de etapa concluida
  @@CODE arquivo                  codigo de arquivos/ para colar num editor (nao e comando)
  @@SLIDE tNN n (dentro do texto) link para a pagina n de materiais/pdfs/unXXtNN.pdf
A partir da un04, todo bloco termina com '# fim do bloco': o terminal web do
LIAC pode grudar um '~' na ultima linha colada, e o comentario o absorve.
O texto fora das diretivas e copiado sem alteracao. Os comandos e fontes
sao escapados aqui, para nunca divergirem dos arquivos em arquivos/.
"""
from html import escape
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent
FIM_BLOCO = '# fim do bloco'
COM_FIM_BLOCO = {'un04', 'un04-codigo'}   # un02 e un03 publicadas sem a linha; mudar so a pedido
unidade_atual = ''


def comando(titulo, texto):
    if unidade_atual in COM_FIM_BLOCO:
        texto = texto + '\n' + FIM_BLOCO
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


def codigo(pasta, nome):
    """Codigo C para o aluno colar no editor nano: separado dos comandos."""
    conteudo = (pasta / 'arquivos' / nome).read_text().rstrip('\n')
    rotulo = escape(f'Código de {nome} · copie e cole no nano')
    return ('<div class="command codigo"><div class="command-head"><span>' + rotulo +
            '</span><button class="copy" type="button" aria-label="Copiar o código de ' + escape(nome) +
            '">Copiar</button></div><pre tabindex="0"><code class="codigo-c">' + escape(conteudo) +
            '</code></pre></div>')


def slide(texto):
    """@@SLIDE t03 14 vira link para a pagina 14 de ../../materiais/pdfs/unXXt03.pdf."""
    return re.sub(r'@@SLIDE (t\d\d) (\d+)',
                  lambda m: f'<a href="../../materiais/pdfs/{unidade_atual[:4]}{m.group(1)}.pdf#page={m.group(2)}" '
                            f'target="_blank" rel="noopener">{m.group(1)}, slide {m.group(2)}</a>', texto)


def construir(unidade):
    global unidade_atual
    unidade_atual = unidade
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
        elif linha.startswith('@@CODE '):
            saida_html.append(codigo(pasta, linha.split()[1]))
        elif linha.startswith('@@SRC '):
            saida_html.append(fonte(pasta, linha.split()[1]))
        elif linha.startswith('@@Q '):
            ident, _, resto = linha[4:].partition('|')
            rotulo, _, dica = resto.partition('|')
            ident, rotulo = ident.strip(), slide(rotulo.strip())
            dica = escape(dica.strip() or 'Hipótese, evidência, interpretação e limites.')
            saida_html.append(f'<div class="question"><label for="{ident}">{rotulo}</label>'
                              f'<textarea id="{ident}" placeholder="{dica}"></textarea></div>')
        elif linha.startswith('@@DONE '):
            num, _, texto = linha[7:].partition('|')
            saida_html.append(f'<label class="done"><input type="checkbox" id="feito-{num.strip()}" '
                              f'data-step="{num.strip()}">{texto.strip()}</label>')
        elif linha.startswith('@@'):
            raise SystemExit(f'Diretiva desconhecida na linha {i + 1}: {linha}')
        else:
            saida_html.append(slide(linha))
        i += 1
    (pasta / 'index.html').write_text('\n'.join(saida_html) + '\n')
    print(f'{unidade}/index.html gerado')


if __name__ == '__main__':
    construir(sys.argv[1] if len(sys.argv) > 1 else 'un02')
