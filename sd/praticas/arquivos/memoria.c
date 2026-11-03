#include <stdio.h>
#include <string.h>

int main(int argc, char **argv) {
    int exclusiva = argc == 2 && strcmp(argv[1], "exclusiva") == 0;
    if (argc > 2 || (argc == 2 && !exclusiva)) {
        fputs("Uso: ./memoria [exclusiva]\n", stderr); return 2;
    }
    int dono = 84, a = dono, b = dono, b_valida = 1;
    puts("A e B recebem copia da pagina com total=84.");
    a += 12; dono = a;
    if (exclusiva) { b_valida = 0; puts("A obtem exclusividade; copia de B invalidada."); }
    if (!b_valida) { b = dono; b_valida = 1; puts("B busca pagina atual antes de escrever."); }
    b += 18; dono = b;
    printf("B escreve; valor no dono=%d Esperado_sem_perdas=114\n", dono);
    if (exclusiva) puts("Copia de A passa a invalida; ler exige nova consulta.");
    else puts("Ultima copia sobrescreve total: incremento de A perdido.");
    puts("Modelo sequencial de pagina; nao usa memoria remota nem mmap compartilhado.");
    return 0;
}
