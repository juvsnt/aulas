#include <stdio.h>
#include <string.h>
/* Cache didatica: mapeamento direto, 2 linhas, 2 elementos por bloco. */
int main(int argc, char **argv) {
    const char *modo = argc > 1 ? argv[1] : "sequencial";
    int ordens[3][8] = {{0,1,2,3,4,5,6,7}, {0,4,1,5,2,6,3,7}, {0,1,0,1,0,1,0,1}};
    int tipo = !strcmp(modo,"sequencial") ? 0 : !strcmp(modo,"saltos") ? 1 : !strcmp(modo,"reuso") ? 2 : -1;
    if (argc > 2 || tipo < 0) { fputs("Use: sequencial, saltos ou reuso\n", stderr); return 1; }
    int cache[] = {-1, -1}, hits = 0; /* -1 significa linha vazia. */
    for (int i = 0; i < 8; i++) {
        int endereco = ordens[tipo][i], bloco = endereco / 2, linha = bloco % 2;
        int hit = cache[linha] == bloco;
        hits += hit; cache[linha] = bloco;
        printf("end=%d bloco=%d linha=%d %s\n", endereco, bloco, linha, hit ? "HIT" : "MISS");
    }
    printf("hits=%d misses=%d taxa=%.1f%%\n", hits, 8-hits, 100.0*hits/8);
    return 0;
}
