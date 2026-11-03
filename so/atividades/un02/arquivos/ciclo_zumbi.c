/* ciclo_zumbi.c - o filho termina, mas o pai demora a chamar wait().
 * Enquanto o pai nao chama wait, o SO guarda o filho como um ZUMBI
 * (estado Z): ele ja terminou, mas sua entrada na tabela de processos
 * ainda existe, porque alguem (o pai) pode querer ler o codigo de saida.
 * Uso: ./ciclo_zumbi [segundos]   (padrao 5, maximo 30)
 * Chamado 1 (I2, t03). */
#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <unistd.h>
#include <sys/wait.h>

int main(int argc, char *argv[]) {
    int segundos = argc > 1 ? atoi(argv[1]) : 5;
    if (segundos < 1 || segundos > 30) { fputs("Use entre 1 e 30 segundos.\n", stderr); return 1; }

    pid_t pid = fork();
    if (pid < 0) { perror("fork"); return 1; }

    if (pid == 0) _exit(7);              /* filho: termina imediatamente, codigo 7 */

    /* pai: sabe o PID do filho e so chama wait depois de "segundos". */
    printf("pai PID=%d criou o filho %d, que ja terminou.\n", (int)getpid(), (int)pid);
    printf("pai: vou esperar %d s ANTES de chamar wait (observe o filho enquanto isso).\n",
           segundos);
    fflush(stdout);

    struct timespec t = {segundos, 0};
    nanosleep(&t, NULL);                 /* durante esta pausa, o filho fica ZUMBI */

    int status;
    if (waitpid(pid, &status, 0) < 0) { perror("wait"); return 1; }
    if (WIFEXITED(status))
        printf("pai: wait recolheu o filho %d, codigo de saida %d\n",
               (int)pid, WEXITSTATUS(status));
    return 0;
}
