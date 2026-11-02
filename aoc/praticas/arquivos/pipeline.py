import sys
# Modelo temporal: cinco estagios, um ciclo por estagio.
n = int(sys.argv[1]) if len(sys.argv) > 1 else 4
bolhas = int(sys.argv[2]) if len(sys.argv) > 2 else 0
if not 3 <= n <= 12 or not 0 <= bolhas <= 4:
    raise SystemExit('Use 3 a 12 instrucoes e 0 a 4 bolhas.')
k = 5
ciclos = n + k - 1 + bolhas
print('Estagios: F=busca D=decodifica E=executa M=memoria W=escrita')
for i in range(n):
    # Pausa de emissao antes de I3; nao detecta dependencias automaticamente.
    inicio = i + (bolhas if i >= 2 else 0)
    linha = ['.'] * ciclos
    for j, etapa in enumerate('FDEMW'): linha[inicio+j] = etapa
    print(f'I{i+1}: ' + ' '.join(linha))
print(f'Sem pipeline={n*k} ciclos; com pipeline={ciclos} ciclos')
print(f'CPI do lote={ciclos/n:.2f}; speedup={(n*k)/ciclos:.2f}')
print(f'Latencia de cada instrucao=5 ciclos; bolhas de emissao={bolhas}')
