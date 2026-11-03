"""Valida conteudo, fontes, blocos copiaveis e resultados dos roteiros SD.
Manutencao docente. Nao acessa o LIAC. TCP requer --tcp em ambiente autorizado.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import argparse
import os
import re
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.labels=[]; self.fields=[]; self.links=[]
        self.blocks=[]; self.pre=0; self.active=False; self.text='';self.mode='';self.status=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag=='label' and 'for' in a: self.labels.append(a['for'])
        if tag=='textarea': self.fields.append(a['id'])
        if tag in ('a','link','script','img'):
            dest=a.get('href',a.get('src'))
            if dest: self.links.append(dest)
        if 'data-run' in a: self.mode=a['data-run']; self.status=int(a.get('data-status','0'))
        if tag=='pre': self.pre+=1
        if tag=='code' and self.pre: self.active=True;self.text=''
    def handle_data(self,text):
        if self.active: self.text+=text
    def handle_endtag(self,tag):
        if tag=='code' and self.active:
            self.blocks.append((self.mode,self.status,self.text));self.active=False
        if tag=='pre': self.pre-=1

def readpage(path):
    p=Page();p.feed(path.read_text());return p

def run(args,cwd,status=0,env=None):
    r=subprocess.run(args,cwd=cwd,text=True,capture_output=True,timeout=10,env=env)
    assert r.returncode==status, f'{args}\nretorno={r.returncode}, esperado={status}\n{r.stdout}\n{r.stderr}'
    assert 'runtime error:' not in r.stderr,r.stderr
    return r.stdout

def main():
    opts=argparse.ArgumentParser();opts.add_argument('--tcp',action='store_true');args=opts.parse_args()
    pages={p.resolve():readpage(p) for p in ROOT.rglob('*.html')}
    practices=[]; sources=set()
    for path,p in pages.items():
        assert len(p.ids)==len(set(p.ids)),path
        assert all(f in p.labels for f in p.fields),path
        if re.fullmatch(r'un\d{2}|sintese',path.parent.name):
            practices+=re.findall(r'^p\d{2}$','\n'.join(p.ids),re.M)
            assert p.fields,path
        for link in p.links:
            url=urlsplit(link)
            if url.scheme or url.netloc: continue
            target=(path.parent/unquote(url.path)).resolve() if url.path else path
            # O workflow copia disciplinas.css para a raiz publicada.
            if target==REPO/'disciplinas.css': target=REPO/'pages/disciplinas.css'
            if target.is_dir(): target=target/'index.html'
            assert target.exists(),(path,link,target)
            if url.fragment and target.suffix=='.html':
                ids=pages[target].ids if target in pages else readpage(target).ids
                assert unquote(url.fragment) in ids,(path,link)
        for _,_,block in p.blocks:
            if block.startswith('cat > '):
                name=block.split()[2]; match=re.search(r"<<'FIM'\n(.*?)\nFIM\n",block,re.S)
                assert match and match[1]+'\n'==(ROOT/'arquivos'/name).read_text(),(path,name)
                sources.add(name)
    assert sorted(practices)==[f'p{i:02}' for i in range(1,14)],practices
    assert sources=={p.name for p in (ROOT/'arquivos').glob('*.c')},sources
    with zipfile.ZipFile(ROOT/'arquivos/sd-estacao-fontes.zip') as z:
        files={p.name:p.read_bytes() for p in (ROOT/'arquivos').iterdir() if p.suffix in ('.c','.sh')}
        assert set(z.namelist())==set(files)
        assert all(z.read(name)==data for name,data in files.items())
    print('13 praticas, IDs, campos, links, fontes HTML e ZIP conferidos.')
    with tempfile.TemporaryDirectory(prefix='sd-roteiros-') as tmp:
        base=Path(tmp)
        for un in range(1,11):
            folder=base/f'un{un:02}';folder.mkdir()
            p=pages[(ROOT/f'un{un:02}/index.html').resolve()]
            for mode,status,block in p.blocks:
                if mode=='optional' and not args.tcp: continue
                block=block.replace(f'~/atividades/sd-estacao/un{un:02}',str(folder))
                # Testar exatamente o codigo colado, com avisos elevados a erros.
                block=block.replace('gcc -std=c11','gcc -Werror -std=c11')
                run(['bash','-e','-c',block],folder,status)
            print(f'U{un:02}: blocos principais e mudancas orientadas executados.')
        def check(un,cmd,expected,status=0):
            out=run(cmd,base/f'un{un:02}',status)
            for s in expected: assert s in out,(cmd,s,out)
            return out
        for passo in range(1,17):
            for ultimo in (0,30,36,100):
                total=54+ultimo
                out=check(1,['./estacao',str(passo),str(ultimo)],[f'Leituras=4 Total={total}', 'Relatorio=COMPLETO'])
                assert out.count('Mensagem:')==4
                if passo==1:
                    tamanho=sum(len(f'{i} {v}\n') for i,v in enumerate((12,18,24,ultimo),1))
                    assert f'Chamadas com dados={tamanho}' in out
            out=check(2,['./estacao',str(passo),'30','corte'],['Leituras=3 Total=54','Registro incompleto','Relatorio=INCOMPLETO'],1)
            assert 'id=4' not in out
        # Ordem causal sem depender de horarios fisicos.
        def logical(out): return re.findall(r'^([AB]\d).* L=(\d+)$',out,re.M)
        a=check(3,['./lamport','20'],['A4 recebe r fisico=16 L=5'])
        b=check(3,['./lamport','-20'],['B3 recebe m fisico=-7 L=3'])
        assert logical(a)==logical(b)==[('A1','1'),('B1','1'),('B2','2'),('A2','2'),('B3','3'),('A3','3'),('B4','4'),('A4','5')]
        check(4,['./coordenacao'],['Atualizacoes=6'])
        out=check(4,['./coordenacao','falha'],['Atualizacoes=1'])
        assert out.count('sem progresso')==5
        out=check(5,['./grupo','chegada'],['alerta=NAO','alerta=SIM']);assert out.count('Pendentes=0')==2
        out=check(5,['./grupo','causal'],[])
        rs=out.split('Receptor R')[1:]
        assert [re.findall(r'^Entrega (.)',r,re.M) for r in rs]==[['X','Y','Z'],['Z','X','Y']]
        assert out.count('alerta=SIM')==2 and 'alerta=NAO' not in out
        out=check(5,['./grupo','causal','sem-x'],[])
        assert out.count('Pendentes=1')==2 and 'Entrega Y' not in out
        check(6,['./replicas'],['A=102 B=102']);check(6,['./replicas','soma'],['A=114 B=114'])
        for mode,result,saldo in [('sim','CONFIRMADO',96),('nao','ABORTADO',84),('falha','PENDENTE',84)]:
            check(7,['./transacao',mode],[f'Resultado={result}',f'Saldos: P1={saldo} P2={saldo}'])
        for mode,total,efeitos in [('sem',108,2),('dedup',96,1),('reinicio',108,2)]:
            check(8,['./repeticao',mode],[f'Total={total} Efeitos={efeitos}'])
        check(9,['./cache'],['valor=84 versao=1 Atual=NAO'])
        check(9,['./cache','revalidar'],['valor=96 versao=2 Atual=SIM'])
        check(9,['./nomes','10'],['t=3 usa cache; estacao/relatorio -> no1','Consultas=2'])
        check(9,['./nomes','1'],['t=3 consulta autoridade; estacao/relatorio -> no2','Consultas=3'])
        check(9,['./memoria'],['valor no dono=102'])
        check(9,['./memoria','exclusiva'],['valor no dono=114'])
        for mode,total in [('aberto',126),('politica',108),('replay',96)]: check(10,['./seguranca',mode],[f'Total={total}'])
        # Entradas fora dos limites devem ser rejeitadas antes de criar trabalho.
        for un,program in [(1,'estacao'),(3,'lamport'),(4,'coordenacao'),(5,'grupo'),(6,'replicas'),(7,'transacao'),(8,'repeticao'),(9,'cache'),(9,'nomes'),(9,'memoria'),(10,'seguranca')]:
            check(un,[f'./{program}','invalido'],[],2)
        for program in ('estacao','lamport','nomes'):
            un={'estacao':1,'lamport':3,'nomes':9}[program]
            for value in ('','999999999999999999999999999999','1x'):
                check(un,[f'./{program}',value],[],2)
        for args_bad in [('0',),('17',),('8','101'),('8','-1'),('8','30','erro')]: check(1,['./estacao',*args_bad],[],2)
        # UBSan verifica tambem cenarios alternativos; sem rede por padrao.
        sanitized=base/'ubsan';sanitized.mkdir()
        modes={'estacao':[[],['1','36'],['16','30','corte']], 'lamport':[[],['-50']],
            'coordenacao':[[],['falha']], 'grupo':[[],['causal'],['causal','sem-x']],
            'replicas':[[],['soma']], 'transacao':[['sim'],['nao'],['falha']],
            'repeticao':[['sem'],['dedup'],['reinicio']], 'cache':[[],['revalidar']],
            'nomes':[['1'],['10'],['20']], 'memoria':[[],['exclusiva']],
            'seguranca':[['aberto'],['politica'],['replay']], 'tcp_local':[[]]}
        for src in sorted((ROOT/'arquivos').glob('*.c')):
            run(['gcc','-std=c11','-O0','-Wall','-Wextra','-Wpedantic','-Werror','-fsanitize=undefined','-fno-sanitize-recover=all',str(src),'-o',src.stem],sanitized)
            if src.stem=='tcp_local' and not args.tcp: continue
            for argv in modes[src.stem]:
                run(['./'+src.stem,*argv],sanitized,1 if 'corte' in argv else 0)
        size=sum(p.stat().st_size for p in base.rglob('*') if p.is_file())
        assert size<1024*1024,size
        print(f'Resultados, limites de entrada e UBSan conferidos; arquivos temporarios: {size} bytes (<1 MiB).')
    print('TCP loopback executado.' if args.tcp else 'TCP compilado; execucao opcional nao solicitada (use --tcp em ambiente autorizado).')

if __name__=='__main__': main()
