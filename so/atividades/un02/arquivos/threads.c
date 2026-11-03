/* threads.c - um processo, varios fluxos de execucao.
 * Uso: ./threads [segundos]   (padrao 15, maximo 60)
 * Cria 3 threads que ficam ativas pelo tempo indicado. Cada uma mostra seu
 * TID e os enderecos de uma variavel global (compartilhada) e de uma local
 * (na pilha privada da thread). Chamado 2 (I4).
 * Compile com: gcc -std=c11 -Wall -Wextra threads.c -o threads -pthread */
#define _GNU_SOURCE /* gettid() */
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <unistd.h>
#include <pthread.h>

#define NTHREADS 3

static int global = 0;                       /* segmento de dados: compartilhado */
static int segundos = 15;
static pthread_mutex_t saida = PTHREAD_MUTEX_INITIALIZER;

static void *trabalhar(void *arg) {
    int numero = *(int *)arg;
    int local = numero * 100;                /* pilha desta thread: privada */
    pthread_mutex_lock(&saida);
    printf("thread %d | PID=%d TID=%d | &global=%p | &local=%p (local=%d)\n",
           numero, (int)getpid(), (int)gettid(), (void *)&global, (void *)&local, local);
    fflush(stdout);
    pthread_mutex_unlock(&saida);
    struct timespec t = {segundos, 0};
    nanosleep(&t, NULL);                     /* fica viva para ser observada */
    return NULL;
}

int main(int argc, char *argv[]) {
    if (argc > 1) segundos = atoi(argv[1]);
    if (segundos < 1 || segundos > 60) {
        fputs("Use entre 1 e 60 segundos.\n", stderr);
        return 1;
    }
    printf("main     | PID=%d TID=%d | &global=%p\n",
           (int)getpid(), (int)gettid(), (void *)&global);
    printf("Observe em ate %d s: ps -T -p %d   e   ls /proc/%d/task\n",
           segundos, (int)getpid(), (int)getpid());
    fflush(stdout);

    pthread_t t[NTHREADS];
    int numeros[NTHREADS];
    for (int i = 0; i < NTHREADS; i++) {
        numeros[i] = i + 1;
        if (pthread_create(&t[i], NULL, trabalhar, &numeros[i]) != 0) {
            fputs("Falha ao criar thread; avise o professor.\n", stderr);
            return 1;
        }
    }
    for (int i = 0; i < NTHREADS; i++) pthread_join(t[i], NULL);
    puts("main: todas as threads terminaram (pthread_join).");
    return 0;
}
