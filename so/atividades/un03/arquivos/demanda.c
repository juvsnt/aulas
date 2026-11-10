/* demanda.c - paginacao sob demanda (Atividade 1).
 * Reserva 32 MiB e mostra, em cada etapa, quanta RAM o processo usa
 * e quantas faltas de pagina novas aconteceram. */
#define _DEFAULT_SOURCE
#include <stdio.h>
#include <string.h>
#include <sys/mman.h>
#include <sys/resource.h>
#include <unistd.h>

#define TAMANHO (32L * 1024 * 1024)   /* 32 MiB */

static long faltas_antes = 0;

/* RAM usada pelo processo (VmRSS em /proc/self/status), em KiB */
static long ram_kib(void) {
    char linha[256];
    long kib = 0;
    FILE *f = fopen("/proc/self/status", "r");
    if (f == NULL) return 0;
    while (fgets(linha, sizeof linha, f) != NULL)
        if (strncmp(linha, "VmRSS:", 6) == 0) sscanf(linha + 6, "%ld", &kib);
    fclose(f);
    return kib;
}

/* Mostra a RAM usada e as faltas de pagina desde a etapa anterior */
static void mostra(const char *etapa) {
    struct rusage uso;
    getrusage(RUSAGE_SELF, &uso);
    long faltas = uso.ru_minflt;     /* faltas resolvidas sem ler o disco */
    printf("%-18s | RAM usada: %5.1f MiB | faltas novas: %ld\n",
           etapa, (double)ram_kib() / 1024.0, faltas - faltas_antes);
    faltas_antes = faltas;
}

/* Escreve 1 byte em cada pagina, do inicio ate o byte 'fim' */
static void usa(char *mem, long fim, long pagina) {
    for (long i = 0; i < fim; i += pagina)
        mem[i] = 1;
}

int main(void) {
    long pagina = sysconf(_SC_PAGESIZE);
    printf("Pagina: %ld bytes. 32 MiB = %ld paginas.\n\n", pagina, TAMANHO / pagina);
    mostra("inicio");

    char *mem = mmap(NULL, TAMANHO, PROT_READ | PROT_WRITE,
                     MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);     /* reserva */
    if (mem == MAP_FAILED) { perror("mmap"); return 1; }
    madvise(mem, TAMANHO, MADV_NOHUGEPAGE);   /* usar paginas de tamanho normal */
    mostra("reservou 32 MiB");

    usa(mem, TAMANHO / 2, pagina);
    mostra("usou a metade");
    usa(mem, TAMANHO, pagina);
    mostra("usou tudo");
    usa(mem, TAMANHO, pagina);
    mostra("usou tudo de novo");

    munmap(mem, TAMANHO);
    return 0;
}
