"""Valida a pagina da atividade executando os blocos como um aluno faria.
Ferramenta de manutencao docente; nao acessa o LIAC. Requer Linux, GCC,
pthreads, ps e (opcional) taskset.
Uso: python3 -I verificar.py un02|un03|un04|un04-codigo|un04-passos
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
        self.codigos = []      # codigo C para colar no editor (classe codigo-c): nao e comando
        self.eh_codigo = False
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
            self.eh_codigo = a.get('class') == 'codigo-c'

    def handle_data(self, data):
        if self.ativo: self.texto += data

    def handle_endtag(self, tag):
        if tag == 'code' and self.ativo:
            (self.codigos if self.eh_codigo else self.blocos).append(self.texto)
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
            corpo = bloco.split("<<'FIM'\n", 1)[1].removesuffix('\n# fim do bloco').removesuffix('FIM')
            assert corpo == (pasta / 'arquivos' / nome).read_text(), f'{nome} divergente'
            criados.add(nome)
    for corpo in p.codigos:
        nome = next((a.name for a in (pasta / 'arquivos').iterdir()
                     if a.read_text().rstrip('\n') == corpo), None)
        assert nome, 'codigo da pagina diferente de arquivos/'
        assert corpo.endswith('// fim do codigo'), f'{nome}: falta a linha final de comentario'
        criados.add(nome)
    if unidade == 'un04-passos':
        # Regra do professor: um comando por passo, sempre com comentario que absorve o '~'.
        for bloco in p.blocos:
            assert '\n' not in bloco and ' # ' in bloco, f'passo fora da regra: {bloco!r}'
    esperados = {a.name for a in (pasta / 'arquivos').iterdir()}
    assert criados == esperados, f'fontes fora da pagina: {esperados - criados}'
    print(f'{unidade}: {len(p.campos)} campos, {len(p.blocos)} blocos, fontes sincronizadas')

    # un04 mede blocos: precisa de disco real (ext4 da pasta pessoal), nao do tmpfs de /tmp.
    base = Path.home() if unidade.startswith('un04') else None
    with tempfile.TemporaryDirectory(prefix='so-atividade-', dir=base) as tmp:
        # Simula o terminal do LIAC, que gruda '~' no fim de cada bloco colado.
        sep = '~\n' if unidade.startswith('un04') else '\n'
        roteiro = sep.join(p.blocos).replace(f'~/atividades/so-{unidade}', tmp)
        if unidade == 'un04-passos':
            roteiro = roteiro.replace('~/atividades/so-arquivos', tmp)
            # O aluno cola o codigo no nano; aqui o arquivo e copiado de arquivos/.
            roteiro = re.sub(r'^nano -l (\S+).*$', lambda m: f"cp '{pasta}/arquivos/{m.group(1)}' .",
                             roteiro, flags=re.M)
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


def checar_un04(out, err, tmp):
    import os
    tudo = out + err
    negado = lambda alvo: re.search(rf"{re.escape(alvo)}[^\n]*(Permission denied|Permissão negada)", tudo)
    blocos = dict(re.findall(r'^(\w+)\s+tamanho=\d+\s+blocos=(\d+)', out, re.M))
    links = re.findall(r'^(b14000|outro_nome)\s+inode=(\d+)\s+links=(\d)\s+blocos=(\d+)', out, re.M)
    depois = out.split('[depois de fechar]')[1].split('total ')[0]
    verificacoes = [
        ('compilacao sem avisos', 'warning' not in err),
        ('A1 open devolve 3 e 4', 'open("dados.txt") devolveu FD 3' in out
                                  and 'open("copia.txt") devolveu FD 4' in out),
        ('A1 seek 10 e 20', 'posicao (seek) agora = 10' in out and 'posicao (seek) agora = 20' in out),
        ('A1 close libera 3 e 4', 'FD 3' not in depois and 'FD 4' not in depois),
        ('A1 copia identica', (Path(tmp) / 'copia.txt').read_bytes() == (Path(tmp) / 'dados.txt').read_bytes()),
        ('A1 redirecionamento FD 1', re.search(r' 1 -> \S*/fds\.txt$', out, re.M)),
        ('A2 000 bloqueia o dono', negado('cat: nota.txt') and 'segredo\n' in out),
        ('A2 script sem x', negado('ola.sh') and out.count('o script rodou') == 1),
        ('A2 sem x lista e nao abre', '== sem x (600) ==\na.txt\n' in out and negado('cat: cofre/a.txt')),
        ('A2 sem w nao cria/apaga', negado('cofre/novo.txt') and negado("cofre/a.txt'")),
        ('A2 sem w altera e sem r abre', out.count('alterado\n') == 2),
        ('A2 sem r nao lista', negado("'cofre'")),
        ('A2 cofre restaurado', (os.stat(Path(tmp) / 'cofre').st_mode & 0o777) == 0o700),
        ('A3 blocos 0/8/8/16/32', blocos == {'vazio': '0', 'b1': '8', 'b4096': '8',
                                             'b4097': '16', 'b14000': '32'}),
        ('A3 link fisico mesmo inode', len(links) == 3 and len({l[1] for l in links}) == 1
                                       and [l[2] for l in links] == ['2', '2', '1']
                                       and all(l[3] == '32' for l in links)),
        ('A3 filefrag 1 extent', 'outro_nome: 1 extent found' in out),
    ]
    falhas = [nome for nome, ok in verificacoes if not ok]
    assert not falhas, f'falhas: {falhas}\n{out}\n{err}'
    print(f'Roteiro executado: {len(verificacoes)} verificacoes OK')
    restantes = subprocess.run(['pgrep', '-u', str(os.getuid()), '-x', 'descritores'],
                               capture_output=True, text=True).stdout.split()
    assert not restantes, f'processos remanescentes: {restantes}'

    # Gabarito da Parte B recalculado (usado em professor.html).
    teto = lambda a, b: -(-a // b)
    assert (teto(10500, 4096), teto(10500, 4096) * 4096 - 10500, teto(10500, 4096) * 8) == (3, 1788, 24)
    assert (teto(10500, 1024), teto(10500, 1024) * 1024 - 10500) == (11, 764)
    assert divmod(9000, 1024) == (8, 808) and divmod(20000, 1024) == (19, 544) and 19 - 12 == 7
    assert (12 + 1024 // 4) * 1024 == 274432
    fat = {2: 9, 3: -1, 4: -1, 5: 0, 6: 0, 7: 14, 8: 0, 9: -1, 10: 0, 11: 0, 12: 7, 13: 0, 14: 3, 15: 0}
    cadeia, b = [], 12
    while b != -1:
        cadeia.append(b)
        b = fat[b]
    livres = [k for k, v in fat.items() if v == 0]
    assert cadeia == [12, 7, 14, 3] and livres == [5, 6, 8, 10, 11, 13, 15]
    mapa = '1100011110011110'
    assert [i for i, c in enumerate(mapa) if c == '1'] == [0, 1, 5, 6, 7, 8, 11, 12, 13, 14]
    assert mapa.find('1111') == 5
    print('Gabarito B3, B4, B6 e B7 conferido; nenhum processo da atividade ficou ativo.')


def checar_un04_codigo(out, err, tmp):
    import os
    t = Path(tmp)
    inodes = re.findall(r'--- resultado de (l?stat) ---\n  inode:\s+(\d+)\n  tipo:\s+([^\n]+)', out)
    verificacoes = [
        ('compilacao sem avisos', 'warning' not in err),
        ('I1 argv impresso', 'argc = 3 | argv[0] = ./copia | argv[1] = dados.txt | argv[2] = c1.txt' in out),
        ('I1 sem buffer: 37 antes do close', 'antes do close, o kernel ve 37 bytes em c1.txt' in out),
        ('I1 com buffer: 0 antes do fclose', 'antes do fclose, o kernel ve 0 bytes em c2.txt' in out),
        ('I1 com buffer: 37 depois', 'depois do fclose, o kernel ve 37 bytes' in out),
        ('I1 FD dentro do FILE*', 'por dentro, FD 3 e FD 4' in out),
        ('I1 copias identicas', (t / 'c1.txt').read_bytes() == (t / 'dados.txt').read_bytes()
                                == (t / 'c2.txt').read_bytes()),
        ('I1 grande: 8192 antes do fclose', 'antes do fclose, o kernel ve 8192 bytes em g2' in out),
        ('I1 argumento faltando', 'Uso: ./copia origem destino' in out),
        ('I2 stat x lstat', len(inodes) >= 2 and inodes[0][0] == 'stat' and inodes[1][0] == 'lstat'
                            and inodes[0][1] != inodes[1][1] and inodes[1][2] == 'link simbolico'),
        ('I2 chmod 640', 'rw-r----- (octal 640)' in out),
        ('I3 argc 1 e 2', 'argc = 1 | pasta escolhida = .' in out and 'argc = 2 | pasta escolhida = sub' in out),
        ('I3 sub com . e ..', '2 entradas lidas' in out),
        ('I4 links 2 -> 1', re.search(r'fisico\.txt\s+inode=(\d+)\s+links=2', out)
                            and re.search(r'fisico\.txt\s+inode=\d+\s+links=1', out)),
        ('I4 simbolico quebra e volta', 'ler fisico.txt -> 20 bytes' in out
                                        and 'outro conteudo\nconteudo do arquivo\n' in out),
        ('I5 shared grava', (t / 'texto.txt').read_text() == 'OLA, SISTEMAS OPERACIONAIS\n'),
        ('I5 private nao grava', (t / 'texto2.txt').read_text() == 'ola, de novo\n'),
    ]
    falhas = [nome for nome, ok in verificacoes if not ok]
    assert not falhas, f'falhas: {falhas}\n{out}\n{err}'
    print(f'Roteiro executado: {len(verificacoes)} verificacoes OK')
    restantes = subprocess.run(['pgrep', '-u', str(os.getuid()), '-x',
                                'copia|copia_buffer|metadados|lista|links|mapeia|mapeia2'],
                               capture_output=True, text=True).stdout.split()
    assert not restantes, f'processos remanescentes: {restantes}'
    print('Nenhum processo da atividade ficou ativo.')


def checar_un04_passos(out, err, tmp):
    import os
    t = Path(tmp)
    linhas = out.splitlines()
    inodes = re.findall(r'^(\d+) (copia\.txt|renomeada\.txt|nota\.txt)$', out, re.M)
    ino = {}
    for n, nome in inodes:
        ino.setdefault(nome, n)
    verificacoes = [
        ('compilacao sem avisos', 'warning' not in err and 'error' not in err),
        ('P1 docs absoluto', any(l == f'{tmp}/docs' for l in linhas)),
        ('P1 ls mostra pastas', 'docs\nprojetos\n' in out),
        ('P2 conteudo', out.count('segredo da turma') >= 3),
        ('P2 ls -l 17 bytes', re.search(r'^-rw-r--r-- 1 \S+ \S+ 17 .* nota\.txt$', out, re.M)),
        ('P2 stat inode', 'Inode:' in out or 'Index Node' in out),
        ('P2 cp muda inode', ino.get('nota.txt') and ino.get('copia.txt') and ino['nota.txt'] != ino['copia.txt']),
        ('P2 mv mantem inode', ino.get('renomeada.txt') == ino.get('copia.txt')),
        ('P2 rm', not (t / 'renomeada.txt').exists()),
        ('P3 600', re.search(r'^-rw------- .* nota\.txt$', out, re.M)),
        ('P3 000 negado', re.search(r"cat: nota\.txt: (Permission denied|Permissão negada)", err)),
        ('P4 FD 3', 'open devolveu o FD 3' in out and 'read leu 17 bytes' in out),
        ('P4 executavel', re.search(r'^-rwx.* ler$', out, re.M)),
        ('P4 /proc/self/fd', re.search(r' 0 -> ', out)),
        ('P4 FD -1 sem permissao', 'open devolveu o FD -1' in out),
        ('P4 permissao restaurada', (os.stat(t / 'nota.txt').st_mode & 0o777) == 0o644),
    ]
    falhas = [nome for nome, ok in verificacoes if not ok]
    assert not falhas, f'falhas: {falhas}\n{out}\n{err}'
    print(f'Roteiro executado: {len(verificacoes)} verificacoes OK')


CHECAGENS = {'un03': checar_un03, 'un04': checar_un04, 'un04-codigo': checar_un04_codigo,
             'un04-passos': checar_un04_passos}


if __name__ == '__main__':
    verificar(sys.argv[1] if len(sys.argv) > 1 else 'un02')
