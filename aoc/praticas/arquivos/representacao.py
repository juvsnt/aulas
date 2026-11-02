import struct
from pathlib import Path
leituras = [12, 18, 24, 30]
Path('leituras.bin').write_bytes(bytes(leituras))
for n in leituras:
    print(f'{n:2} -> bin={n:08b} hex={n:02x}')
print('Total:', sum(leituras), 'Media:', sum(leituras) / len(leituras))
print('255+1 em Python:', 255 + 1)
print('255+1 limitado a 8 bits:', (255 + 1) & 255)
print('11111111 sem sinal:', int('11111111', 2))
print('11111111 com sinal:', struct.unpack('b', b'\xff')[0])
print('AND 24 & 8:', 24 & 8)
print('0.1+0.2 == 0.3:', 0.1 + 0.2 == 0.3)
print('0.1 em float32 little-endian:', struct.pack('<f', 0.1).hex())
