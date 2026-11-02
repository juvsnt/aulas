"""Valida os roteiros SO em pastas temporarias, sem acessar o LIAC.
Python e ferramenta de manutencao; os alunos usam somente C/Bash.
Requer Linux, GCC, pthreads e utilitarios Linux dos roteiros.
"""
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import tempfile
import zipfile
import re

ROOT = Path(__file__).resolve().parent
UNITS = ['un01','un02','un03','un04','un05','sintese']
class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.details = self.pre = 0
        self.active = False
        self.blocks = []
        self.text = ''
        self.ids = []
        self.labels = []
        self.fields = []
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag=='label' and 'for' in a: self.labels.append(a['for'])
        if tag=='textarea': self.fields.append(a['id'])
        if tag=='details': self.details+=1
        if tag=='pre': self.pre+=1
        if tag=='code' and self.pre and not self.details:
            self.active=True; self.text=''
    def handle_data(self,text):
        if self.active: self.text+=text
    def handle_endtag(self,tag):
        if tag=='code' and self.active:
            self.blocks.append(self.text); self.active=False
        if tag=='pre': self.pre-=1
        if tag=='details': self.details-=1

def run(args,cwd):
    p=subprocess.run(args,cwd=cwd,text=True,capture_output=True,timeout=15)
    if p.returncode: raise AssertionError(f'{args}\n{p.stdout}\n{p.stderr}')
    return p.stdout

def compile_variant(name,src,cwd):
    (cwd/f'{name}.c').write_text(src)
    flags=['gcc','-std=c11','-O0','-Wall','-Wextra','-Wpedantic','-Werror']
    if name=='concorrencia': flags+=['-pthread']
    run(flags+[f'{name}.c','-o',name],cwd)

with tempfile.TemporaryDirectory(prefix='so-roteiros-') as tmp:
    base=Path(tmp)
    seen=[]
    for unit in UNITS:
        folder=base/unit; folder.mkdir()
        parser=Page(); text=(ROOT/unit/'index.html').read_text(); parser.feed(text)
        assert len(parser.ids)==len(set(parser.ids)),unit
        assert all(f in parser.labels for f in parser.fields),unit
        assert 'python3' not in text,unit
        seen+=re.findall(r'^p\d{2}$','\n'.join(parser.ids),re.M)
        for block in parser.blocks:
            if block.startswith('cat > ') and "<<'FIM'" in block:
                name=block.split()[2]
                assert block.split("<<'FIM'\n",1)[1].removesuffix('FIM') == (ROOT/'arquivos'/name).read_text(),name
            script=block.replace(f'~/atividades/so-servico/{unit}',str(folder))
            run(['bash','-e','-c',script],folder)
        print(f'{unit}: {len(parser.blocks)} blocos principais executados')
    assert sorted(seen)==[f'p{n:02}' for n in range(1,15)]
    assert (base/'un01/relatorio.txt').read_text()=='Leituras=4 Total=84\n'
    assert 'EBADF' in run(['./servico'],base/'un01')
    (base/'un01/leituras.txt').write_text('12 18 24 36\n')
    assert 'Total=90' in run(['./servico'],base/'un01')
    assert 'Pai depois: leitura=12 codigo_filho=7' in run(['./processos'],base/'un02')
    for modo,medias in [('fcfs','4.33 retorno=7.33 resposta=4.33'),('sjf','1.67 retorno=4.67 resposta=1.67'),('rr','4.33 retorno=7.33 resposta=2.00')]:
        out=run(['./escalonamento',modo],base/'un02')
        assert 'Medias: espera='+medias in out
    out=run(['./concorrencia'],base/'un02')
    assert 'Atualizacao perdida: contador=1 esperado=2' in out
    assert 'Com mutex: contador=2 esperado=2' in out
    for end,expected in [('0','fisico=48'),('30','fisico=94'),('32','Pagina ausente'),('63','fisico=47')]:
        assert expected in run(['./paginacao',end],base/'un03')
    for modo,faltas in [('fifo',10),('lru',10),('opt',7)]:
        assert f'Faltas={faltas} Hits={12-faltas}' in run(['./paginas',modo],base/'un03')
    folder=base/'un04'
    assert (folder/'relatorio.txt').stat().st_ino==(folder/'relatorio.hard').stat().st_ino
    assert (folder/'relatorio.sym').is_symlink()
    assert (folder/'relatorio.txt').stat().st_mode&0o777 == 0o600
    assert 'Bitmap da organizacao indexada (1=livre): 110101101111' in run(['./alocacao','25'],folder)
    assert 'bloco_logico=2 offset=15' in run(['./alocacao','47'],folder)
    assert (base/'un05/leituras.bin').read_bytes()==bytes([12,18,24,30])
    assert 'Mesmo conteudo=sim Total=84' in run(['./entrada_saida'],base/'un05')
    for modo,total in [('fcfs',220),('sstf',100)]:
        assert f'Deslocamento total={total}' in run(['./disco',modo],base/'un05')
    assert (base/'sintese/relatorio.txt').read_text()=='Leituras=4 Total=84\n'
    # Modificacoes propostas: compiladas a partir de copias, nunca no repositorio.
    folder=base/'variantes';folder.mkdir()
    sources={p.stem:p.read_text() for p in (ROOT/'arquivos').glob('*.c')}
    compile_variant('processos',sources['processos'].replace('int leitura = 12','int leitura = 18').replace('return 7;','return 9;').replace('== 7','== 9'),folder)
    assert 'Pai depois: leitura=18 codigo_filho=9' in run(['./processos'],folder)
    compile_variant('escalonamento',sources['escalonamento'].replace('restante[p] > 2 ? 2','restante[p] > 1 ? 1'),folder)
    out=run(['./escalonamento','rr'],folder)
    assert out.count(') P')==9 and 'resposta=1.00' in out
    compile_variant('concorrencia',sources['concorrencia'].replace('int copia = atomic_load(&contador);\n        pthread_barrier_wait(&barreira); /* Ambos leem antes de qualquer gravacao. */\n        atomic_store(&contador, copia+1);','atomic_fetch_add(&contador,1);'),folder)
    assert 'Atualizacao perdida: contador=2 esperado=2' in run(['./concorrencia'],folder)
    compile_variant('memoria',sources['memoria'].replace('size_t tamanho=1024*1024','size_t tamanho=512*1024'),folder)
    assert 'bytes alocados=524288' in run(['./memoria'],folder)
    compile_variant('paginacao',sources['paginacao'].replace('{3,5,-1,2}','{3,6,-1,2}'),folder)
    assert 'fisico=110' in run(['./paginacao','30'],folder)
    compile_variant('paginas',sources['paginas'].replace('{1,2,3,1,4,2,5,1,2,3,4,5}','{1,1,1,1,1,1,1,1,1,1,1,1}'),folder)
    for modo in ['fifo','lru','opt']: assert 'Faltas=1 Hits=11' in run(['./paginas',modo],folder)
    compile_variant('alocacao',sources['alocacao'].replace('indice[]={2,7,4}','indice[]={2,6,4}'),folder)
    out=run(['./alocacao','25'],folder)
    assert 'Indexada: bloco_fisico=6' in out and '110101011111' in out
    compile_variant('disco',sources['disco'].replace('cabeca=50','cabeca=0'),folder)
    for modo,total in [('fcfs',190),('sstf',80)]:
        assert f'Deslocamento total={total}' in run(['./disco',modo],folder)
    for unit,args in [('un02',['./escalonamento','xyz']),('un03',['./paginacao','64']),('un03',['./paginacao','abc']),('un03',['./paginas','xyz']),('un04',['./alocacao','48']),('un05',['./disco','xyz'])]:
        assert subprocess.run(args,cwd=base/unit,capture_output=True,timeout=5).returncode!=0,args
    total=sum(p.stat().st_size for p in base.rglob('*') if p.is_file())
    assert total<1024*1024
    print(f'Resultados, limites e mudancas conferidos; arquivos de trabalho {total} bytes (<1 MiB).')
with zipfile.ZipFile(ROOT/'arquivos/so-servico-fontes.zip') as z:
    expected=sorted(p.name for p in (ROOT/'arquivos').iterdir() if p.suffix in {'.c','.sh'})
    assert sorted(z.namelist())==expected
    for name in z.namelist(): assert z.read(name)==(ROOT/'arquivos'/name).read_bytes(),name
print('Pacote de fontes integro e sincronizado.')
