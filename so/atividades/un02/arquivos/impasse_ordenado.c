/* impasse_ordenado.c - a mesma disputa pelos mutex A e B, mas agora as
 * DUAS threads pedem os recursos na mesma ordem (primeiro A, depois B).
 * Essa disciplina - ordenacao global dos locks - elimina a espera
 * circular e, com ela, a possibilidade de impasse.
 * Uso: ./impasse_ordenado
 * Chamado 3 (I6, t08). Compile com -pthread. */
#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <time.h>
#include <unistd.h>
#include <pthread.h>

static pthread_mutex_t A = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t B = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t saida = PTHREAD_MUTEX_INITIALIZER;

static void dizer(int id, const char *msg, const char *recurso) {
    pthread_mutex_lock(&saida);
    printf("thread %d: %s %s\n", id, msg, recurso);
    fflush(stdout);
    pthread_mutex_unlock(&saida);
}

static void *trabalhar(void *arg) {
    int id = *(int *)arg;
    pthread_mutex_lock(&A);              /* sempre pede A primeiro */
    dizer(id, "segura", "A");
    struct timespec pausa = {0, 200 * 1000 * 1000};
    nanosleep(&pausa, NULL);

    dizer(id, "pede", "B");
    pthread_mutex_lock(&B);              /* ...e so depois pede B */
    dizer(id, "conseguiu tambem", "B");
    pthread_mutex_unlock(&B);
    pthread_mutex_unlock(&A);
    dizer(id, "liberou", "A");
    return NULL;
}

int main(void) {
    printf("PID=%d | as duas threads pedem A e depois B\n", (int)getpid());
    fflush(stdout);

    int id1 = 1, id2 = 2;
    pthread_t t1, t2;
    if (pthread_create(&t1, NULL, trabalhar, &id1) != 0 ||
        pthread_create(&t2, NULL, trabalhar, &id2) != 0) {
        fputs("Falha ao criar thread; avise o professor.\n", stderr);
        return 1;
    }
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    puts("Resultado: as duas threads concluiram. Sem impasse.");
    return 0;
}
