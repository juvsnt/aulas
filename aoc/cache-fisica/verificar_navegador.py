#!/usr/bin/env python3
"""Mede dados reais e testa a pagina estatica, sem contas ou API de entrega."""
import argparse
import json
import os
import subprocess
import tempfile
import threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT=Path(__file__).resolve().parent


class Preview(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--playwright',required=True,type=Path,help='Caminho do modulo Playwright instalado fora do site')
    parser.add_argument('--browsers',type=Path,help='Pasta PLAYWRIGHT_BROWSERS_PATH')
    parser.add_argument('--bibliotecas',type=Path,help='Pasta opcional de bibliotecas locais do navegador, sem instalacao no sistema')
    parser.add_argument('--artefatos',type=Path,default=Path('/tmp/aoc-cache-qa/artefatos'))
    args=parser.parse_args()
    args.artefatos.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='aoc-cache-browser-') as temp:
        work=Path(temp)
        binary=work/'cache_lab'
        subprocess.run(['gcc','-std=c11','-O2','-Wall','-Wextra','-Wpedantic',str(ROOT/'public/arquivos/cache_lab.c'),'-o',str(binary)],check=True)
        outputs={}
        for name,command in [('inicial',['matriz','1024']),('mudanca',['matriz','512']),('cadeia',['cadeia']),('repeticao',['cadeia','inversa'])]:
            outputs[name]=subprocess.run([str(binary),*command],capture_output=True,text=True,check=True,timeout=45).stdout
        outputs['ambiente']=subprocess.run(['bash',str(ROOT/'public/arquivos/observar.sh')],capture_output=True,text=True,check=True).stdout
        fixture=work/'dados.json';fixture.write_text(json.dumps(outputs))
        handler=partial(Preview,directory=str(ROOT.parents[1]))
        server=ThreadingHTTPServer(('127.0.0.1',0),handler)
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        env=os.environ.copy()
        if args.browsers:env['PLAYWRIGHT_BROWSERS_PATH']=str(args.browsers)
        if args.bibliotecas:env['LD_LIBRARY_PATH']=str(args.bibliotecas)
        try:
            subprocess.run(['node',str(ROOT/'verificar-navegador.cjs'),str(args.playwright.resolve()),f'http://127.0.0.1:{server.server_port}',str(fixture),str(args.artefatos.resolve())],env=env,check=True)
        finally:
            server.shutdown();server.server_close();thread.join()


if __name__=='__main__':
    main()
