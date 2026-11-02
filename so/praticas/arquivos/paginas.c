#include <stdio.h>
#include <string.h>
/* Mesmo fluxo, tres frames, todos vazios: FIFO, LRU e OPT. */
int main(int argc,char **argv) {
    const char *modo=argc>1?argv[1]:"fifo";
    int fifo=!strcmp(modo,"fifo"), lru=!strcmp(modo,"lru"), opt=!strcmp(modo,"opt");
    if (argc>2 || (!fifo && !lru && !opt)) { fputs("Use fifo, lru ou opt.\n",stderr); return 1; }
    const int refs[]={1,2,3,1,4,2,5,1,2,3,4,5};
    int frames[]={-1,-1,-1}, ultimo[]={-1,-1,-1}, proximo=0, faltas=0;
    for (int t=0;t<12;t++) {
        int pos=-1;
        for (int j=0;j<3;j++) if (frames[j]==refs[t]) pos=j;
        int hit=pos>=0;
        if (!hit) {
            faltas++;
            for (int j=0;j<3;j++) if (frames[j]<0) { pos=j; break; }
            if (pos<0) {
                if (fifo) pos=proximo;
                if (lru) { pos=0; for (int j=1;j<3;j++) if (ultimo[j]<ultimo[pos]) pos=j; }
                if (opt) {
                    int longe=-1;
                    for (int j=0;j<3;j++) {
                        int k=t+1; while (k<12 && refs[k]!=frames[j]) k++;
                        if (k>longe) { longe=k; pos=j; }
                    }
                }
            }
            frames[pos]=refs[t];
            if (fifo) proximo=(pos+1)%3;
        }
        ultimo[pos]=t;
        printf("ref=%d %s frames=[%d,%d,%d]\n",refs[t],hit?"HIT":"FAULT",frames[0],frames[1],frames[2]);
    }
    printf("Faltas=%d Hits=%d\n",faltas,12-faltas);
    return 0;
}
