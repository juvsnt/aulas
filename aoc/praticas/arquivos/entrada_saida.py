from pathlib import Path
# Um arquivo representa o lote ja coletado pelo sensor, nao o sensor fisico.
Path('leituras.bin').write_bytes(bytes([12, 18, 24, 30]))
with open('leituras.bin', 'rb', buffering=0) as origem:
    unidades = [origem.read(1) for _ in range(4)]
with open('leituras.bin', 'rb', buffering=0) as origem:
    lote = origem.read(4)
print('Leituras de 1 byte:', len(unidades))
print('Leituras de 4 bytes: 1')
print('Mesmo conteudo:', b''.join(unidades) == lote)
print('Total bruto:', sum(lote))
Path('relatorio.txt').write_text(f'Total bruto={sum(lote)}\n')
# Modelo de custo: dispositivo pronto apos 3 consultas por byte.
print('MODELO: polling: consultas=12 copias_CPU=4')
print('MODELO: interrupcao por byte: avisos=4 copias_CPU=4')
print('MODELO: DMA por lote: configuracoes=1 avisos=1 bytes=4')
