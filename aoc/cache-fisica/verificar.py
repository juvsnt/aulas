#!/usr/bin/env python3
"""Testes locais dos programas C e da gravacao de respostas por colagem no Bash."""
import json
import math
import re
import statistics
import subprocess
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class ExperimentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory(prefix='aoc-cache-c-')
        cls.work=Path(cls.temp.name)
        subprocess.run(['python3',str(ROOT/'construir.py')],check=True,capture_output=True)
        generated=(ROOT/'public/preparacao.js').read_text().split('window.AOC_SETUP = ',1)[1].rsplit(';',1)[0]
        setup=json.loads(generated).replace('~/atividades/aoc-cache-fisica',str(cls.work))
        subprocess.run(['bash','-eu','-o','pipefail','-c',setup],check=True,capture_output=True,text=True,timeout=30)

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def run_lab(self,*args,binary='cache_lab'):
        p=subprocess.run([str(self.work/binary),*args],capture_output=True,text=True,timeout=45)
        self.assertEqual(p.returncode,0,p.stderr)
        self.assertNotIn('runtime error',p.stderr)
        for val in re.findall(r'(?:mediana_parede_ms|ns_por_acesso_parede)=([\d.]+)',p.stdout):
            self.assertTrue(math.isfinite(float(val)) and float(val)>0)
        return p.stdout

    def test_generated_sources_and_package_are_exact(self):
        with zipfile.ZipFile(ROOT/'public/arquivos/cache-fisica-fontes.zip') as z:
            for name in ['cache_lab.c','observar.sh']:
                source=(ROOT/'public/arquivos'/name).read_bytes()
                self.assertEqual(source,(self.work/name).read_bytes())
                self.assertEqual(source,z.read(name))
        subprocess.run(['gcc','-std=c11','-O2','-Wall','-Wextra','-Wpedantic','-Werror',str(self.work/'cache_lab.c'),'-o',str(self.work/'strict')],check=True,capture_output=True)

    def test_matrix_sizes_checksums_and_actual_medians(self):
        for n in [256,512,1024,2048]:
            output=self.run_lab('matriz',str(n))
            expected=sum(i%97 for i in range(n*n))*4
            self.assertIn(f'soma={expected} esperado={expected} OK',output)
            for mode in ['linhas','colunas']:
                rounds=[float(v) for v in re.findall(mode+r'_ms=([\d.]+)',output)]
                self.assertEqual(len(rounds),5)
                median=float(re.search(r'RESUMO '+mode+r' \| mediana_parede_ms=([\d.]+)',output)[1])
                self.assertAlmostEqual(median,statistics.median(rounds),places=5)

    def test_chain_orders_and_undefined_behavior(self):
        for args,expected in [(('cadeia',),[8,32,256,2048,16384]),(('cadeia','inversa'),[16384,2048,256,32,8])]:
            output=self.run_lab(*args)
            sizes=[int(v) for v in re.findall(r'RESUMO (\d+)_KiB',output)]
            self.assertEqual(sizes,expected)
            self.assertEqual(output.count('ciclo_completo=OK'),5)
            for size in expected:
                rounds=[float(v) for v in re.findall(r'tamanho_KiB='+str(size)+r' \| parede_ms=([\d.]+)',output)]
                self.assertEqual(len(rounds),5)
                median=float(re.search(r'RESUMO '+str(size)+r'_KiB \| mediana_parede_ms=([\d.]+)',output)[1])
                self.assertAlmostEqual(median,statistics.median(rounds),places=5)
        subprocess.run(['gcc','-std=c11','-O2','-fsanitize=undefined','-fno-sanitize-recover=all',str(self.work/'cache_lab.c'),'-o',str(self.work/'ubsan')],check=True,capture_output=True)
        self.run_lab('matriz','512',binary='ubsan')
        self.run_lab('cadeia','inversa',binary='ubsan')

    def test_invalid_arguments_are_rejected(self):
        for args in [[],['matriz','0'],['matriz','-1'],['matriz','999999999999999999999'],['matriz','1024x'],['cadeia','outra']]:
            p=subprocess.run([str(self.work/'cache_lab'),*args],capture_output=True,text=True)
            self.assertEqual(p.returncode,1)
            self.assertIn('Uso:',p.stderr)


class FinalFileTests(unittest.TestCase):
    def command(self, content, activity='matriz'):
        script = "const fs=require('node:fs');const r=require(process.argv[1]);const p=JSON.parse(fs.readFileSync(0,'utf8'));process.stdout.write(r.comando(p.content,p.activity));"
        result = subprocess.run(['node','-e',script,str(ROOT/'public/relatorio.js')],input=json.dumps({'content':content,'activity':activity}),capture_output=True,text=True)
        return result

    def test_paste_writes_the_exact_final_text_for_both_activities(self):
        for activity in ['matriz','cadeia']:
            with tempfile.TemporaryDirectory(prefix='aoc-final-') as temp:
                content='VERSÃO FINAL — AOC\nExplicação com acentos: memória e comparação.'
                generated=self.command(content,activity)
                self.assertEqual(generated.returncode,0,generated.stderr)
                script=generated.stdout.replace('~/atividades/aoc-cache-fisica',temp)
                done=subprocess.run(['bash','-eu','-o','pipefail','-c',script],capture_output=True,text=True)
                self.assertEqual(done.returncode,0,done.stderr)
                self.assertEqual((Path(temp)/('entrega-'+activity+'.txt')).read_text(),content+'\n')
                self.assertIn('Arquivo final salvo na sua pasta do LIAC',done.stdout)
                self.assertNotIn('recebido pelo professor',done.stdout)

    def test_answers_are_literal_and_cannot_close_the_here_document(self):
        with tempfile.TemporaryDirectory(prefix='aoc-literal-') as temp:
            marker=Path(temp)/'nao-executar'
            content="FIM_ENTREGA_AOC\nFIM_ENTREGA_AOC_X\n$(touch "+str(marker)+")\n`touch "+str(marker)+"`\n$USER\n'aspas' e \"aspas duplas\""
            generated=self.command(content)
            self.assertEqual(generated.returncode,0,generated.stderr)
            script=generated.stdout.replace('~/atividades/aoc-cache-fisica',temp)
            subprocess.run(['bash','-eu','-o','pipefail','-c',script],capture_output=True,text=True,check=True)
            self.assertFalse(marker.exists())
            self.assertEqual((Path(temp)/'entrega-matriz.txt').read_text(),content+'\n')

    def test_failed_write_does_not_announce_success(self):
        with tempfile.TemporaryDirectory(prefix='aoc-failure-') as temp:
            (Path(temp)/'entrega-matriz.txt').mkdir()
            script=self.command('Texto final').stdout.replace('~/atividades/aoc-cache-fisica',temp)
            done=subprocess.run(['bash','-eu','-o','pipefail','-c',script],capture_output=True,text=True)
            self.assertNotIn('Arquivo final salvo',done.stdout)
            self.assertIn('Não foi possível salvar',done.stderr)
            self.assertNotEqual(done.returncode,0)

    def test_invalid_activity_is_rejected(self):
        result=self.command('Texto','../../arquivo')
        self.assertNotEqual(result.returncode,0)


if __name__=='__main__':
    unittest.main(verbosity=2)
