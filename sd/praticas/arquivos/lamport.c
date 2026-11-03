#include <errno.h>
#include <stdio.h>
#include <stdlib.h>

static int local(int *clock, const char *nome, int fisico) {
    ++*clock;
    printf("%s fisico=%d L=%d\n", nome, fisico, *clock);
    return *clock;
}
static void receber(int *clock, int mensagem, const char *nome, int fisico) {
    if (*clock < mensagem) *clock = mensagem;
    (void)local(clock, nome, fisico);
}
int main(int argc, char **argv) {
    int desvio = 20;
    if (argc > 2) return 2;
    if (argc == 2) {
        char *fim; errno = 0; long n = strtol(argv[1], &fim, 10);
        if (errno || !*argv[1] || *fim || n < -50 || n > 50) {
            fputs("Uso: ./lamport [desvio_B:-50..50]\n", stderr); return 2;
        }
        desvio = (int)n;
    }
    int a = 0, b = 0;
    (void)local(&a, "A1 local", 10);
    (void)local(&b, "B1 local", 10 + desvio);
    (void)local(&b, "B2 local", 11 + desvio);
    int mensagem = local(&a, "A2 envia m", 12);
    receber(&b, mensagem, "B3 recebe m", 13 + desvio);
    (void)local(&a, "A3 local", 14);
    mensagem = local(&b, "B4 envia r", 15 + desvio);
    receber(&a, mensagem, "A4 recebe r", 16);
    puts("A1 e B2 sao concorrentes: nao ha caminho de mensagens entre eles.");
    puts("Ordem L(A1)<L(B2) nao prova que A1 causou B2.");
    return 0;
}
