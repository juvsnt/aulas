/* ciclo_exec.c - fork() cria uma copia do processo; exec() troca o
 * programa que essa copia executa, mas MANTEM o mesmo PID.
 * Uso: ./ciclo_exec
 * Chamado 1 (I2, t03). */
#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main(void) {
    printf("pai PID=%d: chamando fork()\n", (int)getpid());
    fflush(stdout);

    pid_t pid = fork();                  /* cria uma copia deste processo */
    if (pid < 0) { perror("fork"); return 1; }

    if (pid == 0) {                      /* pid == 0: este trecho roda na COPIA (filho) */
        printf("filho PID=%d PPID=%d: fork() me devolveu 0; vou chamar exec(ps)\n",
               (int)getpid(), (int)getppid());
        fflush(stdout);

        char meu_pid[16];
        snprintf(meu_pid, sizeof meu_pid, "%d", (int)getpid());
        /* execlp troca o PROGRAMA do filho por "ps", mantendo o mesmo PID. */
        execlp("ps", "ps", "-o", "pid,ppid,stat,comm", "-p", meu_pid, (char *)NULL);
        perror("exec");                  /* so chega aqui se o exec falhar */
        return 127;
    }

    /* pid > 0: este trecho roda so no PAI; pid guarda o PID do filho. */
    printf("pai: fork() me devolveu %d (o PID do filho); aguardando com wait\n", (int)pid);
    fflush(stdout);

    int status;
    if (waitpid(pid, &status, 0) < 0) { perror("wait"); return 1; }
    if (WIFEXITED(status))
        printf("pai: wait recolheu o filho %d, codigo de saida %d\n",
               (int)pid, WEXITSTATUS(status));
    return 0;
}
