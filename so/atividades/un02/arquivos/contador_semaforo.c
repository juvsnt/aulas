/* contador_semaforo.c - 5 threads disputam 3 "vagas" controladas por um
 * semaforo contador. wait(S) ocupa uma vaga ou bloqueia se nao houver
 * nenhuma livre; signal(S) libera uma vaga e pode acordar quem esperava.
 * Uso: ./contador_semaforo
 * Chamado 2 (I5, extensao · t08). Compile com -pthread. */
#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <time.h>
#include <pthread.h>
#include <semaphore.h>

#define CLIENTES 5
#define VAGAS 3

static sem_t vagas;
static int dentro, maximo;                /* protegidos pelo mutex abaixo */
static pthread_mutex_t registro = PTHREAD_MUTEX_INITIALIZER;
static struct timespec t0;

static double decorrido(void) {
    struct timespec t;
    clock_gettime(CLOCK_MONOTONIC, &t);
    return (double)(t.tv_sec - t0.tv_sec) + (double)(t.tv_nsec - t0.tv_nsec) / 1e9;
}

/* Atualiza quantas threads estao "dentro" e imprime no mesmo passo, para
 * o registro sair na ordem real dos acontecimentos. */
static void registrar(int id, const char *evento, int delta) {
    pthread_mutex_lock(&registro);
    dentro += delta;
    if (dentro > maximo) maximo = dentro;
    printf("  t=%.2f s  thread %d %-7s (dentro=%d)\n", decorrido(), id, evento, dentro);
    fflush(stdout);
    pthread_mutex_unlock(&registro);
}

static void *cliente(void *arg) {
    int id = *(int *)arg;
    registrar(id, "chegou", 0);
    sem_wait(&vagas);                      /* wait(S): ocupa uma vaga ou bloqueia */
    registrar(id, "entrou", +1);
    struct timespec uso = {0, 400 * 1000 * 1000}; /* usa a vaga por 0,4 s */
    nanosleep(&uso, NULL);
    registrar(id, "saiu", -1);
    sem_post(&vagas);                      /* signal(S): libera a vaga */
    return NULL;
}

int main(void) {
    printf("Modo: semaforo | %d threads, %d vagas (S inicial = %d)\n", CLIENTES, VAGAS, VAGAS);
    if (sem_init(&vagas, 0, VAGAS) != 0) { perror("sem_init"); return 1; }
    clock_gettime(CLOCK_MONOTONIC, &t0);

    pthread_t t[CLIENTES];
    int ids[CLIENTES];
    for (int i = 0; i < CLIENTES; i++) {
        ids[i] = i + 1;
        if (pthread_create(&t[i], NULL, cliente, &ids[i]) != 0) {
            fputs("Falha ao criar thread; avise o professor.\n", stderr);
            return 1;
        }
    }
    for (int i = 0; i < CLIENTES; i++) pthread_join(t[i], NULL);
    sem_destroy(&vagas);
    printf("Maximo de threads dentro ao mesmo tempo: %d (limite %d)\n", maximo, VAGAS);
    return 0;
}
