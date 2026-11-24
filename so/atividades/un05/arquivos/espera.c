#include <stdio.h>
#include <string.h>
#include <time.h>

double agora(void) {
    struct timespec t;
    clock_gettime(CLOCK_MONOTONIC, &t);
    return t.tv_sec + t.tv_nsec / 1e9;
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("use: ./espera polling  ou  ./espera interrupcao\n");
        return 1;
    }
    double pronto = agora() + 2.0;

    if (strcmp(argv[1], "polling") == 0) {
        long perguntas = 0;
        while (agora() < pronto) {
            perguntas++;
        }
        printf("polling: perguntei %ld vezes se estava pronto\n", perguntas);
    } else {
        struct timespec dois = {2, 0};
        nanosleep(&dois, NULL);
        printf("interrupcao: dormi 2 s e o kernel me acordou\n");
    }
    return 0;
}
// fim do codigo
