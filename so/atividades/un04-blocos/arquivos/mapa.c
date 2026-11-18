#include <stdio.h>

int main(void) {
    char mapa[] = "0001100011110000";
    int total = 16;

    printf("blocos: 0123456789012345\n");
    printf("antes:  %s\n", mapa);

    int livre = -1;
    for (int i = 0; i < total; i++) {
        if (mapa[i] == '1') {
            livre = i;
            break;
        }
    }

    if (livre == -1) {
        printf("disco cheio: nenhum bloco livre\n");
        return 1;
    }

    mapa[livre] = '0';
    printf("o primeiro bloco livre era o %d; agora esta ocupado\n", livre);
    printf("depois: %s\n", mapa);
    return 0;
}
// fim do codigo
