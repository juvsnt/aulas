#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <float.h>
#include <limits.h>

static void bits(unsigned n) {
    for (int b = 7; b >= 0; b--) putchar('0' + ((n >> b) & 1u));
}
int main(void) {
    unsigned char leituras[] = {12, 18, 24, 30};
    if (CHAR_BIT != 8) return 1;
    FILE *f = fopen("leituras.bin", "wb");
    if (!f) { perror("leituras.bin"); return 1; }
    int ok = fwrite(leituras, 1, 4, f) == 4;
    if (fclose(f) != 0) ok = 0;
    if (!ok) return 1;
    int total = 0;
    for (int i = 0; i < 4; i++) {
        unsigned n = leituras[i];
        printf("%2u -> bin=", n); bits(n); printf(" hex=%02x\n", n);
        total += (int)n;
    }
    printf("Total: %d Media: %.1f\n", total, total / 4.0);
    printf("255+1 em int: %d\n", 255 + 1);
    printf("255+1 limitado a 8 bits: %u\n", (255u + 1u) & 255u);
    unsigned padrao = 255;
    /* Interpretacao matematica de complemento de dois, sem conversao ambigua. */
    int com_sinal = padrao >= 128 ? (int)padrao - 256 : (int)padrao;
    printf("11111111 sem sinal: %u\n11111111 com sinal: %d\n", padrao, com_sinal);
    printf("AND 24 & 8: %d\n", 24 & 8);
    volatile double a = 0.1, b = 0.2, c = 0.3;
    printf("0.1+0.2 == 0.3: %s\n", a + b == c ? "verdadeiro" : "falso");
    if (sizeof(float) == 4 && FLT_RADIX == 2 && FLT_MANT_DIG == 24 && FLT_MAX_EXP == 128) {
        float x = 0.1f;
        uint32_t bruto;
        memcpy(&bruto, &x, 4);
        /* Ordem explicita para a saida no alvo Linux x86-64 do laboratorio. */
        printf("0.1 em float32 little-endian: ");
        for (int i = 0; i < 4; i++) printf("%02x", (unsigned)((bruto >> (8*i)) & 255u));
        putchar('\n');
    } else puts("float32 nao confirmado neste alvo");
    printf("Desafio: "); bits(30); printf(" %u %u\n", 30u & 8u, (250u + 10u) & 255u);
    return 0;
}
