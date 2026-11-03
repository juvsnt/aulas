#include <stdio.h>
#include <string.h>

int main(int argc, char **argv) {
    int revalidar = argc == 2 && strcmp(argv[1], "revalidar") == 0;
    if (argc > 2 || (argc == 2 && !revalidar)) {
        fputs("Uso: ./cache [revalidar]\n", stderr); return 2;
    }
    int servidor = 84, versao = 1, copia = servidor, versao_copia = versao;
    printf("A abre relatorio: cache=%d versao=%d\n", copia, versao_copia);
    servidor += 12; ++versao;
    printf("B escreve no servidor: valor=%d versao=%d\n", servidor, versao);
    if (revalidar && versao_copia != versao) {
        copia = servidor; versao_copia = versao;
        puts("A consulta versao e recarrega cache.");
    }
    printf("A le: valor=%d versao=%d Atual=%s\n", copia, versao_copia,
           versao_copia == versao ? "SIM" : "NAO");
    return 0;
}
