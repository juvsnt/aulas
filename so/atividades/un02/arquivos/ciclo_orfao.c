/* ciclo_orfao.c - o pai termina ANTES do filho; o filho fica orfao e e
 * adotado por outro processo (no Linux tradicional, o PID 1; em
 * conteineres e no WSL pode ser outro processo "adotante", chamado
 * subreaper).
 * Uso: ./ciclo_orfao
 * Chamado 1 (I2, t03). */
#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <time.h>
#include <unistd.h>

int main(void) {
    pid_t pid = fork();
    if (pid < 0) { perror("fork"); return 1; }

    if (pid == 0) {                      /* filho */
        printf("filho PID=%d: logo depois do fork, meu PPID e %d\n",
               (int)getpid(), (int)getppid());
        fflush(stdout);

        struct timespec t = {2, 0};
        nanosleep(&t, NULL);              /* o pai termina durante esta pausa */

        printf("filho PID=%d: depois que o pai terminou, meu PPID e %d\n",
               (int)getpid(), (int)getppid());
        return 0;
    }

    /* pai: termina rapido, bem antes do filho acordar da pausa. */
    printf("pai PID=%d: vou terminar sem esperar o filho %d\n", (int)getpid(), (int)pid);
    fflush(stdout);
    struct timespec meia = {0, 500 * 1000 * 1000};
    nanosleep(&meia, NULL);
    printf("pai PID=%d: terminando agora.\n", (int)getpid());
    return 0;
}
