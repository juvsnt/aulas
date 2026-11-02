#include <stdio.h>
int calibrar(int leitura) {
    int ajuste = 2;
    int corrigida = leitura + ajuste;
    if (corrigida >= 24) return 1;
    return 0;
}
int main(void) {
    int leituras[] = {12, 18, 24, 30};
    int total = 0, alertas = 0;
    for (int i = 0; i < 4; i++) {
        total += leituras[i];
        alertas += calibrar(leituras[i]);
    }
    printf("Total bruto=%d Alertas calibrados=%d\n", total, alertas);
    return 0;
}
