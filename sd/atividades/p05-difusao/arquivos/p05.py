#!/usr/bin/env python3
"""p05.py - P05 de Sistemas Distribuidos: difusao e comunicacao em grupo.

Uso: python3 p05.py ajuda

Cada participante (A, B, C, D...) e um PROCESSO independente do Linux.
Os processos trocam mensagens por sockets Unix de datagramas (AF_UNIX)
dentro da pasta privada do aluno. Isso e comunicacao real entre processos
na MESMA maquina: nao e rede, nao e TCP/IP e nao e multicast IP.

Somente biblioteca padrao do Python 3. Sem sudo, sem portas de rede e sem
servicos permanentes: cada comando cria os processos, espera o resultado,
encerra todos e apaga os sockets. O estado da atividade (participantes
indisponiveis, ultima mensagem, mensagens ja recebidas) fica em
~/atividades/sd-p05/.p05/ com permissao 700 (so o dono acessa).

UNEMAT - Campus de Alto Araguaia - Prof. Me. Juvenal Silva Neto
"""
import fcntl
import json
import os
import select
import shutil
import signal
import socket
import sys
import time
from datetime import datetime

VERSAO = '1.0'
PASTA = os.path.expanduser(os.environ.get('P05_PASTA', '~/atividades/sd-p05'))
PRIV = os.path.join(PASTA, '.p05')
ARQ_ESTADO = os.path.join(PRIV, 'estado.json')
ARQ_TRAVA = os.path.join(PRIV, 'trava')

GRUPO = ['A', 'B', 'C', 'D']                         # grupo dos experimentos 1 a 4
DESTINOS_CUSTO = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']  # ate 8 destinatarios
MAX_TEXTO = 60          # caracteres por mensagem
MAX_HIST = 100          # registros guardados para "evidencias"
ESPERA_CONF = 1.0       # segundos que o emissor espera confirmacoes
VIDA_MAX = 8.0          # segundos maximos de vida de um participante
LIMITE_CMD = 25         # segundos maximos de um comando inteiro

# Experimento 4: atraso fixo de cada canal (segundos) e instante de envio.
ATRASOS = {('A', 'B'): 0.2, ('A', 'C'): 0.8, ('D', 'B'): 0.8, ('D', 'C'): 0.2}
PARTIDA = {'A': 0.0, 'D': 0.1}


class Erro(Exception):
    """Erro esperado: mostrado ao aluno sem rastreamento do Python."""


def num(n):
    return f'{n:03d}'


def seg(x):
    return f'{x:.1f}'.replace('.', ',')


# ---------------------------------------------------------------- estado

def preparar_pasta():
    os.makedirs(PASTA, exist_ok=True)
    if os.path.islink(PRIV):
        raise Erro(f'{PRIV} é um link simbólico; remova-o e tente de novo.')
    os.makedirs(PRIV, mode=0o700, exist_ok=True)
    os.chmod(PRIV, 0o700)


def travar():
    """Uma execucao por vez nesta conta (duas abas do terminal, por exemplo)."""
    fd = os.open(ARQ_TRAVA, os.O_RDWR | os.O_CREAT, 0o600)
    limite = time.monotonic() + 10
    while True:
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            return fd
        except BlockingIOError:
            if time.monotonic() > limite:
                raise Erro('Outro comando da P05 está em execução nesta conta.\n'
                           'Espere ele terminar e tente de novo.')
            time.sleep(0.2)


def estado_novo():
    return {'versao': 1, 'proximo': 1, 'indisponiveis': [], 'ultima': None,
            'recebidas': {}, 'historico': [], 'feitos': []}


def carregar():
    try:
        with open(ARQ_ESTADO, encoding='utf-8') as f:
            e = json.load(f)
        if not isinstance(e, dict) or e.get('versao') != 1:
            raise ValueError
        return e
    except FileNotFoundError:
        return estado_novo()
    except (ValueError, OSError):
        print('Aviso: estado anterior ilegível; recomeçando do zero.')
        return estado_novo()


def salvar(e):
    e['historico'] = e['historico'][-MAX_HIST:]
    tmp = ARQ_ESTADO + '.tmp'
    with open(os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600), 'w', encoding='utf-8') as f:
        json.dump(e, f, ensure_ascii=False)
    os.replace(tmp, ARQ_ESTADO)


def registrar(e, feito, linha):
    e['historico'].append(linha)
    if feito and feito not in e['feitos']:
        e['feitos'].append(feito)


def limpar_rodadas_antigas():
    # Com a trava obtida, nenhuma outra rodada desta conta esta ativa.
    for nome in os.listdir(PRIV):
        if nome.startswith('r') and nome[1:].isdigit():
            shutil.rmtree(os.path.join(PRIV, nome), ignore_errors=True)


# ---------------------------------------------------------------- processos

class Rodada:
    """Uma execucao: cria processos participantes, coleta registros e limpa."""

    def __init__(self):
        self.dir = os.path.join(PRIV, f'r{os.getpid()}')
        shutil.rmtree(self.dir, ignore_errors=True)
        os.mkdir(self.dir, 0o700)
        if len(self.endereco('A-B')) > 100:
            raise Erro('Caminho da pasta longo demais para sockets Unix.')
        self.filhos = []
        self.recolhidos = set()
        self.eventos = []
        self.obs = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
        self.obs.bind(self.endereco('_observador'))
        self.t0 = time.monotonic()

    def endereco(self, nome):
        return os.path.join(self.dir, nome + '.sock')

    def iniciar(self, funcao, *args):
        """Cria um processo filho independente que executa funcao(self, *args)."""
        sys.stdout.flush()
        pid = os.fork()
        if pid == 0:
            codigo = 0
            try:
                signal.signal(signal.SIGINT, signal.SIG_IGN)
                signal.signal(signal.SIGALRM, signal.SIG_DFL)
                signal.alarm(int(VIDA_MAX) + 2)   # rede de seguranca
                self.obs.close()
                funcao(self, *args)
            except BaseException:
                codigo = 1
            finally:
                os._exit(codigo)
        self.filhos.append(pid)
        return pid

    def relatar(self, **ev):
        """Chamado nos filhos: envia um registro ao observador (o comando)."""
        ev['tm'] = time.monotonic()
        s = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
        try:
            s.sendto(json.dumps(ev).encode(), self.endereco('_observador'))
        except OSError:
            pass
        finally:
            s.close()

    def drenar(self, espera):
        self.obs.settimeout(espera)
        while True:
            try:
                dados = self.obs.recv(8192)
            except (socket.timeout, BlockingIOError):
                return
            try:
                ev = json.loads(dados)
                ev['t'] = round(ev.get('tm', self.t0) - self.t0, 3)
                self.eventos.append(ev)
            except ValueError:
                pass
            self.obs.settimeout(0)

    def esperar(self, pids, limite):
        fim = time.monotonic() + limite
        vivos = [p for p in pids if p not in self.recolhidos]
        while vivos and time.monotonic() < fim:
            self.drenar(0.05)
            for pid in list(vivos):
                try:
                    pronto, _ = os.waitpid(pid, os.WNOHANG)
                except ChildProcessError:
                    pronto = pid
                if pronto:
                    self.recolhidos.add(pid)
                    vivos.remove(pid)
        self.drenar(0.05)
        return not vivos

    def esperar_prontos(self, leitura, n, limite=4.0):
        lidos, fim = 0, time.monotonic() + limite
        while lidos < n:
            resto = fim - time.monotonic()
            if resto <= 0:
                raise Erro('Os participantes não iniciaram a tempo. Tente de novo.')
            r, _, _ = select.select([leitura], [], [], resto)
            if r:
                dados = os.read(leitura, 64)
                if not dados:
                    raise Erro('Um participante terminou antes de iniciar.')
                lidos += len(dados)

    def avisar_fim(self, nomes):
        s = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
        for nome in nomes:
            try:
                s.sendto(b'{"tipo": "fim"}', self.endereco(nome))
            except OSError:
                pass
        s.close()

    def encerrar(self):
        """Sempre executado: nenhum processo ou socket da rodada sobrevive."""
        pendentes = [p for p in self.filhos if p not in self.recolhidos]
        for sinal in (signal.SIGTERM, signal.SIGKILL):
            for pid in pendentes:
                try:
                    os.kill(pid, sinal)
                except ProcessLookupError:
                    pass
            fim = time.monotonic() + 1
            while pendentes and time.monotonic() < fim:
                for pid in list(pendentes):
                    try:
                        pronto, _ = os.waitpid(pid, os.WNOHANG)
                    except ChildProcessError:
                        pronto = pid
                    if pronto:
                        pendentes.remove(pid)
                time.sleep(0.02)
        self.obs.close()
        shutil.rmtree(self.dir, ignore_errors=True)


def participante(r, nome, ja_recebidas, deduplicar, pronto):
    """Processo de um membro do grupo: recebe, registra e confirma."""
    s = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
    s.bind(r.endereco(nome))
    os.write(pronto, b'1')
    vistas, chegada = set(ja_recebidas), 0
    fim = time.monotonic() + VIDA_MAX
    while True:
        resto = fim - time.monotonic()
        if resto <= 0:
            break
        s.settimeout(resto)
        try:
            dados, origem = s.recvfrom(4096)
        except socket.timeout:
            break
        try:
            m = json.loads(dados)
        except ValueError:
            continue
        if m.get('tipo') == 'fim':
            break
        if m.get('tipo') != 'dados':
            continue
        chegada += 1
        repetida = m['id'] in vistas
        vistas.add(m['id'])
        r.relatar(ev='recebeu', no=nome, id=m['id'], de=m['de'], texto=m.get('texto', ''),
                  repetida=repetida, descartada=repetida and deduplicar, ordem=chegada)
        if m.get('confirmar') and origem:
            try:
                s.sendto(json.dumps({'tipo': 'conf', 'id': m['id'], 'de': nome}).encode(), origem)
                r.relatar(ev='confirmou', no=nome, id=m['id'], para=m['de'])
            except OSError:
                pass


def emissor(r, nome, msg, destinos):
    """Processo emissor: envia uma copia a cada destino e espera confirmacoes."""
    s = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
    s.bind(r.endereco(nome))
    aguardando = []
    for d in destinos:
        dados = json.dumps({'tipo': 'dados', 'id': msg['id'], 'de': nome,
                            'texto': msg['texto'], 'confirmar': True}).encode()
        try:
            s.sendto(dados, r.endereco(d))
            r.relatar(ev='enviou', no=nome, id=msg['id'], para=d)
            aguardando.append(d)
        except (FileNotFoundError, ConnectionRefusedError):
            r.relatar(ev='falhou', no=nome, id=msg['id'], para=d)
    fim = time.monotonic() + ESPERA_CONF
    while aguardando and time.monotonic() < fim:
        s.settimeout(max(0.01, fim - time.monotonic()))
        try:
            dados, _ = s.recvfrom(4096)
        except socket.timeout:
            break
        m = json.loads(dados)
        if m.get('tipo') == 'conf' and m.get('de') in aguardando:
            aguardando.remove(m['de'])
            r.relatar(ev='conf_recebida', no=nome, de=m['de'], id=m['id'])


def distribuidor(r, nome, destinos, pronto):
    """Processo S: recebe uma mensagem de A e encaminha uma copia a cada destino."""
    s = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
    s.bind(r.endereco(nome))
    os.write(pronto, b'1')
    s.settimeout(VIDA_MAX)
    dados, origem = s.recvfrom(4096)
    m = json.loads(dados)
    aguardando = []
    for d in destinos:
        copia = json.dumps({'tipo': 'dados', 'id': m['id'], 'de': nome,
                            'texto': m['texto'], 'confirmar': True}).encode()
        s.sendto(copia, r.endereco(d))
        r.relatar(ev='enviou', no=nome, id=m['id'], para=d)
        aguardando.append(d)
    fim = time.monotonic() + ESPERA_CONF
    while aguardando and time.monotonic() < fim:
        s.settimeout(max(0.01, fim - time.monotonic()))
        try:
            resposta, _ = s.recvfrom(4096)
        except socket.timeout:
            break
        c = json.loads(resposta)
        if c.get('tipo') == 'conf' and c.get('de') in aguardando:
            aguardando.remove(c['de'])
            r.relatar(ev='conf_recebida', no=nome, de=c['de'], id=c['id'])
    if origem:
        s.sendto(json.dumps({'tipo': 'conf', 'id': m['id'], 'de': nome}).encode(), origem)
        r.relatar(ev='confirmou', no=nome, id=m['id'], para=m['de'])


def canal(r, origem, destino, atraso, pronto):
    """Processo que representa o enlace origem->destino com atraso fixo."""
    s = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
    s.bind(r.endereco(f'{origem}-{destino}'))
    os.write(pronto, b'1')
    s.settimeout(VIDA_MAX)
    dados = s.recv(4096)
    time.sleep(atraso)
    s.sendto(dados, r.endereco(destino))


def emissor_ordem(r, nome, msg, destinos, partida):
    time.sleep(partida)
    s = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
    dados = json.dumps({'tipo': 'dados', 'id': msg['id'], 'de': nome,
                        'texto': msg['texto'], 'confirmar': False}).encode()
    r.relatar(ev='enviou', no=nome, id=msg['id'], para=','.join(destinos))
    for d in destinos:
        s.sendto(dados, r.endereco(f'{nome}-{d}'))


# ---------------------------------------------------------------- cenarios

def rodar_envio(membros, de, destinos, msg, ja_recebidas, deduplicar=False, via=None):
    """Inicia os membros disponiveis, executa o envio e devolve os registros."""
    r = Rodada()
    try:
        leitura, escrita = os.pipe()
        receptores = [n for n in membros if n != de]
        for n in receptores:
            r.iniciar(participante, n, ja_recebidas.get(n, []), deduplicar, escrita)
        pid_via = r.iniciar(distribuidor, via, destinos, escrita) if via else None
        r.esperar_prontos(leitura, len(receptores) + (1 if via else 0))
        os.close(leitura)
        os.close(escrita)
        if via:
            pid = r.iniciar(emissor, de, msg, [via])
        else:
            pid = r.iniciar(emissor, de, msg, destinos)
        r.esperar([pid], ESPERA_CONF * 3 + 2)
        if pid_via:
            r.esperar([pid_via], ESPERA_CONF * 2 + 1)
        r.avisar_fim(receptores)
        r.esperar(r.filhos, 3)
        return r.eventos
    finally:
        r.encerrar()


def disponiveis(e):
    return [n for n in GRUPO if n not in e['indisponiveis']]


def mostrar_envio(e, ev, de, destinos, msg):
    i = msg['id']
    for d in destinos:
        if any(x['ev'] == 'enviou' and x['para'] == d for x in ev):
            print(f'[{de}] enviou {i} para [{d}]')
        elif any(x['ev'] == 'falhou' and x['para'] == d for x in ev):
            print(f'[{de}] falhou ao enviar {i} para [{d}]')
            print(f'    ({d} não está em execução)')
    entregas = repetidas = descartadas = 0
    for n in GRUPO:
        if n == de:
            continue
        rec = [x for x in ev if x['ev'] == 'recebeu' and x['no'] == n and x['id'] == i]
        if not rec:
            situacao = 'indisponível, ' if n in e['indisponiveis'] else ''
            print(f'[{n}] {situacao}nada recebeu')
            continue
        x = rec[0]
        if x['descartada']:
            descartadas += 1
            print(f'[{n}] descartou {i} (já recebida)')
        elif x['repetida']:
            entregas += 1
            repetidas += 1
            print(f'[{n}] recebeu {i} de novo: DUPLICATA')
        else:
            entregas += 1
            print(f'[{n}] recebeu {i}: {x["texto"]}')
    confs = sorted(x['de'] for x in ev if x['ev'] == 'conf_recebida' and x['no'] == de)
    sem = [d for d in destinos if d not in confs]
    dados = sum(1 for x in ev if x['ev'] == 'enviou')
    falhas = sum(1 for x in ev if x['ev'] == 'falhou')
    print(f'[{de}] confirmações: {", ".join(confs) if confs else "nenhuma"}')
    if sem:
        print(f'Sem confirmação: {", ".join(sem)}')
    print(f'Destinatários: {len(destinos)}')
    print(f'Mensagens de dados: {dados}')
    if falhas:
        print(f'Falhas de envio: {falhas}')
    print(f'Entregas: {entregas} | Confirmações: {len(confs)}')
    if repetidas:
        print(f'Duplicatas processadas: {repetidas}')
    if descartadas:
        print(f'Duplicatas descartadas: {descartadas}')
    return {'entregas': entregas, 'confs': confs, 'sem': sem, 'dados': dados,
            'repetidas': repetidas, 'descartadas': descartadas}


def guardar_recebidas(e, ev):
    for x in ev:
        if x['ev'] == 'recebeu':
            lista = e['recebidas'].setdefault(x['no'], [])
            if x['id'] not in lista:
                lista.append(x['id'])


def nova_mensagem(e, texto):
    msg = {'id': num(e['proximo']), 'texto': texto}
    e['proximo'] += 1
    return msg


# ---------------------------------------------------------------- comandos

def opcoes(args, com_valor=(), sem_valor=()):
    o, i = {}, 0
    while i < len(args):
        a = args[i]
        if a in com_valor:
            if i + 1 >= len(args):
                raise Erro(f'Faltou o valor depois de {a}.')
            o[a] = args[i + 1]
            i += 2
        elif a in sem_valor:
            o[a] = True
            i += 1
        else:
            raise Erro(f'Opção desconhecida: {a}\nVeja: python3 p05.py ajuda')
    return o


def membro(o, chave, obrigatorio=True):
    if chave not in o:
        if obrigatorio:
            raise Erro(f'Informe {chave}. Exemplo: {chave} B')
        return None
    nome = o[chave].strip().upper()
    if nome not in GRUPO:
        raise Erro(f'{chave} {o[chave]}: use um destes: {", ".join(GRUPO)}.')
    return nome


def texto_valido(o):
    texto = o.get('--mensagem', '').strip()
    if not texto:
        raise Erro('Informe --mensagem "texto" (entre aspas).')
    if len(texto) > MAX_TEXTO or not texto.isprintable():
        raise Erro(f'Mensagem com até {MAX_TEXTO} caracteres, sem símbolos de controle.')
    return texto


def exigir_disponivel(e, nome):
    if nome in e['indisponiveis']:
        raise Erro(f'{nome} está indisponível. Recupere com:\n'
                   f'python3 p05.py recuperar --no {nome}')


def cmd_unicast(e, args):
    o = opcoes(args, ('--de', '--para', '--mensagem'))
    de, para, texto = membro(o, '--de'), membro(o, '--para'), texto_valido(o)
    if de == para:
        raise Erro('Origem e destino precisam ser diferentes.')
    exigir_disponivel(e, de)
    msg = nova_mensagem(e, texto)
    print(f'UNICAST: {de} -> {para}')
    ev = rodar_envio(disponiveis(e), de, [para], msg, e['recebidas'])
    res = mostrar_envio(e, ev, de, [para], msg)
    guardar_recebidas(e, ev)
    e['ultima'] = {'id': msg['id'], 'de': de, 'texto': texto, 'destinos': [para],
                   'sem': res['sem']}
    registrar(e, 'unicast', f'unicast {msg["id"]} {de}->{para}: {res["entregas"]} entrega')


def cmd_difundir(e, args):
    o = opcoes(args, ('--de', '--mensagem'))
    de, texto = membro(o, '--de'), texto_valido(o)
    exigir_disponivel(e, de)
    destinos = [n for n in GRUPO if n != de]
    msg = nova_mensagem(e, texto)
    print(f'DIFUSÃO: de {de} para {", ".join(destinos)}')
    print(f'[{de}] iniciou difusão da mensagem {msg["id"]}')
    ev = rodar_envio(disponiveis(e), de, destinos, msg, e['recebidas'])
    res = mostrar_envio(e, ev, de, destinos, msg)
    guardar_recebidas(e, ev)
    e['ultima'] = {'id': msg['id'], 'de': de, 'texto': texto, 'destinos': destinos,
                   'sem': res['sem']}
    falhas = f', sem conf. {",".join(res["sem"])}' if res['sem'] else ''
    registrar(e, 'falha' if res['sem'] else 'difusao',
              f'difusão {msg["id"]}: {res["entregas"]}/{len(destinos)} entregas{falhas}')


def cmd_falha(e, args):
    nome = membro(opcoes(args, ('--no',)), '--no')
    if nome not in e['indisponiveis']:
        e['indisponiveis'].append(nome)
    print(f'[{nome}] agora está INDISPONÍVEL.')
    print('O processo dele não será iniciado nas')
    print('próximas mensagens, até você usar:')
    print(f'python3 p05.py recuperar --no {nome}')
    registrar(e, None, f'falha: {nome} indisponível')


def cmd_recuperar(e, args):
    nome = membro(opcoes(args, ('--no',)), '--no')
    if nome in e['indisponiveis']:
        e['indisponiveis'].remove(nome)
        print(f'[{nome}] voltou a ficar disponível.')
    else:
        print(f'[{nome}] já estava disponível.')
    registrar(e, None, f'recuperar: {nome} disponível')


def cmd_reenviar(e, args):
    o = opcoes(args, (), ('--ultima', '--dedup', '--pendentes'))
    if '--ultima' not in o:
        raise Erro('Use: python3 p05.py reenviar --ultima')
    u = e.get('ultima')
    if not u:
        raise Erro('Ainda não há mensagem para reenviar.\nEnvie uma com unicast ou difundir.')
    exigir_disponivel(e, u['de'])
    destinos = u['sem'] if '--pendentes' in o else u['destinos']
    if not destinos:
        print(f'Nenhum destino pendente para {u["id"]}.')
        return
    dedup = '--dedup' in o
    msg = {'id': u['id'], 'texto': u['texto']}
    modo = 'com' if dedup else 'sem'
    print(f'REENVIO de {u["id"]} para {", ".join(destinos)}')
    print(f'({modo} deduplicação nos destinos)')
    ev = rodar_envio(disponiveis(e), u['de'], destinos, msg, e['recebidas'], deduplicar=dedup)
    res = mostrar_envio(e, ev, u['de'], destinos, msg)
    guardar_recebidas(e, ev)
    u['sem'] = res['sem']
    extra = f', descartadas {res["descartadas"]}' if dedup else f', duplicatas {res["repetidas"]}'
    registrar(e, 'reenvio_dedup' if dedup else 'reenvio',
              f'reenvio {u["id"]} {modo} dedup: {res["entregas"]} entregas{extra}')


def cmd_ordem(e, args):
    opcoes(args)
    for n in GRUPO:
        exigir_disponivel(e, n)
    mx, my = nova_mensagem(e, 'X'), nova_mensagem(e, 'Y')
    msgs = {'A': mx, 'D': my}
    print('ORDEM: 2 emissores, 2 receptores')
    print('Atraso fixo de cada canal:')
    print(f'  A->B {seg(ATRASOS["A", "B"])} s   A->C {seg(ATRASOS["A", "C"])} s')
    print(f'  D->B {seg(ATRASOS["D", "B"])} s   D->C {seg(ATRASOS["D", "C"])} s')
    r = Rodada()
    try:
        leitura, escrita = os.pipe()
        for n in ('B', 'C'):
            r.iniciar(participante, n, [], False, escrita)
        for (o, d), atraso in ATRASOS.items():
            r.iniciar(canal, o, d, atraso, escrita)
        r.esperar_prontos(leitura, 6)
        os.close(leitura)
        os.close(escrita)
        r.t0 = time.monotonic()
        envios = [r.iniciar(emissor_ordem, n, msgs[n], ['B', 'C'], PARTIDA[n]) for n in ('A', 'D')]
        r.esperar(envios, 3)
        fim = time.monotonic() + 3
        while time.monotonic() < fim:
            r.drenar(0.05)
            if sum(1 for x in r.eventos if x['ev'] == 'recebeu') >= 4:
                break
        r.avisar_fim(['B', 'C'])
        r.esperar(r.filhos, 3)
        ev = r.eventos
    finally:
        r.encerrar()
    print('Envio:')
    for pos, n in enumerate(('A', 'D'), 1):
        print(f'  {pos}º [{n}] envia {msgs[n]["id"]} (t={seg(PARTIDA[n])} s)')
    print('Chegada (t medido):')
    ordens = {}
    for n in ('B', 'C'):
        rec = sorted((x for x in ev if x['ev'] == 'recebeu' and x['no'] == n),
                     key=lambda x: x['ordem'])
        ordens[n] = [x['id'] for x in rec]
        partes = '  '.join(f'{x["id"]} ({seg(x["t"])} s)' for x in rec)
        print(f'  [{n}] {partes}')
    for n in ('B', 'C'):
        print(f'Ordem em [{n}]: {", ".join(ordens[n])}')
    if ordens['B'] != ordens['C']:
        print('Resultado: B e C viram ordens')
        print('diferentes para as mesmas mensagens.')
    else:
        print('Resultado: B e C viram a mesma ordem.')
    registrar(e, 'ordem', f'ordem: B={",".join(ordens["B"])} C={",".join(ordens["C"])}')


def medir_custo(n, via):
    destinos = DESTINOS_CUSTO[:n]
    msg = {'id': 'T', 'texto': 'teste de custo'}
    membros = ['A'] + destinos
    ev = rodar_envio(membros, 'A', destinos, msg, {}, via=via)
    entregas = sum(1 for x in ev if x['ev'] == 'recebeu')
    dados_a = sum(1 for x in ev if x['ev'] == 'enviou' and x['no'] == 'A')
    dados_s = sum(1 for x in ev if x['ev'] == 'enviou' and x['no'] == 'S')
    confs = sum(1 for x in ev if x['ev'] == 'confirmou')
    return entregas, dados_a, dados_s, confs


def cmd_custo(e, args):
    o = opcoes(args, ('--tamanhos',))
    try:
        tamanhos = [int(x) for x in o.get('--tamanhos', '3,6').split(',')]
    except ValueError:
        raise Erro('Use --tamanhos com números separados por vírgula, ex.: 3,6')
    if not 1 <= len(tamanhos) <= 4 or any(not 1 <= t <= len(DESTINOS_CUSTO) for t in tamanhos):
        raise Erro(f'Tamanhos de 1 a {len(DESTINOS_CUSTO)}, no máximo 4 valores.')
    print('CUSTO DA DIFUSÃO (medido)')
    print('Grupo de teste: todos disponíveis.')
    print('1) Cópias individuais (A -> cada um)')
    print(' Dest  Dados  Conf  Total')
    resumo = []
    diretas = {}
    for t in tamanhos:
        entregas, dados, _, confs = medir_custo(t, None)
        if entregas != t:
            print(f'  aviso: {entregas} de {t} entregas')
        diretas[t] = dados + confs
        print(f' {t:>4}  {dados:>5}  {confs:>4}  {dados + confs:>5}')
        resumo.append(f'{t}->{dados + confs}')
    print('2) Com distribuidor S (A -> S -> cada)')
    print(' Dest  A->S  S->dest  Conf  Total')
    for t in tamanhos:
        entregas, dados_a, dados_s, confs = medir_custo(t, 'S')
        if entregas != t:
            print(f'  aviso: {entregas} de {t} entregas')
        total = dados_a + dados_s + confs
        print(f' {t:>4}  {dados_a:>4}  {dados_s:>7}  {confs:>4}  {total:>5}')
    print('Dados = mensagens com o conteúdo;')
    print('Conf = confirmações de recebimento.')
    registrar(e, 'custo', 'custo (dest->total): ' + ' '.join(resumo))


def cmd_estado(e, args):
    opcoes(args)
    indisp = e['indisponiveis']
    print(f'Grupo: {", ".join(GRUPO)}')
    print(f'Indisponíveis: {", ".join(indisp) if indisp else "nenhum"}')
    u = e.get('ultima')
    if u:
        print(f'Última mensagem: {u["id"]} de {u["de"]}')
        print(f'  para: {", ".join(u["destinos"])}')
        if u['sem']:
            print(f'  sem confirmação: {", ".join(u["sem"])}')
    print(f'Próxima mensagem: {num(e["proximo"])}')


ETAPAS = [('unicast', 'Exp. 1 unicast'), ('difusao', 'Exp. 2 difusão'),
          ('falha', 'Exp. 3 difusão com falha'), ('reenvio', 'Exp. 3 reenvio'),
          ('ordem', 'Exp. 4 ordem'), ('custo', 'Etapa 5 custo')]


def cmd_evidencias(e, args):
    opcoes(args)
    print('EVIDÊNCIAS P05 - copie para a entrega')
    print(f'p05.py {VERSAO} - {datetime.now().strftime("%d/%m/%Y %H:%M")}')
    for i, linha in enumerate(e['historico'], 1):
        print(f'{i:>2}. {linha}')
    if not e['historico']:
        print('(nenhum experimento registrado ainda)')
    falta = [rotulo for chave, rotulo in ETAPAS if chave not in e['feitos']]
    print('Situação: completa' if not falta else 'Falta: ' + '; '.join(falta))


def cmd_reiniciar(e, args):
    opcoes(args)
    e.clear()
    e.update(estado_novo())
    print('Atividade reiniciada nesta conta.')
    print('Todos disponíveis; próxima mensagem: 001')


AJUDA = """P05 - difusão e comunicação em grupo
Uso: python3 p05.py COMANDO [opções]

Preparação:
  reiniciar   começa a atividade do zero
  estado      mostra o grupo e a última
              mensagem
Experimentos:
  unicast --de A --para B --mensagem "oi"
  difundir --de A --mensagem "oi"
  falha --no C       C fica indisponível
  recuperar --no C   C volta
  reenviar --ultima  reenvia a última
    --dedup          destinos descartam
                     as repetidas
    --pendentes      só para quem não
                     confirmou
  ordem              2 emissores e
                     2 receptores
  custo              grupos de 3 e 6
    --tamanhos 3,6,8
Entrega:
  evidencias  resumo para copiar

Grupo: A, B, C, D. Cada um é um processo.
Mensagens por socket Unix (mesma máquina):
não é rede nem multicast IP."""


COMANDOS = {'unicast': cmd_unicast, 'difundir': cmd_difundir, 'falha': cmd_falha,
            'recuperar': cmd_recuperar, 'reenviar': cmd_reenviar, 'ordem': cmd_ordem,
            'custo': cmd_custo, 'estado': cmd_estado, 'evidencias': cmd_evidencias,
            'reiniciar': cmd_reiniciar}


def tempo_esgotado(*_):
    raise Erro('Tempo limite do comando esgotado. Nada ficou em execução.')


def main(argv):
    if not argv or argv[0] in ('ajuda', 'help', '-h', '--help'):
        print(AJUDA)
        return 0
    comando = argv[0].lower()
    if comando not in COMANDOS:
        raise Erro(f'Comando desconhecido: {argv[0]}\nVeja: python3 p05.py ajuda')
    preparar_pasta()
    trava = travar()
    try:
        limpar_rodadas_antigas()
        e = carregar()
        signal.signal(signal.SIGALRM, tempo_esgotado)
        signal.alarm(LIMITE_CMD)
        try:
            COMANDOS[comando](e, argv[1:])
        finally:
            signal.alarm(0)
        salvar(e)
    finally:
        os.close(trava)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main(sys.argv[1:]))
    except Erro as erro:
        print(f'Erro: {erro}', file=sys.stderr)
        sys.exit(2)
    except KeyboardInterrupt:
        print('\nInterrompido. Nenhum processo da P05 ficou ativo.', file=sys.stderr)
        sys.exit(130)
