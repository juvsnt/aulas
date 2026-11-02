import subprocess
import sys
from time import perf_counter

def trabalho(valores):
    total = 0
    for _ in range(10000):
        for valor in valores: total += valor
    return total

if __name__ == '__main__':
    if len(sys.argv) > 1:
        print(trabalho([int(v) for v in sys.argv[1:]]))
    else:
        inicio = perf_counter()
        serial = trabalho([12, 18, 24, 30])
        ts = perf_counter() - inicio
        inicio = perf_counter()
        # Dois filhos locais, sem rede; cada um calcula uma soma parcial.
        with subprocess.Popen([sys.executable, __file__, '12', '18'],
                              stdout=subprocess.PIPE, text=True) as p1:
            with subprocess.Popen([sys.executable, __file__, '24', '30'],
                                  stdout=subprocess.PIPE, text=True) as p2:
                a = p1.communicate(timeout=10)[0]
                b = p2.communicate(timeout=10)[0]
                if p1.returncode or p2.returncode:
                    raise SystemExit('Falha nos filhos; avise o professor.')
        paralelo = int(a) + int(b)
        tp = perf_counter() - inicio
        print(f'Serial={serial} Dividido={paralelo} Iguais={serial==paralelo}')
        print(f't_serial={ts:.6f}s t_dividido={tp:.6f}s')
        print(f'Speedup observado={ts/tp:.3f}')
        print('Amdahl p=0.5, N=2:', 1 / (0.5 + 0.5/2))
