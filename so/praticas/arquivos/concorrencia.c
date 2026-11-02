#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <pthread.h>
#include <stdatomic.h>
/* Atomico evita data race em C; ler+somar+gravar NAO e um incremento atomico. */
static atomic_int contador;
static pthread_barrier_t barreira;
static pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
static int protegido;
static void *trabalhar(void *arg) {
    (void)arg;
    if (!protegido) {
        int copia = atomic_load(&contador);
        pthread_barrier_wait(&barreira); /* Ambos leem antes de qualquer gravacao. */
        atomic_store(&contador, copia+1);
    } else {
        pthread_mutex_lock(&mutex);
        int copia = atomic_load(&contador);
        atomic_store(&contador, copia+1);
        pthread_mutex_unlock(&mutex);
    }
    return NULL;
}
int main(void) {
    if (pthread_barrier_init(&barreira,NULL,2)) return 1;
    for (int modo=0; modo<2; modo++) {
        protegido=modo; atomic_store(&contador,0);
        pthread_t t[2];
        for (int i=0;i<2;i++) if (pthread_create(&t[i],NULL,trabalhar,NULL)) {
            fputs("Falha ao criar thread; avise o professor.\n",stderr); return 1;
        }
        for (int i=0;i<2;i++) if (pthread_join(t[i],NULL)) return 1;
        printf("%s: contador=%d esperado=2\n",modo?"Com mutex":"Atualizacao perdida",atomic_load(&contador));
    }
    pthread_barrier_destroy(&barreira); pthread_mutex_destroy(&mutex);
    return 0;
}
