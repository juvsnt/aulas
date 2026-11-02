import sys
# Cache didatica: mapeamento direto, 2 linhas, 2 elementos por bloco.
modo = sys.argv[1] if len(sys.argv) > 1 else 'sequencial'
ordens = {'sequencial': [0, 1, 2, 3, 4, 5, 6, 7],
          'saltos': [0, 4, 1, 5, 2, 6, 3, 7],
          'reuso': [0, 1, 0, 1, 0, 1, 0, 1]}
if modo not in ordens:
    raise SystemExit('Use: sequencial, saltos ou reuso')
cache = [None, None]
hits = 0
for endereco in ordens[modo]:
    bloco = endereco // 2
    linha = bloco % 2
    hit = cache[linha] == bloco
    hits += int(hit)
    cache[linha] = bloco
    print(f'end={endereco} bloco={bloco} linha={linha} '
          f'{"HIT" if hit else "MISS"}')
print(f'hits={hits} misses={8-hits} taxa={hits/8:.1%}')
