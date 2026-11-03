/* impasse_opostos.c - deadlock controlado: a thread 1 pega o mutex A e
 * pede o B; a thread 2 pega o B e pede o A. Cada uma so espera pelo
 * SEGUNDO mutex por um PRAZO (pthread_mutex_timedlock); se o prazo
 * passar, ela desiste, libera o que tinha e o impasse e DETECTADO.
 * Uso: ./impasse_opostos [segundos de prazo]   (padrao 5, maximo 20)
 * Chamado 3 (I6, t08). Compile com -pthread. */
#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <time.h>
#include <unistd.h>
#include <pthread.h>

static pthread_mutex_t A = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t B = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t saida = PTHREAD_MUTEX_INITIALIZER;
static int prazo = 5;
static int t1_conseguiu, t2_conseguiu;

static void dizer(int id, const char *msg, const char *recurso) {
    pthread_mutex_lock(&saida);
    printf("thread %d: %s %s\n", id, msg, recurso);
    fflush(stdout);
    pthread_mutex_unlock(&saida);
}

/* Prazo de espera pelo SEGUNDO mutex, a partir de agora. */
static void calcular_prazo(struct timespec *limite) {
    clock_gettime(CLOCK_REALTIME, limite);
    limite->tv_sec += prazo;
}

static void *thread1(void *arg) {
    (void)arg;
    pthread_mutex_lock(&A);
    dizer(1, "segura", "A");
    struct timespec pausa = {0, 200 * 1000 * 1000}; /* da tempo a thread 2 pegar o B */
    nanosleep(&pausa, NULL);

    dizer(1, "pede", "B");
    struct timespec limite;
    calcular_prazo(&limite);
    int r = pthread_mutex_timedlock(&B, &limite);    /* bloqueia ATE o prazo */
    if (r == 0) {
        dizer(1, "conseguiu tambem", "B");
        t1_conseguiu = 1;
        pthread_mutex_unlock(&B);
    } else if (r == ETIMEDOUT) {
        dizer(1, "DESISTIU apos o prazo; continua sem", "B");
    }
    pthread_mutex_unlock(&A);
    dizer(1, "liberou", "A");
    return NULL;
}

static void *thread2(void *arg) {
    (void)arg;
    pthread_mutex_lock(&B);
    dizer(2, "segura", "B");
    struct timespec pausa = {0, 200 * 1000 * 1000};
    nanosleep(&pausa, NULL);

    dizer(2, "pede", "A");
    struct timespec limite;
    calcular_prazo(&limite);
    int r = pthread_mutex_timedlock(&A, &limite);
    if (r == 0) {
        dizer(2, "conseguiu tambem", "A");
        t2_conseguiu = 1;
        pthread_mutex_unlock(&A);
    } else if (r == ETIMEDOUT) {
        dizer(2, "DESISTIU apos o prazo; continua sem", "A");
    }
    pthread_mutex_unlock(&B);
    dizer(2, "liberou", "B");
    return NULL;
}

int main(int argc, char *argv[]) {
    if (argc > 1) prazo = atoi(argv[1]);
    if (prazo < 1 || prazo > 20) { fputs("Use um prazo entre 1 e 20 segundos.\n", stderr); return 1; }

    printf("PID=%d | prazo de espera %d s\n", (int)getpid(), prazo);
    printf("Observe em outro terminal: ps -L -o pid,lwp,stat,pcpu,comm -p %d\n", (int)getpid());
    fflush(stdout);

    pthread_t t1, t2;
    if (pthread_create(&t1, NULL, thread1, NULL) != 0 ||
        pthread_create(&t2, NULL, thread2, NULL) != 0) {
        fputs("Falha ao criar thread; avise o professor.\n", stderr);
        return 1;
    }
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);

    if (t1_conseguiu && t2_conseguiu)
        puts("Resultado: as duas threads concluiram. Sem impasse.");
    else
        puts("Resultado: IMPASSE detectado - cada thread esperava um recurso preso pela outra.");
    return 0;
}
