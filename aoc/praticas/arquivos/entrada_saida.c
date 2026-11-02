#include <stdio.h>
#include <string.h>
/* Um arquivo representa o lote ja coletado, nao o sensor fisico. */
int main(void) {
    unsigned char dados[] = {12,18,24,30}, unidades[4], lote[4];
    FILE *f = fopen("leituras.bin", "wb");
    if (!f) { perror("leituras.bin"); return 1; }
    int ok = fwrite(dados, 1, 4, f) == 4;
    if (fclose(f) != 0) ok = 0;
    if (!ok) return 1;
    f = fopen("leituras.bin", "rb");
    if (!f) return 1;
    if (setvbuf(f, NULL, _IONBF, 0)) { fclose(f); return 1; }
    for (int i = 0; i < 4; i++) {
        if (fread(&unidades[i], 1, 1, f) != 1) { fclose(f); return 1; }
    }
    if (fclose(f)) return 1;
    f = fopen("leituras.bin", "rb");
    if (!f) return 1;
    if (setvbuf(f, NULL, _IONBF, 0)) { fclose(f); return 1; }
    ok = fread(lote, 1, 4, f) == 4;
    if (fclose(f) != 0) ok = 0;
    if (!ok) return 1;
    int total = 0;
    for (int i = 0; i < 4; i++) total += lote[i];
    puts("Leituras de 1 byte: 4\nLeituras de 4 bytes: 1");
    printf("Mesmo conteudo: %s\nTotal bruto: %d\n", !memcmp(unidades,lote,4) ? "verdadeiro" : "falso", total);
    f = fopen("relatorio.txt", "w");
    if (!f) return 1;
    ok = fprintf(f, "Total bruto=%d\n", total) > 0;
    if (fclose(f) != 0) ok = 0;
    if (!ok) return 1;
    /* Modelo de custo: dispositivo pronto apos 3 consultas por byte. */
    puts("MODELO: polling: consultas=12 copias_CPU=4");
    puts("MODELO: interrupcao por byte: avisos=4 copias_CPU=4");
    puts("MODELO: DMA por lote: configuracoes=1 avisos=1 bytes=4");
    return 0;
}
