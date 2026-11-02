import sys
# Modelo educacional: PC indexa instrucoes; dados usam enderecos 0 e 1.
valor = int(sys.argv[1]) if len(sys.argv) > 1 else 24
mem = {0: valor, 1: 0}
r = 0
zf = False
cmp = 0
programa = [('LOAD', 0), ('ADD', 2), ('STORE', 1),
            ('CMP', 24), ('JGE', 6), ('HALT', 0), ('HALT', 0)]
pc = 0
while True:
    atual = pc
    op, arg = programa[pc]  # Busca: IR recebe instrucao apontada pelo PC.
    pc += 1               # Proximo endereco, salvo se ocorrer desvio.
    if op == 'LOAD': r = mem[arg]
    elif op == 'ADD': r += arg
    elif op == 'STORE': mem[arg] = r
    elif op == 'CMP':
        cmp = r - arg
        zf = (cmp == 0)
    elif op == 'JGE':
        if cmp >= 0: pc = arg
    print(f'PC={atual} IR={op} {arg} R={r} ZF={int(zf)}')
    print(f'  proximo_PC={pc} memoria[1]={mem[1]}')
    if op == 'HALT': break
