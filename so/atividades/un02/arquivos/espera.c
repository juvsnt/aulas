/* espera.c - processo I/O-bound simulado, com duracao limitada.
 * Uso: ./espera [segundos]   (padrao 3, maximo 60)
 * Alterna rajadas curtas de CPU (cerca de 1 ms) com pausas de 50 ms,
 * como um programa que espera teclado, disco ou rede.
 * Compare a saida com a de ./carga. Chamado 1 (I1, I3). */
#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <unistd.h>
#include <sys/resource.h>

#define PADRAO 3
#define MAXIMO 60

static double agora(clockid_t relogio) {
    struct timespec t;
    clock_gettime(relogio, &t);
    return (double)t.tv_sec + (double)t.tv_nsec / 1e9;
}

int main(int argc, char *argv[]) {
    int segundos = PADRAO;
    if (argc > 1) segundos = atoi(argv[1]);
    if (segundos < 1 || segundos > MAXIMO) {
        fprintf(stderr, "Use um valor entre 1 e %d segundos.\n", MAXIMO);
        return 1;
    }
    printf("espera PID=%d PPID=%d: alternando CPU e pausa por %d s\n",
           (int)getpid(), (int)getppid(), segundos);
    fflush(stdout);

    const struct timespec pausa = {0, 50 * 1000 * 1000}; /* 50 ms */
    double inicio = agora(CLOCK_MONOTONIC);
    volatile unsigned long long soma = 0;
    unsigned long long rajadas = 0;
    while (agora(CLOCK_MONOTONIC) - inicio < segundos) {
        double fim_rajada = agora(CLOCK_MONOTONIC) + 0.001; /* 1 ms de CPU */
        while (agora(CLOCK_MONOTONIC) < fim_rajada) soma += 1;
        rajadas++;
        nanosleep(&pausa, NULL); /* o processo fica Bloqueado (estado S) */
    }

    double parede = agora(CLOCK_MONOTONIC) - inicio;
    double cpu = agora(CLOCK_PROCESS_CPUTIME_ID);
    struct rusage uso;
    getrusage(RUSAGE_SELF, &uso);
    printf("espera PID=%d | parede=%.2f s | CPU=%.2f s (%.0f%%) | "
           "rajadas=%llu | trocas voluntarias=%ld involuntarias=%ld\n",
           (int)getpid(), parede, cpu, 100.0 * cpu / parede, rajadas,
           uso.ru_nvcsw, uso.ru_nivcsw);
    return 0;
}
