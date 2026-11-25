"""Confere uma atividade de SD: pagina gerada, IDs/rotulos/links e TODOS os
comandos da pagina, executados na ordem em uma pasta HOME temporaria, com as
saidas comparadas as exibidas. Uso: python3 -I verificar.py p05-difusao
                                       python3 -I verificar.py p06-estoque
Na P06 (modelo misto), "nano" nao e executado: o @@CODE grava o arquivo,
como se o aluno tivesse colado no editor. Saidas "exemplo" sao comparadas
com as linhas ordenadas, sem avisos de job ([1] 4310, Done), com Ana/Beto
trocados por X e tempos arredondados a 0,1 s.
Manutencao docente; nao acessa o LIAC.
"""
from html.parser import HTMLParser
from pathlib import Path
import os
import re
import subprocess
import sys
import tempfile
import time

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[1]


class Pagina(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.rotulos, self.campos, self.links = [], set(), [], []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.append(a['id'])
        if tag == 'label' and 'for' in a:
            self.rotulos.add(a['for'])
        if tag in ('textarea', 'input') and a.get('type') != 'checkbox':
            self.campos.append((a.get('id'), a.get('aria-label')))
        if tag in ('a', 'link', 'script'):
            destino = a.get('href', a.get('src'))
            if destino:
                self.links.append(destino)


def blocos(modelo):
    """Sequencia de ('cmd', texto) e ('out', tipo, texto) na ordem da pagina."""
    linhas, i, seq = modelo.splitlines(), 0, []
    while i < len(linhas):
        if linhas[i].startswith(('@@CMD', '@@OUT')):
            cabeca = linhas[i]
            corpo = []
            i += 1
            while linhas[i] != '@@END':
                corpo.append(linhas[i])
                i += 1
            texto = '\n'.join(corpo)
            seq.append(('cmd', texto) if cabeca.startswith('@@CMD') else ('out', cabeca.split()[1], texto))
        elif linhas[i].startswith('@@CODE '):
            seq.append(('code', linhas[i].split()[1]))
        i += 1
    return seq


def normalizar(texto, tipo):
    if tipo == 'aprox':
        texto = re.sub(r'\d+,\d s\)', 'T s)', texto)
        texto = re.sub(r'\d\d/\d\d/\d{4} \d\d:\d\d', 'DATA', texto)
    return texto.rstrip('\n')


def normalizar_p06(texto, tipo):
    linhas = [re.sub(r'[ \t]+', ' ', ln).rstrip() for ln in texto.splitlines()
              if ln.strip() and not re.match(r'^\[\d+\][+-]?\s', ln)]
    if tipo == 'exemplo':
        def tempo(m):
            seg = float(m.group(2).replace(',', '.'))
            return f'{m.group(1)}{round(int(m.group(1)[:-1] or 0) * 60 + seg, 1)}s'
        linhas = sorted(re.sub(r'(\d+m)(\d+[.,]\d+)s', tempo,
                               re.sub(r'\b(Ana|Beto)\b', 'X', ln)) for ln in linhas)
    return '\n'.join(linhas)


def main(atividade):
    pasta = ROOT / atividade
    subprocess.run([sys.executable, '-I', str(ROOT / 'construir.py'), atividade], check=True,
                   capture_output=True)
    html = (pasta / 'index.html').read_text(encoding='utf-8')
    p = Pagina()
    p.feed(html)
    assert len(p.ids) == len(set(p.ids)), 'IDs repetidos'
    for ident, aria in p.campos:
        assert ident in p.rotulos or aria, f'campo sem rotulo: {ident}'
    for link in p.links:
        if re.match(r'^(https?:|mailto:|#)', link):
            if link.startswith('#'):
                assert link[1:] in p.ids, link
            continue
        alvo = (pasta / link.split('#')[0]).resolve()
        if alvo.is_dir():
            alvo = alvo / 'index.html'
        # --sem-links: copia parcial (ex.: teste no LIAC) sem o resto do site
        assert alvo.exists() or '--sem-links' in sys.argv, f'link quebrado: {link}'
    print('Pagina gerada; IDs, rotulos e links conferidos.')
    if atividade == 'p06-estoque':
        return verificar_p06(pasta, html)
    assert 'cat &gt; p05.py' in html or 'cat > p05.py' in html, 'falta o Plano B (here-document)'

    # Plano B: o here-document da pagina recria o arquivo identico.
    with tempfile.TemporaryDirectory(prefix='sd-atv-src-') as tmp:
        src = (pasta / 'arquivos' / 'p05.py').read_text(encoding='utf-8')
        subprocess.run(['bash', '-c', f"cat > p05.py <<'FIM'\n{src}FIM\n"], cwd=tmp, check=True)
        assert (Path(tmp) / 'p05.py').read_text(encoding='utf-8') == src
    print('Plano B (colar o codigo) recria p05.py identico.')

    with tempfile.TemporaryDirectory(prefix='sd-atv-') as home:
        material = Path(home) / 'material' / 'sd'
        material.mkdir(parents=True)
        (material / 'p05.py').write_bytes((pasta / 'arquivos' / 'p05.py').read_bytes())
        env = {'HOME': home, 'PATH': os.environ['PATH'], 'LANG': 'C.UTF-8'}
        cwd = Path(home)
        anterior = None
        n_cmd = n_out = 0
        for b in blocos((pasta / 'pagina.modelo.html').read_text(encoding='utf-8')):
            if b[0] == 'cmd':
                # pwd do fim do bloco define a pasta do proximo, como no terminal
                script = b[1] + '\necho "@@PWD $PWD"'
                r = subprocess.run(['bash', '-e', '-c', script], cwd=cwd, env=env, text=True,
                                   capture_output=True, timeout=60)
                assert r.returncode == 0, f'comando falhou:\n{b[1]}\n{r.stdout}\n{r.stderr}'
                saida, _, fim = r.stdout.rpartition('@@PWD ')
                cwd = Path(fim.strip())
                anterior = (b[1], saida)
                n_cmd += 1
            else:
                _, tipo, esperado = b
                assert anterior, 'saida sem comando'
                comando, obtido = anterior
                if comando.strip().endswith('python3 --version'):
                    continue
                e, o = normalizar(esperado, tipo), normalizar(obtido, tipo)
                assert e == o, f'saida diferente para:\n{comando}\n--- pagina\n{e}\n--- obtida\n{o}'
                n_out += 1
        time.sleep(0.3)
        vivos = subprocess.run(['pgrep', '-u', str(os.getuid()), '-f', r'python3? .*p05\.py'],
                               capture_output=True, text=True).stdout
        assert not vivos.strip(), f'processos restantes: {vivos}'
        privada = Path(home) / 'atividades' / 'sd-p05' / '.p05'
        assert oct(privada.stat().st_mode & 0o777) == '0o700', 'pasta privada sem modo 700'
        assert not [x for x in privada.iterdir() if x.name.startswith('r')], 'rodada nao limpa'
    print(f'{n_cmd} blocos de comando executados; {n_out} saidas iguais as da pagina.')
    print('Nenhum processo restante; pasta privada 700; sockets removidos.')



def verificar_p06(pasta, html):
    from html import escape
    modelo = (pasta / 'pagina.modelo.html').read_text(encoding='utf-8')
    fontes = sorted(x.name for x in (pasta / 'arquivos').iterdir())
    for nome in fontes:
        src = (pasta / 'arquivos' / nome).read_text(encoding='utf-8')
        assert f'@@CODE {nome}' in modelo and f'@@SRC {nome}' in modelo, f'{nome} fora da pagina'
        assert escape(src.rstrip('\n')) in html, f'{nome}: codigo da pagina difere do arquivo'
        with tempfile.TemporaryDirectory(prefix='sd-atv-src-') as tmp:
            # Plano B como na pagina, com o '~' que o terminal web do LIAC pode grudar
            subprocess.run(['bash', '-c', f"cat > {nome} <<'FIM'\n{src}FIM\n# fim do bloco~\n"],
                           cwd=tmp, check=True)
            assert (Path(tmp) / nome).read_text(encoding='utf-8') == src, f'Plano B difere: {nome}'
    print(f'Codigo para o nano e Plano B identicos aos arquivos: {", ".join(fontes)}.')
    r = subprocess.run(['gcc', '-Wall', '-Wextra', str(pasta / 'arquivos' / 'compra.c'), '-o', '/dev/null'],
                       capture_output=True, text=True)
    assert r.returncode == 0 and not r.stderr, f'gcc com aviso:\n{r.stderr}'
    print('compra.c compila sem avisos (-Wall -Wextra).')

    with tempfile.TemporaryDirectory(prefix='sd-atv-') as home:
        env = {'HOME': home, 'PATH': os.environ['PATH'], 'LANG': 'C.UTF-8'}
        cwd = Path(home)
        anterior = None
        n_cmd = n_out = 0
        for b in blocos(modelo):
            if b[0] == 'code':
                (cwd / b[1]).write_text((pasta / 'arquivos' / b[1]).read_text(encoding='utf-8'),
                                        encoding='utf-8')
                continue
            if b[0] == 'cmd':
                linhas = [ln for ln in b[1].splitlines() if ln.strip()]
                assert len(linhas) == 1 and '#' in linhas[0], f'passo sem 1 linha com comentario: {b[1]}'
                if linhas[0].startswith('nano '):
                    continue
                script = b[1] + '\n# fim do bloco~\necho "@@PWD $PWD"'
                r = subprocess.run(['bash', '-c', script], cwd=cwd, env=env, text=True,
                                   stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=60)
                assert r.returncode == 0, f'comando falhou:\n{b[1]}\n{r.stdout}'
                saida, _, fim = r.stdout.rpartition('@@PWD ')
                cwd = Path(fim.strip())
                anterior = (b[1], saida)
                n_cmd += 1
            else:
                _, tipo, esperado = b
                comando, obtido = anterior
                e, o = normalizar_p06(esperado, tipo), normalizar_p06(obtido, tipo)
                assert e == o, f'saida diferente para:\n{comando}\n--- pagina\n{e}\n--- obtida\n{o}'
                n_out += 1
        print(f'{n_cmd} passos executados; {n_out} saidas conferidas.')

        # A corrida e a trava precisam ser reprodutiveis, nao sorte de uma rodada.
        for trava, compras in (('', 2), (' trava', 1)):
            for _ in range(5):
                r = subprocess.run(['bash', '-c', f'echo 1 > estoque.txt; ./compra Ana{trava} & '
                                    f'./compra Beto{trava} & wait; cat estoque.txt'],
                                   cwd=cwd, env=env, capture_output=True, text=True, timeout=10)
                assert r.stdout.count('COMPREI') == compras and r.stdout.endswith('0\n'), r.stdout
        print('5 rodadas sem trava: 2 compras; 5 rodadas com trava: 1 compra.')
        time.sleep(0.3)
        vivos = subprocess.run(['pgrep', '-u', str(os.getuid()), '-f', r'^(\./compra |/bin/bash \./replicas\.sh)'],
                               capture_output=True, text=True).stdout
        assert not vivos.strip(), f'processos restantes: {vivos}'
        tamanho = sum(x.stat().st_size for x in cwd.iterdir())
        print(f'Nenhum processo restante; pasta da atividade com {tamanho} bytes.')


if __name__ == '__main__':
    nomes = [a for a in sys.argv[1:] if not a.startswith('--')]
    main(nomes[0] if nomes else 'p05-difusao')
