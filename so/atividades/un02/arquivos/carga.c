/* carga.c - processo CPU-bound com duracao limitada.
 * Uso: ./carga [segundos]   (padrao 3, maximo 30)
 * Calcula sem parar ate o relogio de parede atingir o limite e informa
 * quanto tempo de CPU realmente recebeu e quantas trocas de contexto sofreu.
 * Chamado 1 (I1, I3). */
#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <unistd.h>
#include <sys/resource.h>

#define PADRAO 3
#define MAXIMO 30

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
    int ni = getpriority(PRIO_PROCESS, 0);
    printf("carga PID=%d PPID=%d nice=%d: calculando por %d s\n",
           (int)getpid(), (int)getppid(), ni, segundos);
    fflush(stdout);

    double inicio = agora(CLOCK_MONOTONIC);
    volatile unsigned long long soma = 0;
    unsigned long long voltas = 0;
    while (agora(CLOCK_MONOTONIC) - inicio < segundos) {
        for (unsigned long long i = 0; i < 100000; i++) soma += i * i;
        voltas++;
    }

    double parede = agora(CLOCK_MONOTONIC) - inicio;
    double cpu = agora(CLOCK_PROCESS_CPUTIME_ID);
    struct rusage uso;
    getrusage(RUSAGE_SELF, &uso);
    printf("carga PID=%d nice=%d | parede=%.2f s | CPU=%.2f s (%.0f%%) | "
           "blocos=%llu | trocas voluntarias=%ld involuntarias=%ld\n",
           (int)getpid(), ni, parede, cpu, 100.0 * cpu / parede, voltas,
           uso.ru_nvcsw, uso.ru_nivcsw);
    return 0;
}
