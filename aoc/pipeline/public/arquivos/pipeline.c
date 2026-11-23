/* pipeline.c - SIMULACAO de um pipeline didatico de 5 estagios.
   Desenha o diagrama temporal (qual instrucao esta em qual estagio a cada
   ciclo) e calcula tempos. Nao mede o processador: so aplica as regras.
   Uso: ./pipeline 5            5 instrucoes sem dependencia
        ./pipeline 1000000      um milhao de instrucoes (so os totais)
        ./pipeline dependencia  ADD, SUB e OR do slide 9, sem adiantamento
        ./pipeline adiantamento as mesmas, com adiantamento (forwarding) */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define K 5        /* estagios: IF ID EX MEM WB */
#define T_NS 2.0   /* duracao do ciclo de relogio, em nanossegundos */

/* Cada instrucao: texto, registrador escrito e dois registradores lidos. */
struct instr { const char *texto, *escreve, *le1, *le2; };

static const struct instr exemplo[] = {
    {"ADD $s0,$t0,$t1", "$s0", "$t0", "$t1"},
    {"SUB $t2,$s0,$t3", "$t2", "$s0", "$t3"},   /* le $s0: depende do ADD */
    {"OR  $t4,$t5,$t6", "$t4", "$t5", "$t6"},   /* nao depende de ninguem */
};

static void totais(long m, long ciclos, long bolhas) {
    double com = (double)ciclos * T_NS, sem = (double)K * (double)m * T_NS;
    printf("Instrucoes (M):               %ld\n", m);
    printf("Ciclos com pipeline:          %ld\n", ciclos);
    printf("Bolhas (ciclos perdidos):     %ld\n", bolhas);
    printf("Tempo com pipeline:           %.0f ns\n", com);
    printf("Tempo sem pipeline (K*M*t):   %.0f ns\n", sem);
    printf("Latencia sem bolhas (K*t):    %.0f ns por instrucao\n", K * T_NS);
    printf("Ganho (speedup) sem/com:      %.2f vezes\n", sem / com);
    printf("CPI (ciclos por instrucao):   %.2f\n", (double)ciclos / (double)m);
}

static void diagrama(int n, const char **nome, const int *busca, const int *decod) {
    static const char *est[] = {"ID", "EX", "MEM", "WB"};
    int fim = decod[n - 1] + 3;
    printf("%-17s", "ciclo:");
    for (int c = 1; c <= fim; c++) printf("%-4d", c);
    printf("\n");
    for (int i = 0; i < n; i++) {
        printf("%-17s", nome[i]);
        for (int c = 1; c <= fim; c++) {
            const char *s = "";
            if (c == busca[i]) s = "IF";
            else if (c > busca[i] && c < decod[i]) s = "--";   /* bolha */
            else if (c >= decod[i] && c <= decod[i] + 3) s = est[c - decod[i]];
            printf("%-4s", s);
        }
        printf("\n");
    }
}

int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "uso: %s <numero> | dependencia | adiantamento\n", argv[0]);
        return 1;
    }
    printf("SIMULACAO: pipeline de %d estagios, ciclo de %.0f ns\n\n", K, T_NS);
    int dep = strcmp(argv[1], "dependencia") == 0;
    int adi = strcmp(argv[1], "adiantamento") == 0;
    if (dep || adi) {
        int n = 3, busca[3], decod[3];
        const char *nome[3];
        for (int i = 0; i < n; i++) {
            nome[i] = exemplo[i].texto;
            busca[i] = i == 0 ? 1 : decod[i - 1];   /* busca quando a anterior decodifica */
            decod[i] = busca[i] + 1;
            for (int j = 0; j < i && dep; j++)      /* sem adiantamento: espera o WB */
                if (!strcmp(exemplo[j].escreve, exemplo[i].le1) ||
                    !strcmp(exemplo[j].escreve, exemplo[i].le2))
                    if (decod[i] < decod[j] + 3) decod[i] = decod[j] + 3;
        }
        diagrama(n, nome, busca, decod);
        printf("\n-- = bolha (stall): a instrucao espera; um estagio fica sem trabalho util\n\n");
        long ciclos = decod[n - 1] + 3;
        totais(n, ciclos, ciclos - (K + (n - 1)));
        return 0;
    }
    long m = strtol(argv[1], NULL, 10);
    if (m < 1 || m > 1000000000L) {
        fprintf(stderr, "use um numero de 1 a 1000000000\n");
        return 1;
    }
    if (m <= 8) {
        int busca[8], decod[8];
        const char *nome[8];
        static const char *rot[] = {"I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8"};
        for (int i = 0; i < m; i++) { nome[i] = rot[i]; busca[i] = i + 1; decod[i] = i + 2; }
        diagrama((int)m, nome, busca, decod);
        printf("\n");
    }
    totais(m, K + (m - 1), 0);   /* T = [K + (M - 1)] * t */
    return 0;
}
