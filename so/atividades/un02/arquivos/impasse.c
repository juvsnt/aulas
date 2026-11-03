/* impasse.c - o programa que congela (deadlock controlado).
 * Uso: ./impasse opostos [segundos] | ./impasse ordenado
 *   opostos : thread 1 pega A e pede B; thread 2 pega B e pede A.
 *             Cada uma desiste apos o prazo (padrao 5 s, maximo 20), entao
 *             o impasse e DETECTADO e o programa termina sozinho.
 *   ordenado: as duas pedem A e depois B (ordenacao global): sem impasse.
 * Chamado 3 (I6). Compile com -pthread. */
#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <time.h>
#include <unistd.h>
#include <pthread.h>

static pthread_mutex_t A = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t B = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t saida = PTHREAD_MUTEX_INITIALIZER;
static int prazo = 5;

struct papel {
    int id;
    pthread_mutex_t *primeiro, *segundo;
    const char *nome1, *nome2;
    int conseguiu;
};

static void dizer(int id, const char *msg, const char *recurso) {
    pthread_mutex_lock(&saida);
    printf("thread %d: %s %s\n", id, msg, recurso);
    fflush(stdout);
    pthread_mutex_unlock(&saida);
}

static void *executar(void *arg) {
    struct papel *p = arg;
    pthread_mutex_lock(p->primeiro);
    dizer(p->id, "segura", p->nome1);
    struct timespec pausa = {0, 200 * 1000 * 1000};  /* da tempo a outra pegar o seu */
    nanosleep(&pausa, NULL);

    dizer(p->id, "pede", p->nome2);
    struct timespec limite;
    clock_gettime(CLOCK_REALTIME, &limite);
    limite.tv_sec += prazo;
    int r = pthread_mutex_timedlock(p->segundo, &limite); /* bloqueia ate o prazo */
    if (r == 0) {
        dizer(p->id, "conseguiu tambem", p->nome2);
        p->conseguiu = 1;
        pthread_mutex_unlock(p->segundo);
    } else if (r == ETIMEDOUT) {
        dizer(p->id, "DESISTIU apos o prazo; continua sem", p->nome2);
    } else {
        dizer(p->id, "erro inesperado ao pedir", p->nome2);
    }
    pthread_mutex_unlock(p->primeiro);
    dizer(p->id, "liberou", p->nome1);
    return NULL;
}

int main(int argc, char *argv[]) {
    const char *m = argc > 1 ? argv[1] : "";
    int opostos;
    if (strcmp(m, "opostos") == 0) opostos = 1;
    else if (strcmp(m, "ordenado") == 0) opostos = 0;
    else { fputs("Uso: ./impasse opostos [segundos] | ./impasse ordenado\n", stderr); return 1; }
    if (opostos && argc > 2) prazo = atoi(argv[2]);
    if (prazo < 1 || prazo > 20) { fputs("Use um prazo entre 1 e 20 segundos.\n", stderr); return 1; }

    printf("PID=%d | modo %s | prazo de espera %d s\n", (int)getpid(), m, prazo);
    if (opostos)
        printf("Observe em outro terminal: ps -L -o pid,lwp,stat,pcpu,comm -p %d\n", (int)getpid());
    fflush(stdout);

    struct papel p1 = {1, &A, &B, "A", "B", 0};
    struct papel p2 = opostos ? (struct papel){2, &B, &A, "B", "A", 0}
                              : (struct papel){2, &A, &B, "A", "B", 0};
    pthread_t t1, t2;
    if (pthread_create(&t1, NULL, executar, &p1) != 0 ||
        pthread_create(&t2, NULL, executar, &p2) != 0) {
        fputs("Falha ao criar thread; avise o professor.\n", stderr);
        return 1;
    }
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);

    if (p1.conseguiu && p2.conseguiu)
        puts("Resultado: as duas threads concluiram. Sem impasse.");
    else
        puts("Resultado: IMPASSE detectado - cada thread esperava um recurso preso pela outra.");
    return 0;
}
