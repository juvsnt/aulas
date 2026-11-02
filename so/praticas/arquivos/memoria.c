#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/resource.h>
static int mapa(void) {
    char linha[512];
    FILE *f=fopen("/proc/self/maps","r");
    if (!f) { perror("maps"); return 0; }
    int n=0;
    while (fgets(linha,sizeof linha,f)) {
        if (n++ < 4 || strstr(linha,"[heap]") || strstr(linha,"[stack]")) fputs(linha,stdout);
    }
    return fclose(f)==0;
}
static long faltas(void) {
    struct rusage r;
    if (getrusage(RUSAGE_SELF,&r)) return -1;
    return r.ru_minflt;
}
int main(void) {
    long pagina=sysconf(_SC_PAGESIZE);
    if (pagina<=0 || pagina>65536) return 1;
    size_t tamanho=1024*1024; /* 1 MiB; nao aumentar para provocar swap. */
    volatile unsigned char *dados=malloc(tamanho);
    if (!dados) { perror("malloc"); return 1; }
    printf("PID=%ld pagina=%ld bytes alocados=%zu\n",(long)getpid(),pagina,tamanho);
    printf("Endereco virtual do buffer=%p\n",(void *)dados);
    long antes=faltas();
    for (size_t i=0;i<tamanho;i+=(size_t)pagina) dados[i]=24;
    long depois=faltas();
    printf("Faltas menores antes=%ld depois=%ld\n",antes,depois);
    int ok=mapa();
    free((void *)dados);
    puts("Buffer liberado; mapas e contadores sao observacoes reais, nao enderecos fisicos.");
    return ok?0:1;
}
