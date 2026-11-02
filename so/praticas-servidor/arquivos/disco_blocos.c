#include <stdio.h>
#include <stdlib.h>

#define TAMANHO_BLOCO 4096 // 4 KB por bloco no sistema de arquivos ext4

int main(int argc, char **argv) {
    long tamanho_arquivo = (argc > 1) ? atol(argv[1]) : 10000; // Ex: pagina index.html de 10 KB

    if (tamanho_arquivo < 0 || tamanho_arquivo > 1000000000L) {
        fputs("Use um tamanho entre 0 e 1000000000 bytes.\n", stderr); return 1;
    }
    printf("=== MODELO DE ALOCACAO: BLOCOS DE 4096 BYTES ===\n");
    printf("Tamanho do arquivo index.html: %ld bytes\n", tamanho_arquivo);
    printf("Tamanho do bloco de disco:     %d bytes (4 KB)\n\n", TAMANHO_BLOCO);

    // Calculo da quantidade de blocos necessarios:
    long blocos_necessarios = (tamanho_arquivo + TAMANHO_BLOCO - 1) / TAMANHO_BLOCO;
    long espaco_alocado_disco = blocos_necessarios * TAMANHO_BLOCO;
    long fragmentacao_interna = espaco_alocado_disco - tamanho_arquivo;

    printf("1. Blocos de disco alocados:   %ld bloco(s)\n", blocos_necessarios);
    printf("2. Espaco alocado no modelo:   %ld bytes\n", espaco_alocado_disco);
    printf("3. Fragmentacao Interna:       %ld bytes (desperdicados no ultimo bloco)\n\n",
           fragmentacao_interna);

    // Consulta de um byte especifico (ex: byte 5000)
    long byte_busca = 5000;
    long bloco_logico = byte_busca / TAMANHO_BLOCO;
    long deslocamento_bloco = byte_busca % TAMANHO_BLOCO;

    if (byte_busca >= tamanho_arquivo) {
        puts("Byte 5000 fora do arquivo: nenhum mapeamento solicitado."); return 0;
    }
    printf("Localizando o byte %ld dentro do arquivo:\n", byte_busca);
    printf("-> Bloco Logico do Inode: %ld\n", bloco_logico);
    printf("-> Deslocamento no bloco: %ld bytes\n", deslocamento_bloco);

    return 0;
}
