#define _GNU_SOURCE
#include <errno.h>
#include <inttypes.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <sched.h>

/* Experimentos reais, sem alterar afinidade, frequencia ou politicas do Linux.
 * As leituras volatile preservam a ordem dos acessos nos dois percursos.
 * Isso e uma escolha didatica: nao e um benchmark de codigo vetorizado. */
enum { RODADAS = 5, PASSAGENS = 4 };
typedef struct { double parede, cpu; } Medida;
typedef struct { uint32_t proximo; unsigned char reserva[60]; } No;
_Static_assert(sizeof(No) == 64, "O no didatico deve ter 64 bytes");
static volatile uint64_t conferidor;
static double inicio_parede, inicio_cpu;

static double agora(clockid_t relogio) {
    struct timespec t;
    if (clock_gettime(relogio, &t) != 0) { perror("relogio"); exit(1); }
    return (double)t.tv_sec + (double)t.tv_nsec / 1e9;
}
static void limite(void) {
    if (agora(CLOCK_MONOTONIC) - inicio_parede > 30.0 ||
        agora(CLOCK_PROCESS_CPUTIME_ID) - inicio_cpu > 12.0) {
        fputs("Teste interrompido: limite didatico de tempo atingido.\n"
              "Guarde esta mensagem; um teste incompleto nao permite conclusao.\n", stderr);
        exit(2);
    }
}
static int comparar(const void *a, const void *b) {
    double x = *(const double *)a, y = *(const double *)b;
    return (x > y) - (x < y);
}
static double mediana(double valores[RODADAS]) {
    double copia[RODADAS];
    memcpy(copia, valores, sizeof copia);
    qsort(copia, RODADAS, sizeof(double), comparar);
    return copia[RODADAS / 2];
}
static void resumo(const char *nome, Medida m[RODADAS], double acessos) {
    double parede[RODADAS], cpu[RODADAS], menor = 1e99, maior = 0;
    for (int i = 0; i < RODADAS; ++i) {
        parede[i] = m[i].parede; cpu[i] = m[i].cpu;
        if (parede[i] < menor) menor = parede[i];
        if (parede[i] > maior) maior = parede[i];
    }
    printf("RESUMO %s | mediana_parede_ms=%.6f | mediana_cpu_ms=%.6f"
           " | ns_por_acesso_parede=%.3f | ns_por_acesso_cpu=%.3f"
           " | maior_dividido_menor=%.2f\n", nome,
           mediana(parede) * 1e3, mediana(cpu) * 1e3,
           mediana(parede) * 1e9 / acessos, mediana(cpu) * 1e9 / acessos,
           maior / menor);
}
/* Sem acesso a arquivo, tela ou alocacao dentro da parte cronometrada. */
static uint64_t ler_matriz(const volatile uint32_t *a, size_t n, int colunas) {
    uint64_t soma = 0;
    for (int p = 0; p < PASSAGENS; ++p)
        for (size_t externo = 0; externo < n; ++externo)
            for (size_t interno = 0; interno < n; ++interno) {
                size_t pos = colunas ? interno * n + externo : externo * n + interno;
                soma += a[pos];
            }
    return soma;
}
static Medida medir_matriz(uint32_t *a, size_t n, int colunas, uint64_t esperado) {
    conferidor = ler_matriz(a, n, colunas); /* aquecimento fora da medida */
    double p = agora(CLOCK_MONOTONIC), c = agora(CLOCK_PROCESS_CPUTIME_ID);
    uint64_t soma = ler_matriz(a, n, colunas);
    Medida m = {0, 0};
    m.cpu = agora(CLOCK_PROCESS_CPUTIME_ID) - c;
    m.parede = agora(CLOCK_MONOTONIC) - p;
    conferidor = soma;
    if (soma != esperado) { fputs("ERRO: soma diferente da esperada\n", stderr); exit(1); }
    return m;
}
static int matriz(size_t n) {
    size_t quantidade = n * n;
    uint32_t *a = malloc(quantidade * sizeof *a);
    if (!a) { fputs("Sem memoria para a matriz. Avise o professor.\n", stderr); return 1; }
    uint64_t esperado = 0;
    for (size_t i = 0; i < quantidade; ++i) { a[i] = (uint32_t)(i % 97); esperado += a[i]; }
    esperado *= PASSAGENS;
    Medida linhas[RODADAS], colunas[RODADAS];
    printf("MATRIZ n=%zu | dados_bytes=%zu | passagens=%d | rodadas=%d\n",
           n, quantidade * sizeof *a, PASSAGENS, RODADAS);
    for (int r = 0; r < RODADAS; ++r) {
        limite();
        int antes = sched_getcpu();
        if (r % 2 == 0) {
            linhas[r] = medir_matriz(a, n, 0, esperado); limite();
            colunas[r] = medir_matriz(a, n, 1, esperado);
        } else {
            colunas[r] = medir_matriz(a, n, 1, esperado); limite();
            linhas[r] = medir_matriz(a, n, 0, esperado);
        }
        printf("RODADA %d | ordem=%s | linhas_ms=%.6f | colunas_ms=%.6f | cpu_inicio=%d | cpu_fim=%d\n",
               r + 1, r % 2 ? "colunas-linhas" : "linhas-colunas",
               linhas[r].parede * 1e3, colunas[r].parede * 1e3, antes, sched_getcpu());
    }
    resumo("linhas", linhas, (double)quantidade * PASSAGENS);
    resumo("colunas", colunas, (double)quantidade * PASSAGENS);
    printf("CONFERENCIA soma=%" PRIu64 " esperado=%" PRIu64 " OK\n", conferidor, esperado);
    free(a); return 0;
}
static uint32_t aleatorio(uint32_t *estado) {
    *estado ^= *estado << 13; *estado ^= *estado >> 17; *estado ^= *estado << 5;
    return *estado;
}
static uint32_t seguir(const volatile No *nos, uint32_t pos, size_t passos) {
    for (size_t i = 0; i < passos; ++i) pos = nos[pos].proximo;
    return pos;
}
static int cadeia(int inversa) {
    const size_t tamanhos[] = {8, 32, 256, 2048, 16384}; /* KiB, nao kB */
    const size_t passos = 1048576;
    printf("CADEIA | no_bytes=64 | passos_por_rodada=1048576 | rodadas=5 | semente=2026 | ordem=%s\n", inversa ? "decrescente" : "crescente");
    puts("64 bytes e a distancia escolhida no programa, nao a descoberta da linha fisica.");
    for (size_t t = 0; t < sizeof tamanhos / sizeof tamanhos[0]; ++t) {
        limite();
        size_t tamanho = tamanhos[inversa ? 4 - t : t];
        size_t bytes = tamanho * 1024, n = bytes / sizeof(No);
        No *nos = NULL;
        uint32_t *ordem = malloc(n * sizeof *ordem);
        if (!ordem || posix_memalign((void **)&nos, 64, bytes) != 0) {
            free(ordem); fputs("Sem memoria para a cadeia. Avise o professor.\n", stderr); return 1;
        }
        memset(nos, 0, bytes); /* materializa todas as paginas antes de medir */
        for (size_t i = 0; i < n; ++i) ordem[i] = (uint32_t)i;
        uint32_t estado = 2026;
        for (size_t i = n - 1; i > 0; --i) {
            size_t j = aleatorio(&estado) % (i + 1);
            uint32_t tmp = ordem[i]; ordem[i] = ordem[j]; ordem[j] = tmp;
        }
        for (size_t i = 0; i < n; ++i) nos[ordem[i]].proximo = ordem[(i + 1) % n];
        uint32_t inicio = ordem[0];
        if (seguir(nos, inicio, n) != inicio) { fputs("Ciclo invalido\n", stderr); return 1; }
        free(ordem);
        Medida medidas[RODADAS];
        for (int r = 0; r < RODADAS; ++r) {
            limite();
            conferidor = seguir(nos, inicio, n); /* uma volta de aquecimento */
            double p = agora(CLOCK_MONOTONIC), c = agora(CLOCK_PROCESS_CPUTIME_ID);
            uint32_t fim = seguir(nos, inicio, passos);
            medidas[r].cpu = agora(CLOCK_PROCESS_CPUTIME_ID) - c;
            medidas[r].parede = agora(CLOCK_MONOTONIC) - p;
            conferidor = fim;
            if (fim != inicio) { fputs("Conferencia da cadeia falhou\n", stderr); return 1; }
            printf("RODADA %d | tamanho_KiB=%zu | parede_ms=%.6f | cpu_ms=%.6f\n",
                   r + 1, tamanho, medidas[r].parede * 1e3, medidas[r].cpu * 1e3);
        }
        char nome[40];
        (void)snprintf(nome, sizeof nome, "%zu_KiB", tamanho);
        resumo(nome, medidas, (double)passos);
        printf("CONFERENCIA tamanho_KiB=%zu ciclo_completo=OK\n", tamanho);
        free(nos);
    }
    return 0;
}
int main(int argc, char **argv) {
    inicio_parede = agora(CLOCK_MONOTONIC);
    inicio_cpu = agora(CLOCK_PROCESS_CPUTIME_ID);
    puts("LAB CACHE FISICA v1 | tempos reais deste processo | nao conta hits ou misses");
    puts("Parede: tempo de espera total. CPU: tempo em que este programa usou o processador.");
    if (argc == 2 && strcmp(argv[1], "cadeia") == 0) return cadeia(0);
    if (argc == 3 && strcmp(argv[1], "cadeia") == 0 && strcmp(argv[2], "inversa") == 0) return cadeia(1);
    if (argc == 3 && strcmp(argv[1], "matriz") == 0) {
        char *fim; errno = 0;
        unsigned long n = strtoul(argv[2], &fim, 10);
        if (!errno && *argv[2] && !*fim && (n == 256 || n == 512 || n == 1024 || n == 2048))
            return matriz((size_t)n);
    }
    fputs("Uso: ./cache_lab matriz 1024\n"
          "     ./cache_lab matriz 512\n"
          "     ./cache_lab cadeia\n"
          "     ./cache_lab cadeia inversa\n"
          "Matriz aceita apenas 256, 512, 1024 ou 2048.\n", stderr);
    return 1;
}
