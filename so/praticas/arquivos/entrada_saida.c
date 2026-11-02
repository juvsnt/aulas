#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <string.h>
/* Chamadas POSIX em arquivos da propria pasta. Nao usa discos brutos. */
static int transferir(int fd,unsigned char *p,size_t n,int gravar,int *chamadas) {
    while (n) {
        (*chamadas)++;
        ssize_t k=gravar?write(fd,p,n):read(fd,p,n);
        if (k<0 && errno==EINTR) continue;
        if (k<=0) return 0;
        p+=k; n-=(size_t)k;
    }
    return 1;
}
int main(void) {
    unsigned char origem[]={12,18,24,30}, unidades[4], lote[4];
    int fd=open("leituras.bin",O_WRONLY|O_CREAT|O_TRUNC,0600), chamadas=0;
    if (fd<0) { perror("open"); return 1; }
    int ok=transferir(fd,origem,4,1,&chamadas);
    if (close(fd)) ok=0;
    if (!ok) return 1;
    int pequenas=0, grandes=0;
    fd=open("leituras.bin",O_RDONLY); if (fd<0) return 1;
    for (int i=0;i<4;i++) if (!transferir(fd,&unidades[i],1,0,&pequenas)) { close(fd); return 1; }
    if (close(fd)) return 1;
    fd=open("leituras.bin",O_RDONLY); if (fd<0) return 1;
    ok=transferir(fd,lote,4,0,&grandes);
    if (close(fd)) ok=0;
    if (!ok) return 1;
    int total=0; for (int i=0;i<4;i++) total+=lote[i];
    printf("Chamadas read: unitarias=%d lote=%d\n",pequenas,grandes);
    printf("Mesmo conteudo=%s Total=%d\n",memcmp(unidades,lote,4)?"nao":"sim",total);
    puts("Contagens incluem eventuais repeticoes; nao contam acessos fisicos ao disco.");
    return 0;
}
