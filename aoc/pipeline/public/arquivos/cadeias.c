/* cadeias.c - MEDICAO REAL: o somador do processador tambem e um pipeline.
   Faz sempre o mesmo numero de somas de ponto flutuante (double), mas
   divididas em 1, 2, 4, 8 ou 12 "cadeias". Numa cadeia, cada soma usa o
   resultado da anterior (dependencia de dados). Cadeias diferentes sao
   independentes e podem ocupar o somador ao mesmo tempo.
   Uso: ./cadeias */
#define _POSIX_C_SOURCE 199309L
#include <stdio.h>
#include <time.h>

#define SOMAS (3L << 25)   /* 100.663.296 somas em cada linha (divisivel por 12) */
#define RODADAS 8          /* usa a rodada mais rapida de cada linha */
#define REGUA (1L << 24)   /* somas da regua em cada rodada */

/* Tempo de CPU deste programa: nao conta o tempo em que ele esperou a vez
   enquanto outros programas (de colegas) usavam o processador. */
static double agora(void) {
    struct timespec t;
    clock_gettime(CLOCK_PROCESS_CPUTIME_ID, &t);
    return (double)t.tv_sec + (double)t.tv_nsec * 1e-9;
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

static volatile double um = 1.0;   /* lido da memoria: o compilador nao adivinha */

/* Cada funcao faz as mesmas SOMAS somas, em 1, 2, 4, 8 ou 12 cadeias.
   Cada cadeia comeca num valor diferente; se todas comecassem iguais, o
   compilador perceberia e faria uma so. O resultado desconta esse inicio.
   Sem "static", o compilador mantem cada funcao separada e simples. */
double cadeia1(double x) {
    double a = 0;
    for (long i = 0; i < SOMAS; i++) { a += x; }
    return a;
}
double cadeia2(double x) {
    double a = 0, b = 1;
    for (long i = 0; i < SOMAS; i += 2) { a += x; b += x; }
    return a + b - 1;
}
double cadeia4(double x) {
    double a = 0, b = 1, c = 2, d = 3;
    for (long i = 0; i < SOMAS; i += 4) { a += x; b += x; c += x; d += x; }
    return a + b + c + d - 6;
}
double cadeia8(double x) {
    double a = 0, b = 1, c = 2, d = 3, e = 4, f = 5, g = 6, h = 7;
    for (long i = 0; i < SOMAS; i += 8) {
        a += x; b += x; c += x; d += x; e += x; f += x; g += x; h += x;
    }
    return a + b + c + d + e + f + g + h - 28;
}
double cadeia12(double x) {
    double a = 0, b = 1, c = 2, d = 3, e = 4, f = 5, g = 6, h = 7;
    double p = 8, q = 9, r = 10, s = 11;
    for (long i = 0; i < SOMAS; i += 12) {
        a += x; b += x; c += x; d += x; e += x; f += x; g += x; h += x;
        p += x; q += x; r += x; s += x;
    }
    return a + b + c + d + e + f + g + h + p + q + r + s - 66;
}

static double somar(int n) {
    if (n == 1) return cadeia1(um);
    if (n == 2) return cadeia2(um);
    if (n == 4) return cadeia4(um);
    if (n == 8) return cadeia8(um);
    return cadeia12(um);
}

int main(void) {
    /* Rodadas intercaladas: cada rodada mede a regua e todas as linhas.
       Se outro programa dividir o mesmo nucleo por um momento, so algumas
       rodadas ficam lentas; usamos a mais rapida de cada medida. */
    const int n[] = {1, 2, 4, 8, 12};
    double tempo[5] = {1e9, 1e9, 1e9, 1e9, 1e9}, resultado[5] = {0};
    double ciclo = 1e9;
    regua_ns();   /* aquecimento: da tempo ao processador de acelerar */
    for (int r = 0; r < RODADAS; r++) {
        double c = regua_ns();
        if (c < ciclo) ciclo = c;
        for (int k = 0; k < 5; k++) {
            double t0 = agora();
            resultado[k] = somar(n[k]);
            double t = agora() - t0;
            if (t < tempo[k]) tempo[k] = t;
        }
    }

    printf("Mesmas %ld somas em cada linha; melhor de %d rodadas.\n", SOMAS, RODADAS);
    printf("Regua: 1 ciclo de relogio = %.3f ns (clock estimado: %.1f GHz)\n\n",
           ciclo, 1.0 / ciclo);
    printf("cadeias   tempo(ms)   ns/soma   ciclos/soma    resultado\n");
    for (int k = 0; k < 5; k++) {
        double ns = tempo[k] / (double)SOMAS * 1e9;
        printf("%7d %11.1f %9.3f %13.2f %12.0f\n", n[k], tempo[k] * 1e3, ns, ns / ciclo,
               resultado[k]);
    }
    return 0;
}
