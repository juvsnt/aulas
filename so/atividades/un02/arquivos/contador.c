/* contador.c - o contador de acessos que perde registros.
 * Uso: ./contador sem | ingenuo | mutex | semaforo
 *   sem      : 4 threads somam 1 no contador, sem protecao.
 *   ingenuo  : protecao com uma variavel "ocupado" (trava ingenua).
 *   mutex    : protecao com pthread_mutex.
 *   semaforo : 5 threads disputam 3 vagas controladas por um semaforo.
 * Chamado 2 (I5). Compile com -pthread.
 *
 * Nota tecnica: cada acesso ao contador e atomico isolado (atomic_load e
 * atomic_store), para o programa nao ter comportamento indefinido em C.
 * Mesmo assim LER + SOMAR + GRAVAR, feitos em passos separados, NAO formam
 * uma operacao atomica. Em cerca de 1 a cada 8 incrementos, sorteados, um
 * sched_yield() entre os passos alarga a janela em que outra thread pode
 * entrar, para a falha aparecer (e variar) mesmo com uma unica CPU. */
#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <sched.h>
#include <pthread.h>
#include <semaphore.h>
#include <stdatomic.h>

#define NTHREADS 4
#define VOLTAS 20000
#define RODADAS 3

enum modo { SEM, INGENUO, MUTEX };
static enum modo modo;
static atomic_int contador;
static atomic_int ocupado;                       /* trava ingenua */
static pthread_mutex_t trava = PTHREAD_MUTEX_INITIALIZER;

/* Sorteio simples (xorshift) para decidir quando abrir a janela. */
static int sorteia_janela(unsigned *s) {
    *s ^= *s << 13; *s ^= *s >> 17; *s ^= *s << 5;
    return (*s & 7u) == 0;                       /* verdadeiro em ~1/8 das vezes */
}

static void somar_um(unsigned *s) {              /* a regiao critica */
    int valor = atomic_load(&contador);          /* 1. LER */
    if (sorteia_janela(s)) sched_yield();        /* janela: outra thread pode entrar */
    valor = valor + 1;                           /* 2. PROCESSAR */
    atomic_store(&contador, valor);              /* 3. ESCREVER */
}

static void *trabalhar(void *arg) {
    unsigned semente = (unsigned)*(int *)arg * 2654435761u ^ (unsigned)time(NULL);
    if (semente == 0) semente = 1;
    unsigned *s = &semente;
    for (int i = 0; i < VOLTAS; i++) {
        if (modo == SEM) {
            somar_um(s);
        } else if (modo == INGENUO) {
            while (atomic_load(&ocupado)) sched_yield(); /* testa...           */
            if (sorteia_janela(s)) sched_yield();        /* ...alguem pode passar aqui */
            atomic_store(&ocupado, 1);                   /* ...e so depois marca */
            somar_um(s);
            atomic_store(&ocupado, 0);
        } else {
            pthread_mutex_lock(&trava);
            somar_um(s);
            pthread_mutex_unlock(&trava);
        }
    }
    return NULL;
}

static int rodar_contador(void) {
    const char *nomes[] = {"sem protecao", "trava ingenua", "mutex"};
    int esperado = NTHREADS * VOLTAS;
    printf("Modo: %s | %d threads x %d incrementos = %d esperado\n",
           nomes[modo], NTHREADS, VOLTAS, esperado);
    for (int r = 1; r <= RODADAS; r++) {
        atomic_store(&contador, 0);
        atomic_store(&ocupado, 0);
        pthread_t t[NTHREADS];
        int ids[NTHREADS];
        for (int i = 0; i < NTHREADS; i++) {
            ids[i] = r * 10 + i + 1;             /* semente diferente por thread e rodada */
            if (pthread_create(&t[i], NULL, trabalhar, &ids[i]) != 0) {
                fputs("Falha ao criar thread; avise o professor.\n", stderr);
                return 1;
            }
        }
        for (int i = 0; i < NTHREADS; i++) pthread_join(t[i], NULL);
        int obtido = atomic_load(&contador);
        printf("  rodada %d: contador=%d | perdidos=%d\n", r, obtido, esperado - obtido);
    }
    return 0;
}

/* ---------- modo semaforo: 3 vagas para 5 threads ---------- */
#define CLIENTES 5
#define VAGAS 3
static sem_t vagas;
static int dentro, maximo;                       /* protegidos pelo mutex "registro" */
static pthread_mutex_t registro = PTHREAD_MUTEX_INITIALIZER;
static struct timespec t0;

static double decorrido(void) {
    struct timespec t;
    clock_gettime(CLOCK_MONOTONIC, &t);
    return (double)(t.tv_sec - t0.tv_sec) + (double)(t.tv_nsec - t0.tv_nsec) / 1e9;
}

/* Atualiza a ocupacao (delta = +1, -1 ou 0) e imprime no mesmo passo,
 * para o registro sair na ordem real dos acontecimentos. */
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
    sem_wait(&vagas);                            /* wait(S): ocupa uma vaga ou bloqueia */
    registrar(id, "entrou", +1);
    struct timespec uso = {0, 400 * 1000 * 1000}; /* usa a vaga por 0,4 s */
    nanosleep(&uso, NULL);
    registrar(id, "saiu", -1);
    sem_post(&vagas);                            /* signal(S): libera a vaga */
    return NULL;
}

static int rodar_semaforo(void) {
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

int main(int argc, char *argv[]) {
    const char *m = argc > 1 ? argv[1] : "";
    if (strcmp(m, "sem") == 0)      { modo = SEM;     return rodar_contador(); }
    if (strcmp(m, "ingenuo") == 0)  { modo = INGENUO; return rodar_contador(); }
    if (strcmp(m, "mutex") == 0)    { modo = MUTEX;   return rodar_contador(); }
    if (strcmp(m, "semaforo") == 0) return rodar_semaforo();
    fputs("Uso: ./contador sem | ingenuo | mutex | semaforo\n", stderr);
    return 1;
}
