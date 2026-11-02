#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>
/* API de biblioteca; o rastreamento das syscalls e uma etapa separada. */
int main(void) {
    FILE *entrada = fopen("leituras.txt", "r");
    if (!entrada) { perror("leituras.txt"); return 1; }
    int n, total = 0, quantidade = 0;
    while (fscanf(entrada, "%d", &n) == 1) {
        if (quantidade == 4 || n < -1000 || n > 1000) {
            fclose(entrada); fputs("Use exatamente quatro leituras de -1000 a 1000.\n", stderr); return 1;
        }
        total += n; quantidade++;
    }
    int ok = feof(entrada) && !ferror(entrada) && quantidade == 4;
    if (fclose(entrada)) ok = 0;
    if (!ok) { fputs("Lote invalido.\n", stderr); return 1; }
    FILE *saida = fopen("relatorio.txt", "w");
    if (!saida) { perror("relatorio.txt"); return 1; }
    ok = fprintf(saida, "Leituras=%d Total=%d\n", quantidade, total) > 0;
    if (fclose(saida)) ok = 0;
    if (!ok) return 1;
    printf("PID=%ld Leituras=%d Total=%d\n", (long)getpid(), quantidade, total);
    /* Falha controlada: descritor -1 e invalido. Nao acessa hardware. */
    errno = 0;
    ssize_t r = read(-1, &n, sizeof n);
    if (r == -1 && errno == EBADF) puts("read(-1): EBADF (descritor invalido)");
    else { fputs("Resposta inesperada ao descritor invalido.\n", stderr); return 1; }
    return 0;
}
