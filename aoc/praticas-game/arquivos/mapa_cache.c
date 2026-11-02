#include <stdio.h>
#include <string.h>

// Simulador didatico de Cache L1:
// 4 linhas de cache direta, cada bloco armazena 2 tiles consecutivos da RAM
int main(int argc, char **argv) {
    const char *modo = (argc > 1) ? argv[1] : "linha";

    // Mapa 4x4 do jogo (indices de 0 a 15 na memoria):
    // Varredura por linha (desenho natural da tela: 0,1,2,3, 4,5,6,7, ...)
    int ordem_linha[16] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
    // Varredura por coluna com saltos de memoria (0,4,8,12, 1,5,9,13, ...)
    int ordem_coluna[16] = {0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15};

    int *ordem = (strcmp(modo, "coluna") == 0) ? ordem_coluna : ordem_linha;

    int cache[4] = {-1, -1, -1, -1}; // 4 linhas da cache (-1 = vazia)
    int hits = 0, misses = 0;

    printf("=== RENDERIZACAO DO MAPA DO JOGO: VARREDURA POR %s ===\n",
           (strcmp(modo, "coluna") == 0) ? "COLUNA (SALTOS)" : "LINHA (SEQUENCIAL)");

    for (int i = 0; i < 16; i++) {
        int endereco = ordem[i];
        int bloco = endereco / 2;      // 2 elementos por bloco da cache
        int linha = bloco % 4;         // Mapeamento direto em 4 linhas

        int hit = (cache[linha] == bloco);
        if (hit) {
            hits++;
        } else {
            misses++;
            cache[linha] = bloco;      // Traz bloco da RAM lenta para a Cache
        }

        printf("Tile %2d -> Bloco %d na Linha %d: [%s]\n",
               endereco, bloco, linha, hit ? "HIT (Cache rapida!)" : "MISS (Busca na RAM)");
    }

    printf("\n=== ESTATISTICAS DA MEMORIA CACHE ===\n");
    printf("Total de acessos: 16\n");
    printf("Hits (acertos):   %d\n", hits);
    printf("Misses (erros):   %d\n", misses);
    printf("Taxa de acertos:  %.1f%%\n", (hits * 100.0) / 16);

    return 0;
}
