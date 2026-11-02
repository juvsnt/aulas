#include <stdio.h>

int main(void) {
    // 1. Representacao da vida do personagem em 1 byte (0 a 255)
    unsigned char vida = 250;
    unsigned char pocao_cura = 10;
    
    // Demonstrando o estouro (overflow/wrap-around) tipico de jogos antigos:
    unsigned char vida_apos_cura = vida + pocao_cura;

    printf("=== STATUS DO PERSONAGEM (8 BITS) ===\n");
    printf("Vida inicial: %u\n", vida);
    printf("Tomou pocao de cura de +%u vidas...\n", pocao_cura);
    printf("Vida resultante com overflow de 8 bits: %u (o valor estourou!)\n\n", vida_apos_cura);

    // 2. Inventario e flags de status compactadas em bits:
    // Bit 0 (1): Vivo
    // Bit 1 (2): Espada equipada
    // Bit 2 (4): Escudo equipado
    // Bit 3 (8): Chave do castelo
    unsigned char status = 1 | 2 | 8; // Heroi vivo, com espada e chave (total = 11)

    printf("=== FLAGS DE INVENTARIO EM BITS ===\n");
    printf("Valor da variavel status: decimal=%u | hexadecimal=0x%02X\n", status, status);
    printf("Bit 0 - Heroi vivo?         %s\n", (status & 1) ? "SIM" : "NAO");
    printf("Bit 1 - Possui espada?      %s\n", (status & 2) ? "SIM" : "NAO");
    printf("Bit 2 - Possui escudo?      %s\n", (status & 4) ? "SIM" : "NAO");
    printf("Bit 3 - Tem chave da porta? %s\n", (status & 8) ? "SIM" : "NAO");

    return 0;
}
