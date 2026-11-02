#include <stdio.h>
#include <string.h>
/* Modelo: chegadas 0, CPU unica, sem custo de troca, quantum 2. */
int main(int argc, char **argv) {
    const char *politica = argc > 1 ? argv[1] : "fcfs";
    int rr = !strcmp(politica, "rr"), sjf = !strcmp(politica, "sjf");
    if (argc > 2 || (!rr && !sjf && strcmp(politica, "fcfs"))) {
        fputs("Use fcfs, sjf ou rr.\n", stderr); return 1;
    }
    const int burst[] = {5,3,1};
    int restante[] = {5,3,1}, fim[3] = {0}, primeira[] = {-1,-1,-1};
    int ordem[] = {0,1,2}, tempo = 0, completos = 0;
    if (sjf) { ordem[0]=2; ordem[1]=1; ordem[2]=0; }
    while (completos < 3) {
        for (int j=0; j<3; j++) {
            int p = ordem[j];
            if (!restante[p]) continue;
            int fatia = rr && restante[p] > 2 ? 2 : restante[p];
            if (primeira[p] < 0) primeira[p] = tempo;
            printf("[%d,%d) P%d\n", tempo, tempo+fatia, p+1);
            tempo += fatia; restante[p] -= fatia;
            if (!restante[p]) { fim[p]=tempo; completos++; }
        }
    }
    double espera=0, retorno=0, resposta=0;
    for (int p=0; p<3; p++) {
        int w = fim[p]-burst[p]; /* Chegadas 0; sem E/S no modelo. */
        printf("P%d espera=%d retorno=%d resposta=%d\n", p+1,w,fim[p],primeira[p]);
        espera+=w; retorno+=fim[p]; resposta+=primeira[p];
    }
    printf("Medias: espera=%.2f retorno=%.2f resposta=%.2f\n",espera/3,retorno/3,resposta/3);
    return 0;
}
