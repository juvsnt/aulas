/* contador_sem.c - o contador que perde registros (SEM protecao).
 * 4 threads somam 1 no mesmo contador, 20000 vezes cada. Para a CPU,
 * "contador = contador + 1" sao 3 passos: LER, PROCESSAR e ESCREVER.
 * Aqui forcamos de proposito uma pausa entre LER e ESCREVER
 * (sched_yield), para a janela em que outra thread pode entrar no meio
 * ficar visivel sempre, mesmo com uma unica CPU.
 * Uso: ./contador_sem
 * Chamado 2 (I5, t07). Compile com -pthread. */
#include <stdio.h>
#include <sched.h>
#include <pthread.h>

#define NTHREADS 4
#define VOLTAS 20000
#define RODADAS 3

static int contador;

static void *trabalhar(void *arg) {
    (void)arg;
    for (int i = 0; i < VOLTAS; i++) {
        int valor = contador;            /* 1. LER */
        sched_yield();                   /* ...outra thread pode entrar aqui... */
        valor = valor + 1;                /* 2. PROCESSAR */
        contador = valor;                 /* 3. ESCREVER */
    }
    return NULL;
}

int main(void) {
    int esperado = NTHREADS * VOLTAS;
    printf("Modo: sem protecao | %d threads x %d incrementos = %d esperado\n",
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
