#include <stdio.h>
#include <stdlib.h>
/* Modelo temporal: cinco estagios, um ciclo por estagio. */
int main(int argc, char **argv) {
    char *fim;
    long n = argc > 1 ? strtol(argv[1], &fim, 10) : 4;
    if (argc > 1 && (fim == argv[1] || *fim)) return 1;
    long bolhas = argc > 2 ? strtol(argv[2], &fim, 10) : 0;
    if ((argc > 2 && (fim == argv[2] || *fim)) || argc > 3 || n < 3 || n > 12 || bolhas < 0 || bolhas > 4) {
        fputs("Use 3 a 12 instrucoes e 0 a 4 bolhas.\n", stderr); return 1;
    }
    int ciclos = (int)(n + 4 + bolhas);
    puts("Estagios: F=busca D=decodifica E=executa M=memoria W=escrita");
    for (int i = 0; i < n; i++) {
        /* Pausa antes de I3; nao detecta dependencias automaticamente. */
        int inicio = i + (i >= 2 ? (int)bolhas : 0);
        printf("I%d: ", i+1);
        for (int t = 0; t < ciclos; t++) {
            int j = t - inicio;
            printf("%c%s", j >= 0 && j < 5 ? "FDEMW"[j] : '.', t+1 == ciclos ? "" : " ");
        }
        putchar('\n');
    }
    printf("Sem pipeline=%ld ciclos; com pipeline=%d ciclos\n", n*5, ciclos);
    printf("CPI do lote=%.2f; speedup=%.2f\n", (double)ciclos/n, (double)(n*5)/ciclos);
    printf("Latencia de cada instrucao=5 ciclos; bolhas de emissao=%ld\n", bolhas);
    return 0;
}
