#include <stdio.h>

int main(void) {
    // Dados da partida salvos pelo jogo:
    unsigned char save_original[4] = {
        3,   // Byte 0: Vidas restantes
        2,   // Byte 1: Numero da fase
        50,  // Byte 2: Pontos ganhos
        99   // Byte 3: Segundos restantes
    };

    printf("=== SALVANDO DADOS DO JOGO NO ARMAZENAMENTO ===\n");

    // Metodo 1: Gravacao de 1 byte por vez (multiplos acessos lentos ao barramento)
    FILE *f1 = fopen("save_byte.dat", "wb");
    if (!f1) { perror("save_byte.dat"); return 1; }
    for (int i = 0; i < 4; i++) {
        fwrite(&save_original[i], 1, 1, f1); // 4 chamadas de E/S
    }
    fclose(f1);

    // Metodo 2: Gravacao em lote com buffer/DMA (1 unico acesso em bloco)
    FILE *f2 = fopen("save_bloco.dat", "wb");
    if (!f2) { perror("save_bloco.dat"); return 1; }
    fwrite(save_original, 1, 4, f2); // 1 chamada de E/S
    fclose(f2);

    puts("Arquivo 'save_byte.dat' gerado com 4 transferencias de 1 byte.");
    puts("Arquivo 'save_bloco.dat' gerado com 1 transferencia em bloco de 4 bytes.");

    // Modelo comparativo de entrada do controle:
    puts("\n=== MODELO DE LEITURA DO JOYSTICK / CONTROLE ===");
    puts("1. POLLING: A CPU pergunta em loop 'Apertou botao?' -> Desperdiça tempo da CPU.");
    puts("2. INTERRUPCAO: O controle avisa a CPU somente quando o botao eh pressionado -> CPU fica livre.");

    return 0;
}
