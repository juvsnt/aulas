"""Validador automatizado para as praticas de SO (Trilha: Por dentro do servidor).
Executa os blocos de comando extraidos dos HTMLs em pastas temporarias.
Requer Linux x86-64, Bash, GCC, Pthreads e Python 3.
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
            if '\n' in self.text or self.text.startswith(('./', 'gcc ', 'stat ')):
                self.blocks.append(self.text)
            self.active = False
        if tag == 'pre': self.pre -= 1

def run(args, cwd):
    return subprocess.run(args, cwd=cwd, text=True, capture_output=True,
                          timeout=30, check=True).stdout

with tempfile.TemporaryDirectory(prefix='so-servidor-') as tmp:
    base = Path(tmp)
    for unit in ['un01', 'un02', 'un03', 'un04', 'un05']:
        cwd = base / unit
        cwd.mkdir()
        parser = Commands()
        parser.feed((ROOT / unit / 'index.html').read_text(encoding='utf-8'))
        for block in parser.blocks:
            code = block.replace(f'~/atividades/so-servidor/{unit}', str(cwd))
            run(['bash', '-e', '-c', code], cwd)
        print(f'{unit}: todos os blocos executados com sucesso ({len(parser.blocks)} blocos)')

    # Assercoes dos resultados de cada subsistema:
    # U01: Syscalls e 404
    out_u1 = run(['./servidor_basico'], base / 'un01')
    assert "open('pagina_inexistente.html'): Retorno = -1" in out_u1
    assert "HTTP 404 Not Found" in out_u1

    # U02: Fork/Exec e Mutex
    out_fork = run(['./servidor_fork'], base / 'un02')
    assert "Conexoes no Pai continuam intactas: 1" in out_fork
    assert "Processo filho terminou com status de saida = 0" in out_fork

    out_likes = run(['./contador_likes', 'com_mutex'], base / 'un02')
    assert "Total REAL computado no servidor: 100000 curtidas" in out_likes

    out_fcfs = run(['./escalonador_web', 'fcfs'], base / 'un02')
    assert "Tempo medio de espera: 4.33 segundos" in out_fcfs

    # U03: Memoria Virtual, Traducao e Cache
    out_trad = run(['./traducao_paginas', '14000'], base / 'un03')
    assert "PAGE FAULT" in out_trad

    out_lru = run(['./cache_paginas', 'lru'], base / 'un03')
    assert "Faltas de pagina: 5 | Hits em RAM: 1" in out_lru

    # U04: Inodes e Blocos
    out_blocos = run(['./disco_blocos', '10000'], base / 'un04')
    assert "Fragmentacao Interna:       2288 bytes" in out_blocos
    assert (base / 'un04' / 'config_segura.dat').exists()
    assert (base / 'un04' / 'atalho_site.html').is_symlink()

    # U05: Buffers de E/S
    assert (base / 'un05' / 'logs_buffer.txt').exists()
    assert (base / 'un05' / 'logs_direto.txt').exists()

    # Casos de fronteira e equivalencia dos registros de E/S.
    for endereco, esperado in [('4095', 'VPN): 0'), ('4096', 'VPN): 1'),
                               ('-1', 'ACESSO INVALIDO'), ('16384', 'ACESSO INVALIDO')]:
        assert esperado in run(['./traducao_paginas', endereco], base / 'un03')
    for tamanho, sobra in [('8192', '0 bytes'), ('8193', '4095 bytes')]:
        assert f"Fragmentacao Interna:       {sobra}" in run(['./disco_blocos', tamanho], base / 'un04')
    assert (base / 'un05' / 'logs_buffer.txt').read_bytes() == (base / 'un05' / 'logs_direto.txt').read_bytes()

    # Integridade do pacote ZIP
    zip_path = ROOT / 'arquivos' / 'so-servidor-fontes.zip'
    assert zip_path.exists(), "Arquivo zip nao encontrado!"
    with zipfile.ZipFile(zip_path, 'r') as z:
        names = z.namelist()
        for font in ['servidor_basico.c', 'servidor_fork.c', 'escalonador_web.c',
                     'contador_likes.c', 'memoria_servidor.c', 'traducao_paginas.c',
                     'cache_paginas.c', 'disco_blocos.c', 'logs_buffer.c']:
            assert font in names, f"Fonte {font} faltando no zip!"
            assert z.read(font) == (ROOT / 'arquivos' / font).read_bytes(), font

    # Campos pedagogicos e fontes colados nos roteiros.
    import re
    import html
    ids_praticas = set()
    for page in [*ROOT.glob('un*/index.html'), ROOT / 'sintese/index.html']:
        content = page.read_text(encoding='utf-8')
        for pratica in re.findall(r'<section class="etapa" id="(p\d+)">', content):
            ids_praticas.add(pratica)
            for suffix in ['previsao', 'evidencias']:
                assert f'id="{pratica}-{suffix}"' in content
                assert f'for="{pratica}-{suffix}"' in content
        for name, source in re.findall(r"cat &gt; (\w+\.c) &lt;&lt;'FIM'\n(.*?)\nFIM", content, re.S):
            assert html.unescape(source).strip() == (ROOT / 'arquivos' / name).read_text().strip(), name
    assert len(ids_praticas) == 14

print("\n>>> SUCESSO TOTAL: Todos os roteiros, programas em C e asserções de SO foram validados! <<<")
