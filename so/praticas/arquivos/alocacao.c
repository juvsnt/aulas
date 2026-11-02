#include <stdio.h>
#include <stdlib.h>
/* Disco ficticio de 12 blocos de 16 bytes; arquivo de tres blocos. */
int main(int argc,char **argv) {
    char *fim;
    long byte=argc>1?strtol(argv[1],&fim,10):25;
    if (argc>2 || (argc>1 && (fim==argv[1] || *fim)) || byte<0 || byte>47) {
        fputs("Use byte logico de 0 a 47.\n",stderr); return 1;
    }
    int bloco=(int)byte/16, offset=(int)byte%16;
    const int cadeia[]={2,7,4}, indice[]={2,7,4};
    int livres[12]; for (int i=0;i<12;i++) livres[i]=1;
    for (int i=0;i<3;i++) livres[indice[i]]=0;
    printf("byte=%ld bloco_logico=%d offset=%d\n",byte,bloco,offset);
    printf("Contigua: bloco_fisico=%d (inicio 2 + bloco logico)\n",2+bloco);
    printf("Encadeada: bloco_fisico=%d visitas_na_cadeia=%d\n",cadeia[bloco],bloco+1);
    printf("Indexada: bloco_fisico=%d entrada_do_indice=%d\n",indice[bloco],bloco);
    printf("Bitmap da organizacao indexada (1=livre): ");
    for (int i=0;i<12;i++) printf("%d",livres[i]);
    puts("\nModelo: nao le blocos fisicos, inodes ou journal reais.");
    return 0;
}
