/* interrupcoes.c - AOC, Unidade 5, Atividade 1.
   Conta quantas interrupcoes cada dispositivo gerou durante alguns segundos.
   O Linux mantem esses contadores em /proc/interrupts: uma linha por IRQ,
   uma coluna por CPU. O programa le o arquivo duas vezes, calcula a
   diferenca e mostra as linhas que mais cresceram. So faz leitura. */
#define _POSIX_C_SOURCE 200809L
#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#ifndef ARQUIVO
#define ARQUIVO "/proc/interrupts"
#endif
#define MAX_LINHAS 512

typedef struct {
    char nome[24];             /* numero da IRQ (1, 132...) ou sigla (LOC) */
    char dispositivo[64];      /* quem gera a interrupcao */
    unsigned long long total;  /* soma de todas as CPUs */
} Linha;

static char *pula_espacos(char *p) {
    while (isspace((unsigned char)*p)) p++;
    return p;
}

static char *pula_palavra(char *p) {
    p = pula_espacos(p);
    while (*p != '\0' && !isspace((unsigned char)*p)) p++;
    return p;
}

static int ler_contadores(Linha *v) {
    FILE *f = fopen(ARQUIVO, "r");
    if (f == NULL) { perror(ARQUIVO); exit(1); }
    char buf[8192];
    int n = 0, ncpu = 0;
    /* 1a linha: CPU0 CPU1 ... -> conta quantas CPUs existem */
    if (fgets(buf, sizeof buf, f) != NULL)
        for (char *t = strtok(buf, " \t\n"); t != NULL; t = strtok(NULL, " \t\n"))
            ncpu++;
    while (n < MAX_LINHAS && fgets(buf, sizeof buf, f) != NULL) {
        char *p = pula_espacos(buf);
        char *dois_pontos = strchr(p, ':');
        if (dois_pontos == NULL) continue;
        *dois_pontos = '\0';
        snprintf(v[n].nome, sizeof v[n].nome, "%.23s", p);
        p = dois_pontos + 1;
        v[n].total = 0;
        for (int c = 0; c < ncpu; c++) {          /* soma as colunas */
            char *fim;
            unsigned long long x = strtoull(p, &fim, 10);
            if (fim == p) break;
            v[n].total += x;
            p = fim;
        }
        p[strcspn(p, "\n")] = '\0';
        /* "IR-IO-APIC 1-edge i8042": pula controlador e tipo de sinal e
           fica com o dispositivo. Linhas com sigla (LOC) ja trazem a descricao. */
        if (isdigit((unsigned char)v[n].nome[0]))
            p = pula_palavra(pula_palavra(p));
        snprintf(v[n].dispositivo, sizeof v[n].dispositivo, "%.30s", pula_espacos(p));
        n++;
    }
    fclose(f);
    return n;
}

int main(int argc, char **argv) {
    int segundos = argc > 1 ? atoi(argv[1]) : 10;
    if (segundos < 1 || segundos > 60) {
        fprintf(stderr, "uso: %s [segundos de 1 a 60]\n", argv[0]);
        return 1;
    }
    static Linha antes[MAX_LINHAS], depois[MAX_LINHAS];
    unsigned long long cresceu[MAX_LINHAS] = {0}, soma = 0;

    int na = ler_contadores(antes);
    printf("Contando interrupcoes por %d s...\n", segundos);
    fflush(stdout);
    sleep((unsigned)segundos);
    int nd = ler_contadores(depois);

    for (int i = 0; i < nd; i++)
        for (int j = 0; j < na; j++)
            if (strcmp(antes[j].nome, depois[i].nome) == 0) {
                if (depois[i].total > antes[j].total)
                    cresceu[i] = depois[i].total - antes[j].total;
                soma += cresceu[i];
                break;
            }

    printf("\n%-6s %-30s %12s %10s\n", "linha", "dispositivo/evento", "no periodo", "por seg");
    for (int k = 0; k < 8; k++) {                 /* as 8 que mais cresceram */
        int m = -1;
        for (int i = 0; i < nd; i++)
            if (cresceu[i] > 0 && (m < 0 || cresceu[i] > cresceu[m])) m = i;
        if (m < 0) break;
        printf("%-6s %-30s %12llu %10.1f\n", depois[m].nome, depois[m].dispositivo,
               cresceu[m], (double)cresceu[m] / segundos);
        cresceu[m] = 0;
    }
    printf("\nTotal em %d s: %llu interrupcoes (%.0f por segundo)\n",
           segundos, soma, (double)soma / segundos);
    return 0;
}
