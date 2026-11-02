#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int variavel_global = 10; // Segmento de Dados/BSS

int main(void) {
    int variavel_local = 20; // Pilha (Stack)

    // O servidor aloca 1 MB de memoria RAM no Heap para cache de paginas web:
    size_t tamanho_cache = 1024 * 1024; // 1 MB
    char *cache_paginas = (char *)malloc(tamanho_cache);
    if (!cache_paginas) {
        perror("malloc");
        return 1;
    }

    // Escreve dados no buffer de cache para forcar alocacao fisica de memoria:
    for (size_t i = 0; i < tamanho_cache; i += 4096) {
        cache_paginas[i] = 'A'; // 1 escrita por pagina de 4 KB
    }

    printf("=== ESPACO DE ENDERECAMENTO DO SERVIDOR (PID: %ld) ===\n", (long)getpid());
    printf("1. Codigo/Texto (funcao main):   %p\n", (void *)main);
    printf("2. Dados Globais:                %p\n", (void *)&variavel_global);
    printf("3. Heap (Buffer de 1MB alocado): %p\n", (void *)cache_paginas);
    printf("4. Pilha/Stack (var local):      %p\n\n", (void *)&variavel_local);

    puts("Memoria alocada com sucesso no Heap para cache do servidor.");
    FILE *mapa = fopen("/proc/self/maps", "r");
    if (mapa) {
        char linha[512];
        puts("Mapa virtual deste processo (malloc pode usar mapeamento anonimo):");
        while (fgets(linha, sizeof(linha), mapa)) fputs(linha, stdout);
        fclose(mapa);
    } else { perror("/proc/self/maps (observacao indisponivel)"); }
    free(cache_paginas);
    return 0;
}
