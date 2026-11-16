#!/usr/bin/env python3
"""Verifica a atividade da Unidade 5 de AOC (ferramenta docente).
Executa, numa pasta HOME temporaria, exatamente os blocos que a pagina
manda colar, confere as saidas dos programas e testa a gravacao do arquivo
final por colagem no Bash. Uso: python3 aoc/entrada-saida/verificar.py
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
falhas = []


def ok(cond, msg):
    print(('OK    ' if cond else 'FALHA ') + msg)
    if not cond:
        falhas.append(msg)


def bash(script, home, timeout=60):
    env = {'HOME': str(home), 'PATH': os.environ['PATH'], 'LANG': 'C.UTF-8'}
    return subprocess.run(['bash', '-c', script], cwd=home, env=env, text=True,
                          capture_output=True, timeout=timeout)


blocos = [html.unescape(c) for c in re.findall(r'<pre tabindex="0"><code>(.*?)</code></pre>', PAGINA, re.S)]
ok(len(blocos) == 12, f'{len(blocos)} blocos de comando na página (esperado 12)')

# 1. Fontes da pagina identicas aos arquivos publicados
for nome in ['interrupcoes.c', 'espera.c', 'blocos.c']:
    fonte = (ROOT / 'public' / 'arquivos' / nome).read_text()
    ok(any(b == f"cat > {nome} <<'FIM'\n{fonte}FIM\n# fim do bloco" for b in blocos), f'{nome}: bloco da página igual ao arquivo')
ok(all(b.endswith('\n# fim do bloco') for b in blocos), 'todo bloco termina com "# fim do bloco"')

with tempfile.TemporaryDirectory() as tmp:
    home = Path(tmp)
    pasta = home / 'atividades' / 'aoc-entrada-saida'
    # 2. Cola cada bloco, na ordem, como o terminal web do LIAC: com "~"
    #    grudado no fim da ultima linha. Nenhum bloco pode falhar por isso.
    erros_til, stderr_total = [], ''
    for n, b in enumerate(blocos, 1):
        b = b.replace('./interrupcoes 10', './interrupcoes 2')
        if not b.startswith('mkdir'):
            b = 'cd ~/atividades/aoc-entrada-saida\n' + b
        r = bash('set -e\n' + b + '~', home)
        stderr_total += r.stderr
        if r.returncode != 0 or '~' in r.stderr:
            erros_til.append(f'bloco {n}: {r.stderr.strip()[-200:]}')
    ok(not erros_til, 'todos os 12 blocos funcionam com "~" colado no fim' + ('; ' + ' | '.join(erros_til) if erros_til else ''))
    r = subprocess.CompletedProcess([], 0, '', stderr_total)
    ok('warning' not in r.stderr, 'compilação sem avisos')

    r = bash('cd ~/atividades/aoc-entrada-saida && ./interrupcoes 2', home)
    ok(r.returncode == 0 and 'Total em 2 s' in r.stdout and 'dispositivo/evento' in r.stdout, 'interrupcoes: tabela e total')
    r = bash('cd ~/atividades/aoc-entrada-saida && ./interrupcoes 0', home)
    ok(r.returncode == 1, 'interrupcoes: rejeita 0 segundos')

    r = bash('cd ~/atividades/aoc-entrada-saida && ./espera perguntando && ./espera avisado', home)
    cpu = [float(x) for x in re.findall(r'tempo de CPU gasto:\s+([\d.]+)', r.stdout)]
    esp = [float(x) for x in re.findall(r'tempo de espera:\s+([\d.]+)', r.stdout)]
    ok(len(cpu) == 2 and all(2.9 < e < 3.5 for e in esp), f'espera: 2 modos, ~3 s cada {esp}')
    ok(len(cpu) == 2 and cpu[0] > 1.5 and cpu[1] < 0.05, f'espera: CPU perguntando alta e avisado ~0 {cpu}')

    r = bash('cd ~/atividades/aoc-entrada-saida && ./blocos', home)
    linhas = re.findall(r'^\s+(\d+)\s+(\d+)\s+([\d.]+)', r.stdout, re.M)
    pedidos = {int(b): int(p) for b, p, _ in linhas}
    tempos = {int(b): float(t) for b, _, t in linhas}
    ok(pedidos == {1: 4194304, 16: 262144, 512: 8192, 4096: 1024, 65536: 64}, 'blocos: número de pedidos')
    ok(tempos and tempos[1] > 20 * tempos[65536], 'blocos: 1 byte bem mais lento que 64 KiB')
    ok(not (pasta / 'dados_4MiB.bin').exists(), 'blocos: arquivo de 4 MiB apagado')

    # 3. Arquivo final: conteudo dificil colado no Bash
    dificil = ('Atividade\n## Pergunta\n$(touch INVADIU) `touch INVADIU2` $HOME \\n "aspas" \'simples\'\n'
               'FIM_ENTREGA_AOC\nFIM\nacentuação: ç ã é\n\núltima')
    js = ("const {comandoEntrega}=require(process.argv[1]);"
          "process.stdout.write(comandoEntrega(JSON.parse(process.argv[2])));")
    cmd = subprocess.run(['node', '-e', js, str(ROOT / 'public' / 'app.js'), json.dumps(dificil)],
                         text=True, capture_output=True, check=True).stdout
    r = bash('cd /\n' + cmd + '~', home)
    salvo = pasta / 'entrega-es.txt'
    ok(r.returncode == 0 and 'Arquivo final salvo' in r.stdout, 'arquivo final: comando executa')
    ok(salvo.exists() and salvo.read_text() == dificil + '\n', 'arquivo final: conteúdo idêntico')
    ok(not list(home.rglob('INVADIU*')), 'arquivo final: respostas não são executadas')
    r = bash('cd /\n' + cmd + '~', home)
    ok(salvo.read_text() == dificil + '\n', 'arquivo final: segunda colagem substitui o arquivo')

    sobras = subprocess.run(['pgrep', '-f', 'espera (perguntando|avisado)'], capture_output=True)
    ok(sobras.returncode != 0, 'nenhum processo remanescente')

# 4. Pagina: perguntas unicas, links dos slides validos, sem guia docente
ids = re.findall(r'<textarea id="([^"]+)"', PAGINA)
ok(len(ids) == len(set(ids)) == 19, f'{len(ids)} perguntas com identificadores únicos')
paginas = {int(p) for p in re.findall(r'un05t01\.pdf#page=(\d+)', PAGINA)}
ok(paginas and max(paginas) <= 15, f'links para slides existentes: {sorted(paginas)}')
ok('professor' not in PAGINA.lower() or 'pelo professor' in PAGINA, 'sem link para guia docente')
ok(not (ROOT / 'public' / 'professor.html').exists(), 'guia docente fora da pasta pública')

print('\n' + ('TUDO OK' if not falhas else f'{len(falhas)} falha(s)'))
raise SystemExit(1 if falhas else 0)
