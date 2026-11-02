#include <stdio.h>
#include <string.h>

int main(void) {
    // Memoria principal (RAM): posicao 0 contem a Vida do Heroi
    int memoria[] = {50};
    int pc = 0;           // Program Counter (Aponta para a instrucao atual)
    int r0 = 0;           // Registrador de uso geral da CPU
    int zf = 0;           // Flag Zero (1 se a ultima operacao na ULA resultou em 0)

    // Programa de instrucoes da CPU para a rotina de combate:
    const char *instrucoes[] = {"LOAD", "SUB", "STORE", "JZ", "HALT"};
    int operandos[]          = { 0,     50,    0,       4,    0    };

    printf("=== CPU DO CONSOLE: CICLO DE INSTRUCAO DE COMBATE ===\n");
    printf("Vida inicial guardada na RAM[0] = %d HP\n\n", memoria[0]);

    while (1) {
        int ciclo_pc = pc;
        const char *ir = instrucoes[pc]; // 1. BUSCA: IR recebe instrucao
        int op = operandos[pc];
        pc++;                           // 2. INCREMENTO DO PC

        // 3. DECODIFICACAO E EXECUCAO (ULA e Registradores)
        if (strcmp(ir, "LOAD") == 0) {
            r0 = memoria[op];           // Carrega da RAM para o registrador R0
        } else if (strcmp(ir, "SUB") == 0) {
            r0 -= op;                   // ULA realiza a subtracao do dano
            zf = (r0 <= 0);             // Se a vida zerou, ativa Flag Zero
        } else if (strcmp(ir, "STORE") == 0) {
            memoria[op] = r0;           // Grava o novo valor de volta na RAM
        } else if (strcmp(ir, "JZ") == 0) {
            if (zf) {                   // Se flag Zero ativa, desvia o PC
                printf("  [DESVIO CONDICIONAL] Vida zerou! Desviando PC para Game Over.\n");
                pc = op;
            }
        } else if (strcmp(ir, "HALT") == 0) {
            printf("PC=%d | IR=%-5s    | Fim da execucao da CPU.\n", ciclo_pc, ir);
            break;
        }

        printf("PC=%d | IR=%-5s %2d | R0=%2d | Flag ZF=%d | RAM[0]=%d HP\n",
               ciclo_pc, ir, op, r0, zf, memoria[0]);
    }

    printf("\nResultado Final: RAM[0] = %d (Heroi derrotado)\n", memoria[0]);
    return 0;
}
