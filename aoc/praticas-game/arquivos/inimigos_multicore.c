#include <stdio.h>
#include <time.h>

#define TOTAL_INIMIGOS 1000

// Funcao que calcula fisica e movimento de um intervalo de inimigos
long calcular_inimigos(int inicio, int fim) {
    long soma = 0;
    // Laco pesado para simular processamento intensivo de fisica:
    for (int rep = 0; rep < 20000; rep++) {
        for (int i = inicio; i < fim; i++) {
            soma += (i * 3 + 7) % 100;
        }
    }
    return soma;
}

int main(void) {
    printf("=== ATUALIZANDO HORDA DE %d INIMIGOS NO JOGO ===\n", TOTAL_INIMIGOS);

    // 1. Execucao sequencial (1 unico nucleo da CPU processa tudo)
    clock_t t0 = clock();
    long res_total = calcular_inimigos(0, TOTAL_INIMIGOS);
    clock_t t1 = clock();
    double tempo_1_core = (double)(t1 - t0) / CLOCKS_PER_SEC;

    printf("1 Nucleo:       Tempo = %.4f s (Resultado = %ld)\n", tempo_1_core, res_total);

    // 2. Divisao do lote para 2 Nucleos (particionamento de dados)
    // Nucleo A calcula 0 a 499; Nucleo B calcula 500 a 999
    clock_t t2 = clock();
    long loteA = calcular_inimigos(0, 500);
    long loteB = calcular_inimigos(500, 1000);
    long res_divisao = loteA + loteB;
    clock_t t3 = clock();
    double tempo_2_lotes = (double)(t3 - t2) / CLOCKS_PER_SEC;

    printf("2 Lotes de 500: Lote A = %ld | Lote B = %ld (Total = %ld)\n", loteA, loteB, res_divisao);
    printf("Tempo total medido sequencialmente: %.4f s\n", tempo_2_lotes);

    // 3. Analise teorica da Lei de Amdahl no jogo
    double p = 0.80; // 80% do tempo eh calculo de inimigos (paralelizavel)
    printf("\n=== LEI DE AMDAHL: LIMITES DE ACELERACAO DO JOGO ===\n");
    printf("Cenario: 80%% do jogo eh fisica paralelizavel e 20%% eh desenho sequencial de tela:\n");

    int cores[] = {1, 2, 4, 8, 16};
    for (int c = 0; c < 5; c++) {
        int n = cores[c];
        double aceleracao = 1.0 / ((1.0 - p) + (p / n));
        printf("Com %2d nucleos: Aceleracao maxima teorica = %.2fx\n", n, aceleracao);
    }

    double limite = 1.0 / (1.0 - p);
    printf("Com infinitos nucleos: Aceleracao maxima nunca ultrapassa %.1fx!\n", limite);

    return 0;
}
