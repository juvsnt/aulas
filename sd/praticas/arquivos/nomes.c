#include <errno.h>
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char **argv) {
    int ttl = 10;
    if (argc > 2) return 2;
    if (argc == 2) {
        char *fim; errno = 0; long n = strtol(argv[1], &fim, 10);
        if (errno || !*argv[1] || *fim || n < 1 || n > 20) {
            fputs("Uso: ./nomes [ttl:1..20]\n", stderr); return 2;
        }
        ttl = (int)n;
    }
    int autoridade = 1, cache = 0, expira = 0, consultas = 0;
    const int tempos[] = {0, 3, 11};
    for (int i = 0; i < 3; ++i) {
        int t = tempos[i];
        if (i == 1) { autoridade = 2; puts("t=2 servico muda de no1 para no2."); }
        if (!cache || t >= expira) {
            cache = autoridade; expira = t + ttl; ++consultas;
            printf("t=%d consulta autoridade; ", t);
        } else printf("t=%d usa cache; ", t);
        printf("estacao/relatorio -> no%d expira=%d\n", cache, expira);
    }
    printf("Consultas=%d\n", consultas);
    puts("Resolucao de nome nao garante que o destino esteja disponivel.");
    return 0;
}
