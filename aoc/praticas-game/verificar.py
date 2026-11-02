"""Validador automatizado para as praticas de AOC (Trilha: Por dentro do console).
Executa os blocos de comando extraidos dos HTMLs em pastas temporarias.
Requer Linux x86-64, Bash, GCC, Binutils e Python 3.
"""
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent

class Commands(HTMLParser):
    def __init__(self):
        super().__init__()
        self.pre = 0
        self.active = False
        self.text = ''
        self.blocks = []
    def handle_starttag(self, tag, attrs):
        if tag == 'pre': self.pre += 1
        if tag == 'code' and self.pre:
            self.active = True
            self.text = ''
    def handle_data(self, text):
        if self.active: self.text += text
    def handle_endtag(self, tag):
        if tag == 'code' and self.active:
            if '\n' in self.text or self.text.startswith(('./', 'gcc ', 'objdump ')):
                self.blocks.append(self.text)
            self.active = False
        if tag == 'pre': self.pre -= 1

def run(args, cwd):
    return subprocess.run(args, cwd=cwd, text=True, capture_output=True,
                          timeout=30, check=True).stdout

with tempfile.TemporaryDirectory(prefix='aoc-game-') as tmp:
    base = Path(tmp)
    for i in range(1, 8):
        unit = f'un{i:02}'
        cwd = base / unit
        cwd.mkdir()
        parser = Commands()
        parser.feed((ROOT / unit / 'index.html').read_text(encoding='utf-8'))
        for block in parser.blocks:
            code = block.replace(f'~/atividades/aoc-game/{unit}', str(cwd))
            run(['bash', '-e', '-c', code], cwd)
        print(f'{unit}: todos os blocos executados com sucesso ({len(parser.blocks)} blocos)')

    # Assercoes dos resultados esperados de cada unidade:
    # U1
    out_u1 = run(['./personagem'], base / 'un01')
    assert 'Vida resultante com overflow de 8 bits: 4' in out_u1
    assert 'Bit 2 - Possui escudo?      SIM' in out_u1  # Apos o desafio

    # U2
    out_u2 = run(['./movimento'], base / 'un02')
    assert 'Posicao final:   85' in out_u2  # Apos o desafio

    # U3
    out_u3 = run(['./cpu_game'], base / 'un03')
    assert 'Resultado Final: RAM[0] = 20' in out_u3  # Apos o desafio de HP 30

    # U4
    out_u4_linha = run(['./mapa_cache', 'linha'], base / 'un04')
    assert 'Taxa de acertos:  50.0%' in out_u4_linha
    out_u4_col = run(['./mapa_cache', 'coluna'], base / 'un04')
    assert 'Taxa de acertos:  0.0%' in out_u4_col

    # U5
    save_bloco = (base / 'un05' / 'save_bloco.dat').read_bytes()
    assert save_bloco == bytes([3, 2, 50, 99])

    # U6
    out_u6 = run(['./pipeline_fps', '0'], base / 'un06')
    assert 'Tempo com pipeline:              9 ciclos' in out_u6
    assert 'Aceleracao (Speedup):            2.67x mais rapido' in out_u6

    # U7
    out_u7 = run(['./inimigos_multicore'], base / 'un07')
    assert 'Resultado = 990000000' in out_u7
    assert 'Com infinitos nucleos: Aceleracao maxima nunca ultrapassa 5.0x!' in out_u7

    # Verifica integridade do arquivo ZIP
    zip_path = ROOT / 'arquivos' / 'aoc-console-fontes.zip'
    assert zip_path.exists(), "Arquivo zip nao encontrado!"
    with zipfile.ZipFile(zip_path, 'r') as z:
        names = z.namelist()
        for font in ['personagem.c', 'movimento.c', 'cpu_game.c', 'mapa_cache.c',
                     'io_game.c', 'pipeline_fps.c', 'inimigos_multicore.c']:
            assert font in names, f"Fonte {font} faltando no zip!"

print("\n>>> SUCESSO TOTAL: Todos os roteiros, programas em C e asserções foram validados! <<<")
