#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/file.h>

int main(int argc, char *argv[]) {
    if (argc < 2) { printf("Uso: ./compra NOME [trava]\n"); return 1; }
    char *nome = argv[1];
    int trava = argc > 2 && strcmp(argv[2], "trava") == 0;
    int arq = open("estoque.txt", O_RDWR);
    if (arq < 0) { printf("Crie antes: echo 1 > estoque.txt\n"); return 1; }
    if (trava) {
        printf("[%s] pedi a trava\n", nome);
        flock(arq, LOCK_EX);               /* LOCK: espera a vez */
        printf("[%s] consegui a trava\n", nome);
    }
    char texto[16] = "";
    read(arq, texto, sizeof texto - 1);    /* 1. LER */
    int estoque = atoi(texto);
    printf("[%s] li estoque = %d\n", nome, estoque);
    usleep(500000);                        /* pausa de 0,5 s, de proposito */
    if (estoque > 0) {
        estoque = estoque - 1;             /* 2. CALCULAR */
        ftruncate(arq, 0);
        lseek(arq, 0, SEEK_SET);
        dprintf(arq, "%d\n", estoque);     /* 3. ESCREVER */
        printf("[%s] COMPREI! gravei estoque = %d\n", nome, estoque);
    } else {
        printf("[%s] compra negada: estoque esgotado\n", nome);
    }
    close(arq);                            /* UNLOCK: fechar solta a trava */
    return 0;
}
// fim do codigo
