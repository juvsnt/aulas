#include <stdio.h>
#include <string.h>

typedef struct { int principal, sequencia, valor; } Pedido;
int main(int argc, char **argv) {
    const char *modo = argc == 2 ? argv[1] : "aberto";
    if (argc > 2 || (strcmp(modo, "aberto") && strcmp(modo, "politica") && strcmp(modo, "replay"))) {
        fputs("Uso: ./seguranca [aberto|politica|replay]\n", stderr); return 2;
    }
    /* Identidades ja autenticadas por um mecanismo externo, nao implementado. */
    const Pedido fila[] = {{0, 1, 12}, {1, 1, 18}, {0, 1, 12}};
    const char *identidades[] = {"sensor01", "leitor01"};
    const int pode_escrever[] = {1, 0};
    int total = 84, ultima_seq[] = {0, 0};
    for (int i = 0; i < 3; ++i) {
        Pedido p = fila[i]; const char *decisao = "ACEITO";
        if (strcmp(modo, "aberto") && !pode_escrever[p.principal]) decisao = "NEGADO: papel sem escrita";
        else if (strcmp(modo, "replay") == 0 && p.sequencia <= ultima_seq[p.principal]) decisao = "NEGADO: repeticao";
        else { total += p.valor; ultima_seq[p.principal] = p.sequencia; }
        printf("%s seq=%d valor=%d %s\n", identidades[p.principal], p.sequencia, p.valor, decisao);
    }
    printf("Total=%d\n", total);
    puts("Sem criptografia, autenticacao ou canal seguro: politica sobre identidades assumidas.");
    return 0;
}
