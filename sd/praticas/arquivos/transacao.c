#include <stdio.h>
#include <string.h>

typedef enum { INICIAL, PREPARADO, CONFIRMADO, ABORTADO } Estado;
int main(int argc, char **argv) {
    const char *modo = argc == 2 ? argv[1] : "sim";
    if (argc > 2 || (strcmp(modo, "sim") && strcmp(modo, "nao") && strcmp(modo, "falha"))) {
        fputs("Uso: ./transacao [sim|nao|falha]\n", stderr); return 2;
    }
    Estado estado[] = {INICIAL, INICIAL}; int saldo[] = {84, 84};
    int votos[] = {1, strcmp(modo, "nao") != 0};
    for (int i = 0; i < 2; ++i) {
        estado[i] = votos[i] ? PREPARADO : ABORTADO;
        printf("P%d voto=%s estado=%s saldo_visivel=%d\n", i + 1,
               votos[i] ? "SIM" : "NAO", votos[i] ? "PREPARADO" : "ABORTADO", saldo[i]);
    }
    if (strcmp(modo, "falha") == 0) {
        puts("Coordenador indisponivel antes de registrar decisao; participantes aguardam.");
        puts("Resultado=PENDENTE; nao confirmar nem abortar apenas pelo timeout.");
    } else {
        int commit = votos[0] && votos[1];
        printf("Registro modelado do coordenador=%s\n", commit ? "COMMIT" : "ABORT");
        for (int i = 0; i < 2; ++i) {
            estado[i] = commit ? CONFIRMADO : ABORTADO;
            if (estado[i] == CONFIRMADO) saldo[i] += 12;
        }
        printf("Resultado=%s\n", commit ? "CONFIRMADO" : "ABORTADO");
    }
    printf("Saldos: P1=%d P2=%d\n", saldo[0], saldo[1]);
    return 0;
}
