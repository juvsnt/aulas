#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include <time.h>
#include <errno.h>

/* Infraestrutura POSIX/Linux fornecida: foco na divisao e na reducao. */
static long trabalho(const int *valores, int n) {
    long total = 0;
    for (int repeticao = 0; repeticao < 10000; repeticao++)
        for (int i = 0; i < n; i++) total += valores[i];
    return total;
}
static double agora(void) {
    struct timespec t;
    if (clock_gettime(CLOCK_MONOTONIC, &t)) { perror("clock_gettime"); exit(1); }
    return t.tv_sec + t.tv_nsec / 1e9;
}
/* Transfere todos os bytes, tratando interrupcoes e transferencias parciais. */
static int transferir(int fd, void *dado, size_t n, int escrever) {
    unsigned char *p = dado;
    while (n) {
        ssize_t k = escrever ? write(fd, p, n) : read(fd, p, n);
        if (k < 0 && errno == EINTR) continue;
        if (k <= 0) return 0;
        p += k; n -= (size_t)k;
    }
    return 1;
}
static int esperar(pid_t pid) {
    int status;
    while (waitpid(pid, &status, 0) < 0) {
        if (errno != EINTR) return 0;
    }
    return WIFEXITED(status) && WEXITSTATUS(status) == 0;
}
int main(int argc, char **argv) {
    if (argc == 2 && !strcmp(argv[1], "amdahl")) {
        double p = 0.8, n = 4;
        printf("%.1f\n", 1.0 / ((1-p) + p/n)); return 0;
    }
    if (argc > 1) {
        if (argc != 3) { fputs("Use dois valores ou amdahl.\n", stderr); return 1; }
        int valores[2];
        for (int i = 0; i < 2; i++) {
            char *fim;
            long v = strtol(argv[i+1], &fim, 10);
            if (fim == argv[i+1] || *fim || v < -1000 || v > 1000) return 1;
            valores[i] = (int)v;
        }
        printf("%ld\n", trabalho(valores, 2)); return 0;
    }
    int valores[] = {12,18,24,30};
    double inicio = agora();
    long serial = trabalho(valores, 4);
    double ts = agora() - inicio;
    inicio = agora();
    int canal[2];
    pid_t filhos[2];
    if (pipe(canal)) { perror("pipe"); return 1; }
    int criados = 0;
    for (int i = 0; i < 2; i++) {
        pid_t pid = fork();
        if (pid < 0) {
            perror("fork: avise o professor");
            close(canal[0]); close(canal[1]);
            for (int j = 0; j < criados; j++) esperar(filhos[j]);
            return 1;
        }
        if (pid == 0) {
            close(canal[0]);
            long parcial = trabalho(valores + 2*i, 2);
            int ok = transferir(canal[1], &parcial, sizeof parcial, 1);
            close(canal[1]); _exit(ok ? 0 : 1);
        }
        filhos[criados++] = pid;
    }
    close(canal[1]);
    long dividido = 0;
    int ok = 1;
    for (int i = 0; i < 2; i++) {
        long parcial;
        if (!transferir(canal[0], &parcial, sizeof parcial, 0)) { ok = 0; break; }
        dividido += parcial; /* Coordenador reduz as duas somas parciais. */
    }
    close(canal[0]);
    for (int i = 0; i < 2; i++) if (!esperar(filhos[i])) ok = 0;
    if (!ok) { fputs("Falha nos filhos; avise o professor.\n", stderr); return 1; }
    double tp = agora() - inicio;
    printf("Serial=%ld Dividido=%ld Iguais=%s\n", serial, dividido, serial == dividido ? "verdadeiro" : "falso");
    printf("t_serial=%.9fs t_dividido=%.9fs\n", ts, tp);
    if (tp > 0) printf("Speedup observado=%.3f\n", ts/tp);
    else puts("Speedup nao calculavel: tempo abaixo da resolucao do relogio");
    printf("Amdahl p=0.5, N=2: %.16f\n", 1.0 / (0.5 + 0.5/2));
    return 0;
}
