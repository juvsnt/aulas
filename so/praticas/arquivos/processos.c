#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>
#include <errno.h>
int main(int argc, char **argv) {
    if (argc == 2 && !strcmp(argv[1], "filho")) {
        printf("Apos exec: PID=%ld PPID=%ld\n", (long)getpid(), (long)getppid());
        return 7;
    }
    int leitura = 12;
    printf("Pai antes: PID=%ld leitura=%d\n", (long)getpid(), leitura);
    fflush(stdout); /* Nao duplicar dados pendentes do stdio no fork. */
    pid_t filho = fork();
    if (filho < 0) { perror("fork"); return 1; }
    if (filho == 0) {
        leitura = 30;
        printf("Filho antes de exec: PID=%ld PPID=%ld leitura=%d\n",
               (long)getpid(), (long)getppid(), leitura);
        fflush(stdout);
        execl("./processos", "processos", "filho", (char *)NULL);
        perror("execl"); _exit(1);
    }
    int status;
    while (waitpid(filho, &status, 0) < 0) {
        if (errno != EINTR) { perror("waitpid"); return 1; }
    }
    if (!WIFEXITED(status)) { fputs("Filho nao terminou normalmente.\n", stderr); return 1; }
    printf("Pai depois: leitura=%d codigo_filho=%d\n", leitura, WEXITSTATUS(status));
    return WEXITSTATUS(status) == 7 ? 0 : 1;
}
