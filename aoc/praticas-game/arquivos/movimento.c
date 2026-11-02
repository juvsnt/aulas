#include <stdio.h>

// Funcao que atualiza a coordenada X do personagem e trata colisao com a borda
int mover(int pos_x, int velocidade, int limite_tela) {
    int novo_x = pos_x + velocidade;
    if (novo_x > limite_tela) {
        novo_x = limite_tela; // Nao deixa o heroi atravessar a parede
    }
    return novo_x;
}

int main(void) {
    int pos_x = 75;
    int velocidade = 10;
    int borda = 80;

    int final_x = mover(pos_x, velocidade, borda);

    printf("=== MOVIMENTACAO E COLISAO NA TELA ===\n");
    printf("Posicao inicial: %d | Velocidade: +%d | Limite da borda: %d\n",
           pos_x, velocidade, borda);
    printf("Posicao final:   %d (colidiu com o limite)\n", final_x);

    return 0;
}
