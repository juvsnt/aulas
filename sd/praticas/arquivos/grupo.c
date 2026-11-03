#include <stdio.h>
#include <string.h>

typedef struct { char nome; int depende; } Mensagem;
static const Mensagem mensagens[] = {{'X', -1}, {'Y', 0}, {'Z', -1}};
static void observar(int r, const int ordem[3], int causal, int perde) {
    int chegou[3] = {0}, entregue[3] = {0}, calibracao = 0;
    printf("Receptor R%d\n", r);
    for (int passo = 0; passo < 3; ++passo) {
        int m = ordem[passo];
        if (perde && m == 0) { puts("X ausente no roteiro de entregas"); continue; }
        chegou[m] = 1;
        printf("Chegou %c\n", mensagens[m].nome);
        int mudou;
        do {
            mudou = 0;
            for (int i = 0; i < 3; ++i) {
                int dep = mensagens[i].depende;
                if (!chegou[i] || entregue[i] || (causal && dep >= 0 && !entregue[dep])) continue;
                entregue[i] = 1; mudou = 1;
                if (i == 0) calibracao = 2;
                printf("Entrega %c", mensagens[i].nome);
                if (i == 1) printf(" leitura=22 correcao=%d alerta=%s", calibracao,
                                   22 + calibracao >= 24 ? "SIM" : "NAO");
                putchar('\n');
            }
        } while (mudou);
    }
    int pendentes = 0;
    for (int i = 0; i < 3; ++i) if (chegou[i] && !entregue[i]) ++pendentes;
    printf("Pendentes=%d\n", pendentes);
}
int main(int argc, char **argv) {
    int causal = argc > 1 && strcmp(argv[1], "causal") == 0;
    int perde = argc > 2 && strcmp(argv[2], "sem-x") == 0;
    if (argc > 3 || (argc > 1 && !causal && strcmp(argv[1], "chegada")) ||
        (argc > 2 && !perde)) {
        fputs("Uso: ./grupo [chegada|causal] [sem-x]\n", stderr); return 2;
    }
    const int r1[] = {1, 0, 2}, r2[] = {2, 0, 1};
    observar(1, r1, causal, perde); observar(2, r2, causal, perde);
    return 0;
}
