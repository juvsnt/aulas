/* contador_ingenuo.c - tentativa de protecao com uma trava "caseira":
 * uma variavel "ocupado" que cada thread testa antes de entrar.
 * A trava falha porque TESTAR e MARCAR sao dois passos separados: uma
 * thread pode passar pelo teste um instante antes de outra marcar a
 * trava, e as duas entram juntas na regiao critica.
 * Uso: ./contador_ingenuo
 * Chamado 2 (I5, t07). Compile com -pthread. */
#include <stdio.h>
#include <sched.h>
#include <pthread.h>

#define NTHREADS 4
#define VOLTAS 20000
#define RODADAS 3

static int contador;
static int ocupado;                      /* 0 = livre, 1 = ocupado: a trava ingenua */

static void *trabalhar(void *arg) {
    (void)arg;
    for (int i = 0; i < VOLTAS; i++) {
        while (ocupado) sched_yield();   /* 1. TESTA: espera a trava ficar livre */
        sched_yield();                   /* ...outra thread pode passar aqui tambem... */
        ocupado = 1;                     /* 2. MARCA: so depois de testar */

        int valor = contador;            /* regiao critica: LER, PROCESSAR, ESCREVER */
        valor = valor + 1;
        contador = valor;

        ocupado = 0;
    }
    return NULL;
}

int main(void) {
    int esperado = NTHREADS * VOLTAS;
    printf("Modo: trava ingenua | %d threads x %d incrementos = %d esperado\n",
           NTHREADS, VOLTAS, esperado);
    for (int r = 1; r <= RODADAS; r++) {
        contador = 0;
        ocupado = 0;
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
