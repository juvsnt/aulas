/* espera.c - AOC, Unidade 5, Atividade 2.
   Duas formas de esperar um dado que so fica pronto depois de 3 segundos.
     perguntando: consulta sem parar se o dado chegou (como o polling).
     avisado:     dorme; o sistema operacional acorda o programa quando o
                  dado chega (como a interrupcao).
   O "dispositivo" e um processo filho que envia 1 byte por um pipe.
   E uma analogia em software: nenhum periferico real e usado. */
#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <sys/resource.h>
#include <sys/wait.h>
#include <time.h>
#include <unistd.h>

static double relogio(void) {          /* tempo total decorrido, em s */
    struct timespec t;
    clock_gettime(CLOCK_MONOTONIC, &t);
    return (double)t.tv_sec + (double)t.tv_nsec / 1e9;
}

static double tempo_cpu(void) {        /* tempo de CPU deste programa, em s */
    struct rusage r;
    getrusage(RUSAGE_SELF, &r);
    return (double)(r.ru_utime.tv_sec + r.ru_stime.tv_sec)
         + (double)(r.ru_utime.tv_usec + r.ru_stime.tv_usec) / 1e6;
}

int main(int argc, char **argv) {
    int perguntando = argc > 1 && strcmp(argv[1], "perguntando") == 0;
    int avisado = argc > 1 && strcmp(argv[1], "avisado") == 0;
    if (!perguntando && !avisado) {
        fprintf(stderr, "uso: %s perguntando | avisado\n", argv[0]);
        return 1;
    }
    int canal[2];
    if (pipe(canal) != 0) { perror("pipe"); return 1; }
    pid_t filho = fork();
    if (filho < 0) { perror("fork"); return 1; }
    if (filho == 0) {                  /* o "dispositivo" demora 3 s */
        close(canal[0]);
        sleep(3);
        if (write(canal[1], "D", 1) != 1) _exit(1);
        _exit(0);
    }
    close(canal[1]);

    double t0 = relogio(), c0 = tempo_cpu();
    unsigned long long consultas = 0;
    char dado = '?';
    if (perguntando) {
        fcntl(canal[0], F_SETFL, O_NONBLOCK);   /* read responde na hora */
        for (;;) {                               /* "Ja terminou?" */
            consultas++;
            ssize_t r = read(canal[0], &dado, 1);
            if (r == 1) break;
            if (r < 0 && errno != EAGAIN) { perror("read"); return 1; }
        }
    } else {
        consultas = 1;                           /* pede uma vez e dorme */
        if (read(canal[0], &dado, 1) != 1) { perror("read"); return 1; }
    }
    double espera = relogio() - t0, cpu = tempo_cpu() - c0;
    waitpid(filho, NULL, 0);

    printf("modo:                 %s\n", argv[1]);
    printf("dado recebido:        %c\n", dado);
    printf("tempo de espera:      %.2f s\n", espera);
    printf("tempo de CPU gasto:   %.3f s (%.0f%% da espera)\n", cpu, 100.0 * cpu / espera);
    printf("consultas feitas:     %llu\n", consultas);
    return 0;
}
