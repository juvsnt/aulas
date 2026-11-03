#include <stdio.h>
#include <string.h>

int main(int argc, char **argv) {
    int soma = argc == 2 && strcmp(argv[1], "soma") == 0;
    if (argc > 2 || (argc == 2 && !soma)) {
        fputs("Uso: ./replicas [soma]\n", stderr); return 2;
    }
    int a = 84, b = 84;
    puts("Inicio: A=84 B=84; cada cliente le sua replica.");
    a += 12; b += 18;
    printf("Apos escritas isoladas: A=%d B=%d\n", a, b);
    if (soma) {
        /* Componentes por produtor; merge por maximo, nao soma de totais. */
        int va[] = {12, 0}, vb[] = {0, 18};
        for (int i = 0; i < 2; ++i) {
            int maior = va[i] > vb[i] ? va[i] : vb[i];
            va[i] = maior; vb[i] = maior;
        }
        a = 84 + va[0] + va[1]; b = 84 + vb[0] + vb[1];
        puts("Merge por componente de incremento; mesmo merge repetido.");
        for (int i = 0; i < 2; ++i) if (vb[i] > va[i]) va[i] = vb[i];
        a = 84 + va[0] + va[1];
    } else {
        /* Regra declarada: escrita B vence o empate de versao. */
        a = b;
        puts("Conflito: B vence por id; incremento de A nao foi preservado.");
    }
    printf("Reconciliadas: A=%d B=%d Esperado_sem_perdas=114\n", a, b);
    puts("Convergir nao implica preservar a intencao de todas as escritas.");
    return 0;
}
