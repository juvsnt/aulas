#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/wait.h>
#include <unistd.h>

/* Pipe real; texto com id, valor e delimitador. Sem rede. */
static int numero(const char *s, long min, long max) {
    char *fim; errno = 0; long n = strtol(s, &fim, 10);
    if (errno || !*s || *fim || n < min || n > max) return -1;
    return (int)n;
}
static int enviar(int fd, const char *s, size_t n) {
    while (n) {
        ssize_t k = write(fd, s, n);
        if (k < 0 && errno == EINTR) continue;
        if (k <= 0) return -1;
        s += k; n -= (size_t)k;
    }
    return 0;
}
int main(int argc, char **argv) {
    int passo = argc > 1 ? numero(argv[1], 1, 16) : 8;
    int ultimo = argc > 2 ? numero(argv[2], 0, 100) : 30;
    int corte = argc > 3 && strcmp(argv[3], "corte") == 0;
    if (argc > 4 || passo < 0 || ultimo < 0 || (argc > 3 && !corte)) {
        fputs("Uso: ./estacao [bytes:1..16] [ultima:0..100] [corte]\n", stderr);
        return 2;
    }
    signal(SIGPIPE, SIG_IGN);
    alarm(5); /* Limite de contingencia; nao mede timeout distribuido. */
    int canal[2];
    if (pipe(canal) < 0) { perror("pipe"); return 1; }
    pid_t filho = fork();
    if (filho < 0) { perror("fork"); close(canal[0]); close(canal[1]); return 1; }
    if (filho == 0) {
        alarm(5); close(canal[0]);
        int dados[] = {12, 18, 24, ultimo};
        for (int i = 0; i < 4; ++i) {
            char linha[32];
            int n = snprintf(linha, sizeof linha, "%d %d\n", i + 1, dados[i]);
            if (corte && i == 3) --n;
            if (enviar(canal[1], linha, (size_t)n) < 0) _exit(1);
        }
        close(canal[1]); _exit(0);
    }
    close(canal[1]);
    char bloco[16], linha[32]; size_t usados = 0;
    int total = 0, recebidos = 0, falhou = 0, chamadas = 0;
    for (;;) {
        ssize_t n = read(canal[0], bloco, (size_t)passo);
        if (n < 0 && errno == EINTR) continue;
        if (n < 0) { perror("read"); falhou = 1; break; }
        if (!n) break;
        ++chamadas;
        printf("Fragmento: %zd bytes\n", n);
        for (ssize_t i = 0; i < n; ++i) {
            if (bloco[i] != '\n') {
                if (usados + 1 >= sizeof linha) { falhou = 1; break; }
                linha[usados++] = bloco[i];
            } else {
                int id, valor; char extra;
                linha[usados] = '\0';
                if (sscanf(linha, "%d %d %c", &id, &valor, &extra) != 2 ||
                    id != recebidos + 1 || valor < 0 || valor > 100 || recebidos >= 4) {
                    falhou = 1; break;
                }
                ++recebidos; total += valor; usados = 0;
                printf("Mensagem: produtor=P id=%d valor=%d\n", id, valor);
            }
        }
        if (falhou) break;
    }
    close(canal[0]);
    int status;
    while (waitpid(filho, &status, 0) < 0) {
        if (errno != EINTR) { perror("waitpid"); return 1; }
    }
    if (!WIFEXITED(status) || WEXITSTATUS(status)) falhou = 1;
    printf("Chamadas com dados=%d\n", chamadas);
    if (usados) { puts("Registro incompleto: nao incorporado"); falhou = 1; }
    if (recebidos != 4) falhou = 1;
    printf("Leituras=%d Total=%d Media=%.2f Relatorio=%s\n", recebidos, total,
           recebidos ? (double)total / recebidos : 0.0, falhou ? "INCOMPLETO" : "COMPLETO");
    alarm(0); return falhou ? 1 : 0;
}
