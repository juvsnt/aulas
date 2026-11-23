/* desvios.c - MEDICAO REAL: o processador tenta adivinhar os desvios.
   Percorre os mesmos 65.536 numeros (0 a 255) em tres ordens e soma
   so os que sao >= 128. O "if" vira uma instrucao de desvio condicional
   (branch). Muda so a ordem: a quantidade de trabalho e a mesma.
   Uso: ./desvios */
#define _POSIX_C_SOURCE 199309L
#include <stdio.h>
#include <time.h>

#define N 65536
#define VOLTAS 200         /* 200 voltas: 13.107.200 desvios por ordem */
#define RODADAS 10         /* usa a rodada mais rapida de cada ordem */
#define REGUA (1L << 24)   /* somas da regua em cada rodada */

static unsigned char v[3][N];   /* os mesmos numeros em tres ordens */
static unsigned semente = 2026;

/* Tempo de CPU deste programa: nao conta o tempo em que ele esperou a vez
   enquanto outros programas (de colegas) usavam o processador. */
static double agora(void) {
    struct timespec t;
    clock_gettime(CLOCK_PROCESS_CPUTIME_ID, &t);
    return (double)t.tv_sec + (double)t.tv_nsec * 1e-9;
}

static unsigned sorteio(void) {   /* gerador simples, sempre a mesma sequencia */
    semente = semente * 1103515245u + 12345u;
    return semente >> 16;
}

/* Regua: soma de inteiros em cadeia. Cada soma depende da anterior e leva
   1 ciclo de relogio; entao "ns por soma" = duracao de 1 ciclo. Sao 8 somas
   por volta para que o proprio laco (o salto de volta) nao atrase a regua.
   O valor somado vem da memoria (passo), para o processador nao adiantar
   a conta como faria com uma constante. */
static volatile long passo = 1;
#define SOMA1 x = x + y; __asm__ volatile("" : "+r"(x));  /* asm: o compilador */
static double regua_ns(void) {                            /* nao pode pular  */
    long x = 0, y = passo;                                /* nenhuma soma    */
    double t0 = agora();
    for (long i = 0; i < REGUA; i += 8) {
        SOMA1 SOMA1 SOMA1 SOMA1 SOMA1 SOMA1 SOMA1 SOMA1
    }
    return (agora() - t0) / (double)REGUA * 1e9;
}

static long percorrer(const unsigned char *a) {
    long soma = 0;
    for (int r = 0; r < VOLTAS; r++)
        for (int i = 0; i < N; i++)
            if (a[i] >= 128) {                 /* o desvio que sera adivinhado */
                soma += a[i];
                __asm__ volatile("");           /* mantem o desvio de verdade */
            }
    return soma;
}

int main(void) {
    /* alternada: pequeno (0-127), grande (128-255), pequeno, grande... */
    int conta[256] = {0}, p = 0;
    for (int i = 0; i < N; i++) {
        v[1][i] = (unsigned char)(sorteio() % 128 + (i % 2 ? 128 : 0));
        v[2][i] = v[1][i];
        conta[v[1][i]]++;
    }
    for (int x = 0; x < 256; x++)                  /* ordenada: crescente */
        while (conta[x]--) v[0][p++] = (unsigned char)x;
    for (int i = N - 1; i > 0; i--) {              /* aleatoria: embaralha */
        int j = (int)(sorteio() % (unsigned)(i + 1));
        unsigned char t = v[2][i]; v[2][i] = v[2][j]; v[2][j] = t;
    }

    /* Rodadas intercaladas: cada rodada mede a regua e as tres ordens.
       Se outro programa dividir o mesmo nucleo por um momento, so algumas
       rodadas ficam lentas; usamos a mais rapida de cada medida. */
    const char *nome[] = {"ordenada", "alternada", "aleatoria"};
    double tempo[3] = {1e9, 1e9, 1e9}, ciclo = 1e9;
    long resultado[3] = {0, 0, 0};
    regua_ns();   /* aquecimento: da tempo ao processador de acelerar */
    for (int r = 0; r < RODADAS; r++) {
        double c = regua_ns();
        if (c < ciclo) ciclo = c;
        for (int k = 0; k < 3; k++) {
            double t0 = agora();
            resultado[k] = percorrer(v[k]);
            double t = agora() - t0;
            if (t < tempo[k]) tempo[k] = t;
        }
    }

    printf("Mesmos %d numeros, %d voltas: %ld desvios por ordem; melhor de %d rodadas.\n",
           N, VOLTAS, (long)N * VOLTAS, RODADAS);
    printf("Regua: 1 ciclo de relogio = %.3f ns (clock estimado: %.1f GHz)\n\n",
           ciclo, 1.0 / ciclo);
    printf("ordem        tempo(ms)   ns/numero   ciclos/numero    resultado\n");
    for (int k = 0; k < 3; k++) {
        double ns = tempo[k] / ((double)N * VOLTAS) * 1e9;
        printf("%-10s %11.1f %11.3f %15.2f %12ld\n", nome[k], tempo[k] * 1e3, ns, ns / ciclo,
               resultado[k]);
    }
    return 0;
}
