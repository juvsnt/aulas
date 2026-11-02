#include <stdio.h>
#include <stdlib.h>
/* Modelo didatico: paginas de 16 bytes, 4 paginas virtuais e 8 frames. */
int main(int argc,char **argv) {
    char *fim;
    long virtual=argc>1?strtol(argv[1],&fim,10):30;
    if (argc>2 || (argc>1 && (fim==argv[1] || *fim)) || virtual<0 || virtual>63) {
        fputs("Use endereco virtual de 0 a 63.\n",stderr); return 1;
    }
    const int tabela[]={3,5,-1,2}; /* -1: pagina nao presente. */
    int pagina=(int)virtual/16, offset=(int)virtual%16;
    printf("virtual=%ld pagina=%d offset=%d\n",virtual,pagina,offset);
    if (tabela[pagina]<0) puts("Pagina ausente: page fault no modelo; nao ha endereco fisico calculavel agora.");
    else printf("frame=%d fisico=%d\n",tabela[pagina],tabela[pagina]*16+offset);
    puts("Tabela fornecida, nao e a tabela real do processo Linux.");
    return 0;
}
