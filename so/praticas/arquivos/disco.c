#include <stdio.h>
#include <stdlib.h>
#include <string.h>
/* Cilindros hipoteticos; custo = distancia, sem chegadas durante o servico. */
int main(int argc,char **argv) {
    const char *modo=argc>1?argv[1]:"fcfs";
    int sstf=!strcmp(modo,"sstf");
    if (argc>2 || (!sstf && strcmp(modo,"fcfs"))) return 1;
    int pedidos[]={10,80,20,70}, feito[4]={0}, cabeca=50, total=0;
    for (int i=0;i<4;i++) {
        int p=i;
        if (sstf) {
            p=-1;
            for (int j=0;j<4;j++)
                if (!feito[j] && (p<0 || abs(pedidos[j]-cabeca)<abs(pedidos[p]-cabeca))) p=j;
        }
        int distancia=abs(pedidos[p]-cabeca);
        printf("%d -> %d distancia=%d\n",cabeca,pedidos[p],distancia);
        total+=distancia; cabeca=pedidos[p]; feito[p]=1;
    }
    printf("Deslocamento total=%d cilindros hipoteticos\n",total);
    puts("Nao mede latencia de HDD, SSD ou o escalonador real do Linux.");
    return 0;
}
