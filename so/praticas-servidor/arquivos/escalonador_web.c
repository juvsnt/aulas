#include <stdio.h>
#include <string.h>

int main(int argc, char **argv) {
    const char *politica = (argc > 1) ? argv[1] : "fcfs";

    // 3 Requisicoes chegam no instante t=0:
    // Req 1: Download de video longo (burst = 5s)
    // Req 2: Download de imagem media (burst = 3s)
    // Req 3: Clique leve de texto     (burst = 1s)

    printf("=== ESCALONAMENTO DE REQUISICOES NO SERVIDOR (%s) ===\n", politica);

    if (strcmp(politica, "fcfs") == 0) {
        // FCFS: Atende na ordem de chegada (Req1 -> Req2 -> Req3)
        puts("Ordem: 1. Video (5s) -> 2. Imagem (3s) -> 3. Texto (1s)");
        int espera1 = 0;
        int espera2 = 5;
        int espera3 = 5 + 3; // 8s de espera para um clique de 1s!
        double media = (espera1 + espera2 + espera3) / 3.0;

        puts("\nDiagrama de Gantt:");
        puts("[Req1: 0 a 5s] [Req2: 5 a 8s] [Req3: 8 a 9s]");
        printf("Tempo de espera: Req1=%ds | Req2=%ds | Req3=%ds\n", espera1, espera2, espera3);
        printf("Tempo medio de espera: %.2f segundos\n", media);
        puts("Problema do FCFS (Efeito Comboio): O clique rapido esperou 8s pelo video longo!");

    } else if (strcmp(politica, "sjf") == 0) {
        // SJF: Atende o mais curto primeiro (Req3 -> Req2 -> Req1)
        puts("Ordem: 1. Texto (1s) -> 2. Imagem (3s) -> 3. Video (5s)");
        int espera3 = 0;
        int espera2 = 1;
        int espera1 = 1 + 3; // 4s de espera
        double media = (espera3 + espera2 + espera1) / 3.0;

        puts("\nDiagrama de Gantt:");
        puts("[Req3: 0 a 1s] [Req2: 1 a 4s] [Req1: 4 a 9s]");
        printf("Tempo de espera: Req3=%ds | Req2=%ds | Req1=%ds\n", espera3, espera2, espera1);
        printf("Tempo medio de espera: %.2f segundos\n", media);
        puts("Vantagem do SJF: Menor tempo medio de espera possivel!");

    } else if (strcmp(politica, "rr") == 0) {
        // Round Robin com quantum = 2s
        puts("Modo Round Robin (fatias de tempo de 2s):");
        puts("[Req1(2s)] [Req2(2s)] [Req3(1s: Fim)] [Req1(2s)] [Req2(1s: Fim)] [Req1(1s: Fim)]");
        puts("Primeira resposta: Req1=0s | Req2=2s | Req3=4s (nao e imediata).");
    } else {
        puts("Use: ./escalonador_web fcfs | sjf | rr");
    }

    return 0;
}
