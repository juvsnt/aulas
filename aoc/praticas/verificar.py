"""Executa os blocos principais dos roteiros em pastas temporarias.
Nao acessa o LIAC. Requer Linux x86-64, Bash, Python3, GCC e Binutils.
A exploracao opcional de GDB precisa de verificacao separada.
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
        self.details = 0
        self.pre = 0
        self.active = False
        self.text = ''
        self.blocks = []
    def handle_starttag(self, tag, attrs):
        if tag == 'details': self.details += 1
        if tag == 'pre': self.pre += 1
        if tag == 'code' and self.pre and not self.details:
            # Inline code nao tem quebra de linha; os blocos sao filtrados abaixo.
            self.active = True
            self.text = ''
    def handle_data(self, text):
        if self.active: self.text += text
    def handle_endtag(self, tag):
        if tag == 'code' and self.active:
            if '\n' in self.text or self.text.startswith(('./', 'gcc ', 'objdump ')):
                self.blocks.append(self.text)
            self.active = False
        if tag == 'details': self.details -= 1
        if tag == 'pre': self.pre -= 1

def run(args, cwd):
    return subprocess.run(args, cwd=cwd, text=True, capture_output=True,
                          timeout=20, check=True).stdout

with tempfile.TemporaryDirectory(prefix='aoc-roteiros-') as tmp:
    base = Path(tmp)
    for i in range(1, 8):
        unit = f'un{i:02}'
        cwd = base / unit
        cwd.mkdir()
        parser = Commands()
        parser.feed((ROOT / unit / 'index.html').read_text())
        for block in parser.blocks:
            code = block.replace(f'~/atividades/aoc-estacao/{unit}', str(cwd))
            run(['bash', '-e', '-c', code], cwd)
        print(f'{unit}: blocos principais executados ({len(parser.blocks)})')
    # Oraculos de resultados e cenarios-limite do material.
    assert (base/'un01/leituras.bin').read_bytes() == bytes([12,18,24,30])
    representacao = run(['./representacao'], base/'un01')
    for trecho in ['255+1 em int: 256', '255+1 limitado a 8 bits: 0',
                   '11111111 com sinal: -1', '0.1+0.2 == 0.3: falso',
                   '0.1 em float32 little-endian: cdcccc3d', 'Desafio: 00011110 8 4']:
        assert trecho in representacao, trecho
    assert run(['./estacao'], base/'un02').strip() == 'Total bruto=84 Alertas calibrados=2'
    assert run(['./desafio'], base/'un02').strip() == 'Total bruto=84 Alertas calibrados=3'
    asm = run(['objdump','-d','-M','intel','--disassemble=calibrar','estacao'],base/'un02')
    assert '<calibrar>:' in asm and 'cmp' in asm and 'ret' in asm
    for valor, destino, r in [(18,5,20),(21,5,23),(22,6,24),(24,6,26)]:
        out=run(['./cpu',str(valor)],base/'un03')
        assert f'PC={destino} IR=HALT 0 R={r}' in out
        assert f'memoria[1]={r}' in out
    for modo, resumo in [('sequencial','hits=4 misses=4'),('saltos','hits=0 misses=8'),('reuso','hits=7 misses=1')]:
        assert resumo in run(['./cache',modo],base/'un04')
    assert 'Mesmo conteudo: verdadeiro' in run(['./entrada_saida'], base/'un05')
    assert (base/'un05/relatorio.txt').read_text() == 'Total bruto=84\n'
    for n,b,c in [(4,0,8),(4,2,10),(8,0,12),(3,4,11)]:
        out=run(['./pipeline',str(n),str(b)],base/'un06')
        assert f'com pipeline={c} ciclos' in out
        assert f'I{n}: ' in out
    out=run(['./paralelo'],base/'un07')
    assert 'Serial=840000 Dividido=840000 Iguais=verdadeiro' in out
    assert run(['./paralelo','12','18'],base/'un07').strip() == '300000'
    assert run(['./paralelo','24','30'],base/'un07').strip() == '540000'
    assert run(['./paralelo','amdahl'],base/'un07').strip() == '2.5'
    for unit, args in [('un03',['./cpu','abc']), ('un03',['./cpu','1001']),
                       ('un04',['./cache','invalido']), ('un06',['./pipeline','13','0']),
                       ('un06',['./pipeline','4','5']), ('un07',['./paralelo','a','18'])]:
        result = subprocess.run(args, cwd=base/unit, capture_output=True, timeout=5)
        assert result.returncode != 0, args
    total=sum(p.stat().st_size for p in base.rglob('*') if p.is_file())
    assert total < 1024*1024
    print(f'Resultados e desafios conferidos; arquivos de trabalho: {total} bytes (<1 MiB).')
with zipfile.ZipFile(ROOT/'arquivos/aoc-estacao-fontes.zip') as z:
    for name in z.namelist():
        assert z.read(name) == (ROOT/'arquivos'/name).read_bytes(),name
print('Pacote de fontes corresponde aos arquivos publicados.')
