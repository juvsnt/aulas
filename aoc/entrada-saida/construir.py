#!/usr/bin/env python3
"""Gera public/index.html a partir de pagina.modelo.html.
Ferramenta de manutencao docente; os alunos usam somente C e Bash.
Uso: python3 aoc/entrada-saida/construir.py

Diretivas do modelo (cada uma no inicio de uma linha):
  @@CMD titulo        ... @@END   bloco de terminal com botao Copiar
  @@OUT [rotulo]      ... @@END   referencia para comparacao
  @@SRC arquivo                   fonte de public/arquivos/ em bloco recolhivel
  @@Q id | rotulo [| dica]        pergunta com campo de resposta
  @@DONE n | texto                caixa de etapa concluida
  @@SLIDE n                       link para a pagina n do PDF da unidade
Os comandos e fontes sao escapados aqui, para nunca divergirem dos arquivos.
"""
from html import escape
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / 'public'
PDF = '../../materiais/pdfs/un05t01.pdf'


def comando(titulo, texto):
    rotulo = escape(titulo or 'Cole no terminal')
    return ('<div class="command"><div class="command-head"><span>' + rotulo +
            '</span><button class="copy" type="button" aria-label="Copiar: ' + rotulo +
            '">Copiar</button></div><pre tabindex="0"><code>' + escape(texto) +
            '</code></pre></div>')


def saida(rotulo, texto):
    rotulo = rotulo or 'Exemplo · os seus números serão diferentes'
    return ('<div class="expected"><div class="expected-label">' + escape(rotulo) +
            '</div><pre tabindex="0">' + escape(texto) + '</pre></div>')


def fonte(nome):
    conteudo = (PUBLIC / 'arquivos' / nome).read_text()
    if 'FIM\n' in conteudo.splitlines(keepends=True):
        raise SystemExit(f'{nome} contem uma linha FIM; o heredoc quebraria.')
    bloco = f"cat > {nome} <<'FIM'\n{conteudo}FIM"
    return ('<details><summary>Criar <code>' + escape(nome) + '</code></summary><div>' +
            comando(f'Cole no terminal para criar {nome}', bloco) + '</div></details>')


def slide(texto):
    """@@SLIDE n dentro do texto vira link para a pagina n do PDF."""
    return re.sub(r'@@SLIDE (\d+)', lambda m: f'<a href="{PDF}#page={m.group(1)}" target="_blank" '
                  f'rel="noopener">slide {m.group(1)}</a>', texto)


def construir():
    linhas = (ROOT / 'pagina.modelo.html').read_text().splitlines()
    html, ids, i = [], [], 0
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
            html.append(comando(titulo, texto) if tipo == '@@CMD' else saida(titulo, texto))
        elif linha.startswith('@@SRC '):
            html.append(fonte(linha.split()[1]))
        elif linha.startswith('@@Q '):
            ident, _, resto = linha[4:].partition('|')
            rotulo, _, dica = resto.partition('|')
            ident, rotulo = ident.strip(), slide(rotulo.strip())
            if ident in ids:
                raise SystemExit(f'Pergunta repetida: {ident}')
            ids.append(ident)
            dica = escape(dica.strip() or 'Responda com suas palavras.')
            html.append(f'<div class="question"><label for="{ident}">{rotulo}</label>'
                        f'<textarea id="{ident}" placeholder="{dica}"></textarea></div>')
        elif linha.startswith('@@DONE '):
            num, _, texto = linha[7:].partition('|')
            html.append(f'<label class="done"><input type="checkbox" id="feito-{num.strip()}" '
                        f'data-step="{num.strip()}">{texto.strip()}</label>')
        elif linha.startswith('@@') :
            raise SystemExit(f'Diretiva desconhecida na linha {i + 1}: {linha}')
        else:
            html.append(slide(linha))
        i += 1
    (PUBLIC / 'index.html').write_text('\n'.join(html) + '\n')
    print(f'public/index.html gerado ({len(ids)} perguntas)')


if __name__ == '__main__':
    construir()
