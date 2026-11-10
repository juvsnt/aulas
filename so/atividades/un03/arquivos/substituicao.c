/* substituicao.c - SIMULACAO de substituicao de paginas (Atividade 3).
 * Uso: ./substituicao fifo|lru QUADROS PAGINA PAGINA ...
 * Exemplo: ./substituicao fifo 3 1 2 1 3 4 1 2 5 1 2 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_QUADROS 8
#define VAZIO (-1)

int main(int argc, char *argv[]) {
    if (argc < 4) {
        fprintf(stderr, "Uso: %s fifo|lru QUADROS PAGINA PAGINA ...\n", argv[0]);
        return 1;
    }
    int lru = strcmp(argv[1], "lru") == 0;
    if (!lru && strcmp(argv[1], "fifo") != 0) {
        fprintf(stderr, "Algoritmo deve ser fifo ou lru.\n");
        return 1;
    }
    int n = atoi(argv[2]);
    if (n < 1 || n > MAX_QUADROS) {
        fprintf(stderr, "Use de 1 a %d quadros.\n", MAX_QUADROS);
        return 1;
    }

    int quadro[MAX_QUADROS];   /* pagina guardada em cada quadro */
    int uso[MAX_QUADROS];      /* momento do ultimo uso (para o LRU) */
    for (int q = 0; q < n; q++) { quadro[q] = VAZIO; uso[q] = 0; }
    int mais_antigo = 0;       /* FIFO: quadro que recebeu pagina primeiro */
    int faltas = 0, tempo = 0;

    printf("%s com %d quadros\n\nacesso | quadros | resultado\n", lru ? "LRU" : "FIFO", n);
    for (int i = 3; i < argc; i++) {
        int pagina = atoi(argv[i]);
        tempo++;
        int achou = VAZIO;
        for (int q = 0; q < n; q++)
            if (quadro[q] == pagina) achou = q;

        int saiu = VAZIO;
        if (achou != VAZIO) {
            uso[achou] = tempo;                         /* acerto */
        } else {
            faltas++;                                   /* falta de pagina */
            int vitima = VAZIO;
            for (int q = 0; q < n && vitima == VAZIO; q++)
                if (quadro[q] == VAZIO) vitima = q;     /* ainda ha quadro livre */
            if (vitima == VAZIO) {                      /* memoria cheia */
                if (lru) {                              /* sai a usada ha mais tempo */
                    vitima = 0;
                    for (int q = 1; q < n; q++)
                        if (uso[q] < uso[vitima]) vitima = q;
                } else {                                /* sai a que chegou primeiro */
                    vitima = mais_antigo;
                    mais_antigo = (mais_antigo + 1) % n;
                }
                saiu = quadro[vitima];
            }
            quadro[vitima] = pagina;
            uso[vitima] = tempo;
        }

        printf("%6d | ", pagina);
        for (int q = 0; q < n; q++) {
            if (quadro[q] == VAZIO) printf(" -");
            else printf("%2d", quadro[q]);
        }
        if (achou != VAZIO) printf(" | acerto\n");
        else if (saiu == VAZIO) printf(" | falta\n");
        else printf(" | falta (saiu %d)\n", saiu);
    }
    printf("\nTotal: %d faltas em %d acessos\n", faltas, tempo);
    return 0;
}
