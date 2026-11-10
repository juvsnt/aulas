"""Valida a pagina da atividade executando os blocos como um aluno faria.
Ferramenta de manutencao docente; nao acessa o LIAC. Requer Linux, GCC,
pthreads, ps e (opcional) taskset.
Uso: python3 -I verificar.py un02|un03
"""
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent


class Pagina(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.labels, self.campos, self.blocos = [], [], [], []
        self.pre = 0
        self.ativo = False
        self.texto = ''

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag == 'label' and 'for' in a: self.labels.append(a['for'])
        if tag == 'textarea': self.campos.append(a['id'])
        if tag == 'pre': self.pre += 1
        if tag == 'code' and self.pre:
            self.ativo, self.texto = True, ''

    def handle_data(self, data):
        if self.ativo: self.texto += data

    def handle_endtag(self, tag):
        if tag == 'code' and self.ativo:
            self.blocos.append(self.texto)
            self.ativo = False
        if tag == 'pre': self.pre -= 1


def verificar(unidade):
    pasta = ROOT / unidade
    html = (pasta / 'index.html').read_text()
    p = Pagina()
    p.feed(html)
    assert len(p.ids) == len(set(p.ids)), 'ids repetidos'
    assert all(c in p.labels for c in p.campos), 'campo sem rotulo'
    assert 'python' not in ' '.join(p.blocos), 'bloco de aluno usa Python'
    assert '@@' not in html, 'diretiva nao processada; rode construir.py'

    # Fontes da pagina identicas aos arquivos/ e todos os arquivos publicados.
    criados = set()
    for bloco in p.blocos:
        if bloco.startswith('cat > ') and "<<'FIM'\n" in bloco:
            nome = bloco.split()[2]
            corpo = bloco.split("<<'FIM'\n", 1)[1].removesuffix('FIM')
            assert corpo == (pasta / 'arquivos' / nome).read_text(), f'{nome} divergente'
            criados.add(nome)
    esperados = {a.name for a in (pasta / 'arquivos').iterdir()}
    assert criados == esperados, f'fontes fora da pagina: {esperados - criados}'
    print(f'{unidade}: {len(p.campos)} campos, {len(p.blocos)} blocos, fontes sincronizadas')

    with tempfile.TemporaryDirectory(prefix='so-atividade-') as tmp:
        roteiro = '\n'.join(p.blocos).replace(f'~/atividades/so-{unidade}', tmp)
        # un03 tem um programa que termina por SIGSEGV de proposito; sem -e.
        opcoes = ['-e'] if unidade == 'un02' else []
        r = subprocess.run(['bash', *opcoes, '-c', roteiro], cwd=tmp, text=True,
                           capture_output=True, timeout=240)
        out = r.stdout
        assert r.returncode == 0, f'roteiro falhou ({r.returncode})\n{out}\n{r.stderr}'
        if unidade != 'un02':
            CHECAGENS[unidade](out, r.stderr, tmp)
            return
        verificacoes = [
            ('compilacao', all(f'OK {x}\n' in out for x in
                               'carga espera ciclo_exec ciclo_zumbi ciclo_orfao threads '
                               'contador_sem contador_ingenuo contador_mutex contador_semaforo '
                               'impasse_opostos impasse_ordenado'.split())),
            ('I1 carga em R', 'State:\tR (running)' in out),
            # espera dorme ~98% do tempo; a amostra pode cair na rajada de 1 ms (R).
            ('I1 espera amostrado', re.search(r'Name:\tespera\nState:\t[SR] ', out)),
            ('I1 STOP -> T', 'State:\tT (stopped)' in out),
            ('I2 exec mantem PID', re.search(r'filho PID=(\d+)[^\n]*\n[^\n]*PID[^\n]*\n\s+\1\s+\d+\s+\S+\s+ps', out)),
            ('I2 zumbi', re.search(r'\s\d+\s+\d+\s+Z\S*\s+ciclo', out) and 'codigo de saida 7' in out),
            ('I2 orfao adotado', 'depois que o pai terminou' in out),
            ('I3 carga e espera', 'carga PID=' in out and 'espera PID=' in out),
            ('I4 tres threads', out.count('&global=') >= 4),
            ('I5 sem protecao perde', re.search(r'sem protecao[^\n]*\n  rodada 1: contador=\d+ \| perdidos=[1-9]', out)),
            ('I5 mutex exato', out.count('contador=80000 | perdidos=0') >= 3),
            ('I5 semaforo limite', 'Maximo de threads dentro ao mesmo tempo: 3 (limite 3)' in out),
            ('I6 impasse', 'IMPASSE detectado' in out),
            ('I6 ordenado', 'Sem impasse' in out),
        ]
        falhas = [nome for nome, ok in verificacoes if not ok]
        assert not falhas, f'falhas: {falhas}\n{out}'
        nice = re.findall(r'nice=(\d+) \| parede=[\d.]+ s \| CPU=[\d.]+ s \((\d+)%\)', out)
        print('Disputa (nice, %CPU):', nice)
        tamanho = sum(f.stat().st_size for f in Path(tmp).rglob('*') if f.is_file())
        print(f'Roteiro executado: {len(verificacoes)} verificacoes OK; '
              f'arquivos de trabalho {tamanho} bytes')
        restantes = subprocess.run(['pgrep', '-u', str(__import__('os').getuid()), '-x',
                                    'carga|espera|ciclo|threads|contador|impasse'],
                                   capture_output=True, text=True).stdout.split()
        assert not restantes, f'processos remanescentes: {restantes}'
        print('Nenhum processo da atividade ficou ativo.')

        # Mudancas orientadas: compiladas a partir de copias, nunca em arquivos/.
        var = Path(tmp) / 'variantes'
        var.mkdir()
        fontes = {f.name: f.read_text() for f in (pasta / 'arquivos').glob('*.c')}

        def compila(nome, fonte):
            (var / nome).write_text(fonte)
            subprocess.run(['gcc', '-std=c11', '-O0', nome, '-o', nome[:-2], '-pthread'],
                           cwd=var, check=True, capture_output=True)

        def roda(*args):
            return subprocess.run(list(args), cwd=var, text=True, capture_output=True,
                                  timeout=30, check=True).stdout

        compila('ciclo_zumbi.c', fontes['ciclo_zumbi.c'].replace('_exit(7)', '_exit(42)'))
        assert 'codigo de saida 42' in roda('./ciclo_zumbi', '1')
        alvo = '    nanosleep(&pausa, NULL);'
        assert fontes['impasse_opostos.c'].count(alvo) == 2, 'esperava as duas pausas (thread1 e thread2)'
        compila('impasse_opostos.c',
                fontes['impasse_opostos.c'].replace(alvo, '    /* nanosleep(&pausa, NULL); */'))
        resultados = [roda('./impasse_opostos', '1').splitlines()[-1] for _ in range(10)]
        assert all(r.startswith('Resultado:') for r in resultados)
        print(f'Mudancas orientadas: exit 42 OK; impasse sem pausa em '
              f'{sum("IMPASSE" in r for r in resultados)}/10 execucoes (varia; pode ser 0)')


def checar_un03(out, err, tmp):
    import os
    faltas = dict(re.findall(r'^(usou a metade|usou tudo|usou tudo de novo)\s+\| RAM usada:\s+[\d.]+ MiB \| faltas novas: (\d+)', out, re.M))
    paginas = int(re.search(r'32 MiB = (\d+) paginas', out).group(1))
    metade = paginas // 2
    perto = lambda v, alvo: abs(int(v) - alvo) <= alvo * 0.10
    verificacoes = [
        ('compilacao sem avisos', 'warning' not in err),
        ('pagesize', re.search(r'^\d+$', out, re.M)),
        ('A1 metade ~ paginas/2', perto(faltas['usou a metade'], metade)),
        ('A1 tudo ~ paginas/2', perto(faltas['usou tudo'], metade)),
        ('A1 releitura ~ 0', int(faltas['usou tudo de novo']) <= 20),
        ('A2 mesmo endereco', len(set(re.findall(r'endereco de x = (0x[0-9a-f]+)', out))) == 1),
        ('A2 valores', 'x = 99' in out and '| x = 10' in out),
        ('A2 protecao', 'leitura ok: 1' in out and 'codigo de saida: 139' in out
                        and 'nao deveria aparecer' not in out),
        ('A3 FIFO 7', 'Total: 7 faltas em 10 acessos' in out),
        ('A3 LRU 6', 'Total: 6 faltas em 10 acessos' in out),
    ]
    falhas = [nome for nome, ok in verificacoes if not ok]
    assert not falhas, f'falhas: {falhas}\n{out}\n{err}'
    print(f'Roteiro executado: {len(verificacoes)} verificacoes OK '
          f'(faltas metade/tudo/releitura: {faltas["usou a metade"]}/'
          f'{faltas["usou tudo"]}/{faltas["usou tudo de novo"]})')
    assert not list(Path(tmp).glob('core*')), 'arquivo core gravado'
    restantes = subprocess.run(['pgrep', '-u', str(os.getuid()), '-x',
                                'demanda|isolado|so_leitura|substituicao'],
                               capture_output=True, text=True).stdout.split()
    assert not restantes, f'processos remanescentes: {restantes}'
    print('Nenhum processo da atividade ficou ativo; nenhum arquivo core.')

    # Conferencias do simulador usadas no gabarito (Belady e B7).
    sim = Path(tmp) / 'substituicao'
    def total(*args):
        saida = subprocess.run([str(sim), *args], text=True, capture_output=True, check=True).stdout
        return int(re.search(r'Total: (\d+) faltas', saida).group(1))
    belady = '1 2 3 4 1 2 5 1 2 3 4 5'.split()
    b7 = '2 3 2 1 5 2 4 5 3 2 5 2'.split()
    assert total('fifo', '3', *belady) == 9 and total('fifo', '4', *belady) == 10
    assert total('lru', '3', *belady) == 10
    assert total('fifo', '3', *b7) == 9 and total('lru', '3', *b7) == 7
    r = subprocess.run([str(sim), 'opt', '3', '1'], capture_output=True)
    assert r.returncode == 1, 'algoritmo invalido deveria falhar'
    print('Simulador: Belady FIFO 9 -> 10, LRU 10; B7 FIFO 9, LRU 7; entrada invalida rejeitada.')


CHECAGENS = {'un03': checar_un03}


if __name__ == '__main__':
    verificar(sys.argv[1] if len(sys.argv) > 1 else 'un02')
