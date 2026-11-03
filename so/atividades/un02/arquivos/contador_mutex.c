/* contador_mutex.c - a mesma soma, agora protegida com pthread_mutex.
 * O mutex garante que so uma thread por vez executa LER, PROCESSAR e
 * ESCREVER: as outras ficam bloqueadas em pthread_mutex_lock ate a
 * atual chamar pthread_mutex_unlock.
 * Uso: ./contador_mutex
 * Chamado 2 (I5, t07, t08). Compile com -pthread. */
#include <stdio.h>
#include <pthread.h>

#define NTHREADS 4
#define VOLTAS 20000
#define RODADAS 3

static int contador;
static pthread_mutex_t trava = PTHREAD_MUTEX_INITIALIZER;

static void *trabalhar(void *arg) {
    (void)arg;
    for (int i = 0; i < VOLTAS; i++) {
        pthread_mutex_lock(&trava);
        int valor = contador;            /* LER, PROCESSAR e ESCREVER agora ficam */
        valor = valor + 1;                /* indivisiveis do ponto de vista das */
        contador = valor;                 /* outras threads: nenhuma entra no meio */
        pthread_mutex_unlock(&trava);
    }
    return NULL;
}

int main(void) {
    int esperado = NTHREADS * VOLTAS;
    printf("Modo: mutex | %d threads x %d incrementos = %d esperado\n",
           NTHREADS, VOLTAS, esperado);
    for (int r = 1; r <= RODADAS; r++) {
        contador = 0;
        pthread_t t[NTHREADS];
        for (int i = 0; i < NTHREADS; i++) {
            if (pthread_create(&t[i], NULL, trabalhar, NULL) != 0) {
                fputs("Falha ao criar thread; avise o professor.\n", stderr);
                return 1;
            }
        }
        for (int i = 0; i < NTHREADS; i++) pthread_join(t[i], NULL);
        printf("  rodada %d: contador=%d | perdidos=%d\n", r, contador, esperado - contador);
    }
    return 0;
}
