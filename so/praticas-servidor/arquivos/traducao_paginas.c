#include <stdio.h>
#include <stdlib.h>

#define TAMANHO_PAGINA 4096 // 4 KB por pagina

int main(int argc, char **argv) {
    long endereco_virtual = (argc > 1) ? atol(argv[1]) : 9000;

    printf("=== TRADUCAO DE MEMORIA VIRTUAL NO SERVIDOR ===\n");
    printf("Endereco virtual solicitado pelo processo: %ld\n", endereco_virtual);

    // Divisao do endereco virtual:
    long numero_pagina = endereco_virtual / TAMANHO_PAGINA;
    long deslocamento  = endereco_virtual % TAMANHO_PAGINA;

    printf("Numero da Pagina Virtual (VPN): %ld\n", numero_pagina);
    printf("Deslocamento na Pagina (Offset): %ld bytes\n\n", deslocamento);

    // Tabela de Paginas didatica do processo do servidor:
    // Pagina 0 -> Frame Fisico 5 (Presente)
    // Pagina 1 -> Frame Fisico 8 (Presente)
    // Pagina 2 -> Frame Fisico 2 (Presente)
    // Pagina 3 -> Ausente (Esta no disco/swap! Causa Page Fault)
    int tabela_frames[] = {5, 8, 2, -1};
    int total_paginas = 4;

    if (endereco_virtual >= 0 && numero_pagina < total_paginas) {
        int frame = tabela_frames[numero_pagina];
        if (frame >= 0) {
            long endereco_fisico = (frame * TAMANHO_PAGINA) + deslocamento;
            printf("Status: PAGINA PRESENTE NA RAM!\n");
            printf("Mapeada para o Frame Fisico: %d\n", frame);
            printf("Endereco fisico no modelo: %ld\n", endereco_fisico);
        } else {
            puts("Status: [PAGE FAULT] Pagina ausente da memoria RAM!");
            puts("Neste modelo, a pagina precisaria ser buscada no disco; nao ocorre falta real.");
        }
    } else {
        puts("Status: [ACESSO INVALIDO NO MODELO] Nenhum sinal real foi gerado!");
    }

    return 0;
}
