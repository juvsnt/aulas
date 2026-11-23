#!/usr/bin/env python3
"""Verifica a atividade da Unidade 6 de AOC (ferramenta docente).
Executa, numa pasta HOME temporaria, exatamente os blocos que a pagina
manda colar, confere as saidas dos programas e testa a gravacao do arquivo
final por colagem no Bash. Uso: python3 aoc/pipeline/verificar.py
"""
import html
import json
import os
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PAGINA = (ROOT / 'public' / 'index.html').read_text()
PASTA = 'atividades/aoc-pipeline'
falhas = []


def ok(cond, msg):
    print(('OK    ' if cond else 'FALHA ') + msg)
    if not cond:
        falhas.append(msg)


def bash(script, home, timeout=120):
    env = {'HOME': str(home), 'PATH': os.environ['PATH'], 'LANG': 'C.UTF-8'}
    return subprocess.run(['bash', '-c', script], cwd=home, env=env, text=True,
                          capture_output=True, timeout=timeout)


def sem_espacos_finais(texto):
    return '\n'.join(l.rstrip() for l in texto.strip('\n').splitlines())


blocos = [html.unescape(c) for c in re.findall(r'<pre tabindex="0"><code>(.*?)</code></pre>', PAGINA, re.S)]
ok(len(blocos) == 10, f'{len(blocos)} blocos de comando na página (esperado 10)')

# 1. Fontes da pagina identicas aos arquivos publicados
for nome in ['pipeline.c', 'cadeias.c', 'desvios.c']:
    fonte = (ROOT / 'public' / 'arquivos' / nome).read_text()
    ok(any(b == f"cat > {nome} <<'FIM'\n{fonte}FIM\n# fim do bloco" for b in blocos),
       f'{nome}: bloco da página igual ao arquivo')
ok(all(b.endswith('\n# fim do bloco') for b in blocos), 'todo bloco termina com "# fim do bloco"')

with tempfile.TemporaryDirectory() as tmp:
    home = Path(tmp)
    pasta = home / PASTA
    # 2. Cola cada bloco, na ordem, como o terminal web do LIAC: com "~"
    #    grudado no fim da ultima linha. Nenhum bloco pode falhar por isso.
    erros_til, stderr_total = [], ''
    for n, b in enumerate(blocos, 1):
        if not b.startswith('mkdir'):
            b = f'cd ~/{PASTA}\n' + b
        r = bash('set -e\n' + b + '~', home)
        stderr_total += r.stderr
        if r.returncode != 0 or '~' in r.stderr:
            erros_til.append(f'bloco {n}: {r.stderr.strip()[-200:]}')
    ok(not erros_til, f'todos os {len(blocos)} blocos funcionam com "~" colado no fim'
       + ('; ' + ' | '.join(erros_til) if erros_til else ''))
    ok('warning' not in stderr_total, 'compilação sem avisos')

    def rodar(args):
        return bash(f'cd ~/{PASTA} && {args}', home)

    # 3. Simulador: numeros deterministicos e saidas de exemplo da pagina
    def campo(saida, nome):
        m = re.search(re.escape(nome) + r':\s+([\d.]+)', saida)
        return m.group(1) if m else None

    r5 = rodar('./pipeline 5').stdout
    ok(campo(r5, 'Ciclos com pipeline') == '9' and campo(r5, 'Ganho (speedup) sem/com') == '2.78',
       'pipeline 5: 9 ciclos, ganho 2.78')
    exemplo = html.unescape(re.search(r'Resultado da simulação · igual em qualquer computador'
                                      r'</div><pre tabindex="0">(.*?)</pre>', PAGINA, re.S).group(1))
    ok(sem_espacos_finais(exemplo) == sem_espacos_finais(r5), 'pipeline 5: saída esperada da página = programa')
    rm = rodar('./pipeline 1000000').stdout
    ok(campo(rm, 'Ganho (speedup) sem/com') == '5.00' and campo(rm, 'Tempo com pipeline') == '2000008',
       'pipeline 1000000: ganho 5.00 e 2000008 ns')
    rd = rodar('./pipeline dependencia').stdout
    ok(campo(rd, 'Bolhas (ciclos perdidos)') == '2' and campo(rd, 'Ciclos com pipeline') == '9',
       'pipeline dependencia: 2 bolhas, 9 ciclos')
    exemplo = html.unescape(re.search(r'Resultado da simulação · sem adiantamento'
                                      r'</div><pre tabindex="0">(.*?)</pre>', PAGINA, re.S).group(1))
    ok(sem_espacos_finais(exemplo) in sem_espacos_finais(rd), 'pipeline dependencia: diagrama da página = programa')
    ra = rodar('./pipeline adiantamento').stdout
    ok(campo(ra, 'Bolhas (ciclos perdidos)') == '0' and campo(ra, 'Ciclos com pipeline') == '7',
       'pipeline adiantamento: 0 bolhas, 7 ciclos')
    ok(all(rodar(f'./pipeline {a}').returncode == 1 for a in ['', '0', '-3', 'abc', '2000000000']),
       'pipeline: rejeita argumentos inválidos')

    # 4. Medicoes reais: so o que vale em qualquer x86-64 (tendencias, nao valores)
    rc = rodar('./cadeias').stdout
    linhas = re.findall(r'^\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(\d+)$', rc, re.M)
    ok([int(l[0]) for l in linhas] == [1, 2, 4, 8, 12], 'cadeias: linhas 1, 2, 4, 8, 12')
    ok({l[4] for l in linhas} == {'100663296'}, 'cadeias: mesmo resultado em todas as linhas')
    ciclos = [float(l[3]) for l in linhas]
    ok(len(ciclos) == 5 and ciclos[0] > 1.6 * ciclos[1] and ciclos[0] > 3 * ciclos[3],
       f'cadeias: dependência custa caro {ciclos}')
    ok(len(ciclos) == 5 and 0.7 < ciclos[4] / ciclos[3] < 1.3, f'cadeias: 8 e 12 cadeias saturam {ciclos}')
    ok(re.search(r'clock estimado: [\d.]+ GHz', rc) is not None, 'cadeias: régua e clock estimado')

    rv = rodar('./desvios').stdout
    linhas = re.findall(r'^(\w+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(\d+)$', rv, re.M)
    ok([l[0] for l in linhas] == ['ordenada', 'alternada', 'aleatoria'], 'desvios: três ordens')
    ok(len({l[4] for l in linhas}) == 1, 'desvios: mesmo resultado nas três ordens')
    c = {l[0]: float(l[3]) for l in linhas}
    ok(c and c['aleatoria'] > 3 * c['ordenada'] and c['alternada'] < 2 * c['ordenada'],
       f'desvios: aleatória bem mais lenta, alternada rápida {c}')

    # 5. Arquivo final: conteudo dificil colado no Bash
    dificil = ('Atividade\n## Pergunta\n$(touch INVADIU) `touch INVADIU2` $HOME \\n "aspas" \'simples\'\n'
               'FIM_ENTREGA_AOC\nFIM\nacentuação: ç ã é\n\núltima')
    js = ("const {comandoEntrega}=require(process.argv[1]);"
          "process.stdout.write(comandoEntrega(JSON.parse(process.argv[2])));")
    cmd = subprocess.run(['node', '-e', js, str(ROOT / 'public' / 'app.js'), json.dumps(dificil)],
                         text=True, capture_output=True, check=True).stdout
    r = bash('cd /\n' + cmd + '~', home)
    salvo = pasta / 'entrega-pipeline.txt'
    ok(r.returncode == 0 and 'Arquivo final salvo' in r.stdout, 'arquivo final: comando executa')
    ok(salvo.exists() and salvo.read_text() == dificil + '\n', 'arquivo final: conteúdo idêntico')
    ok(not list(home.rglob('INVADIU*')), 'arquivo final: respostas não são executadas')
    bash('cd /\n' + cmd + '~', home)
    ok(salvo.read_text() == dificil + '\n', 'arquivo final: segunda colagem substitui o arquivo')

    sobras = subprocess.run(['pgrep', '-x', 'cadeias|desvios|pipeline'], capture_output=True)
    ok(sobras.returncode != 0, 'nenhum processo remanescente')

# 6. Pagina: perguntas unicas, links dos slides validos, sem guia docente
ids = re.findall(r'<textarea id="([^"]+)"', PAGINA)
ok(len(ids) == len(set(ids)) == 21, f'{len(ids)} perguntas com identificadores únicos')
paginas = {int(p) for p in re.findall(r'un06t01\.pdf#page=(\d+)', PAGINA)}
ok(paginas and max(paginas) <= 15, f'links para slides existentes: {sorted(paginas)}')
ok('professor.html' not in PAGINA and 'docente' not in PAGINA.lower(), 'sem link para guia docente')
ok(not (ROOT / 'public' / 'professor.html').exists(), 'guia docente fora da pasta pública')
ok('aoc-pipeline' in (ROOT / 'public' / 'app.js').read_text(), 'app.js grava na pasta da Unidade 6')

print('\n' + ('TUDO OK' if not falhas else f'{len(falhas)} falha(s)'))
raise SystemExit(1 if falhas else 0)
