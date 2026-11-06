#!/usr/bin/env python3
"""Gera comandos de colagem e pacote a partir dos fontes reais, sem duplicacao."""
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / 'public'
FILES = PUBLIC / 'arquivos'


def build():
    commands = ['mkdir -p ~/atividades/aoc-cache-fisica', 'cd ~/atividades/aoc-cache-fisica']
    for name in ['cache_lab.c', 'observar.sh']:
        source = (FILES / name).read_text()
        commands.append(f"cat > {name} <<'FIM_ARQUIVO_AOC'\n{source.rstrip()}\nFIM_ARQUIVO_AOC")
    commands.append('gcc -std=c11 -O2 -Wall -Wextra -Wpedantic cache_lab.c -o cache_lab && bash observar.sh | tee ambiente.txt')
    setup = '\n'.join(commands)
    (PUBLIC / 'preparacao.js').write_text('// Gerado por construir.py; nao editar manualmente.\nwindow.AOC_SETUP = ' + json.dumps(setup, ensure_ascii=False) + ';\n')
    with zipfile.ZipFile(FILES / 'cache-fisica-fontes.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for name in ['cache_lab.c', 'observar.sh']:
            z.write(FILES / name, name)
    return setup


if __name__ == '__main__':
    build()
    print('Comandos de preparacao e ZIP atualizados.')
