#include <stdio.h>
#include <stdlib.h>

int main(int argc, char **argv) {
    int quadros = 6;
    int bolhas = (argc > 1) ? atoi(argv[1]) : 0;
    if (bolhas < 0 || bolhas > 3) bolhas = 0;

    int estagios = 4; // E=Entrada, F=Fisica, C=Colisao, R=Renderizacao
    int ciclos_total = quadros + (estagios - 1) + bolhas;

    printf("=== PIPELINE GRAFICO DO MOTOR DE JOGO (%d QUADROS) ===\n", quadros);
    printf("Estagios: E=Entrada | F=Fisica | C=Colisao | R=Renderizacao\n");
    if (bolhas > 0) {
        printf("Simulando %d ciclo(s) de bolha/engasgo (stall) a partir do Quadro 3!\n", bolhas);
    }
    printf("\n");

    const char nomes_estagios[] = "EFCR";

    for (int q = 0; q < quadros; q++) {
        int atraso = (q >= 2) ? bolhas : 0;
        int inicio = q + atraso;

        printf("Quadro %d: ", q + 1);
        for (int t = 0; t < ciclos_total; t++) {
            int estagio_idx = t - inicio;
            if (estagio_idx >= 0 && estagio_idx < estagios) {
                printf("%c ", nomes_estagios[estagio_idx]);
            } else {
                printf(". ");
            }
        }
        printf("\n");
    }

    printf("\n=== METRICAS DE DESEMPENHO E 60 FPS ===\n");
    int sem_pipeline = quadros * estagios;
    printf("Tempo sequencial (sem pipeline): %d ciclos\n", sem_pipeline);
    printf("Tempo com pipeline:              %d ciclos\n", ciclos_total);
    printf("Aceleracao (Speedup):            %.2fx mais rapido\n", (double)sem_pipeline / ciclos_total);
    if (bolhas > 0) {
        puts("Aviso: As bolhas causaram perda de ciclos e queda momentanea de FPS (stuttering).");
    } else {
        puts("Pipeline ideal: 60 FPS cravados e transicoes perfeitas!");
    }

    return 0;
}
