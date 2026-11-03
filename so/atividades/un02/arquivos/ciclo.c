/* ciclo.c - nascimento, substituicao e fim de processos.
 * Uso: ./ciclo exec | ./ciclo zumbi [segundos] | ./ciclo orfao
 *   exec  : fork + exec; o filho vira "ps" sem trocar de PID.
 *   zumbi : o filho termina e o pai demora a chamar wait (padrao 5 s, max 30).
 *   orfao : o pai termina antes do filho; o filho e adotado.
 * Todos os modos terminam sozinhos. Chamado 1 (I2). */
#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

static void dormir_ms(long ms) {
    struct timespec t = {ms / 1000, (ms % 1000) * 1000000L};
    nanosleep(&t, NULL);
}

/* Mostra uma linha do ps para o PID indicado (ou avisa que nao existe). */
static void mostrar(pid_t pid) {
    char cmd[96];
    snprintf(cmd, sizeof cmd,
             "ps -o pid=,ppid=,stat=,comm= -p %d || echo '   (PID %d nao existe mais)'",
             (int)pid, (int)pid);
    fflush(stdout);
    if (system(cmd) == -1) perror("system");
}

static void relatar(pid_t filho, int status) {
    if (WIFEXITED(status))
        printf("pai: wait recolheu o filho %d, codigo de saida %d\n",
               (int)filho, WEXITSTATUS(status));
    else if (WIFSIGNALED(status))
        printf("pai: wait recolheu o filho %d, encerrado pelo sinal %d\n",
               (int)filho, WTERMSIG(status));
}

static int modo_exec(void) {
    printf("pai PID=%d: chamando fork()\n", (int)getpid());
    fflush(stdout);
    pid_t pid = fork();
    if (pid < 0) { perror("fork"); return 1; }
    if (pid == 0) {
        printf("filho PID=%d PPID=%d: fork() retornou 0; chamando exec(ps)\n",
               (int)getpid(), (int)getppid());
        fflush(stdout);
        char alvo[16];
        snprintf(alvo, sizeof alvo, "%d", (int)getpid());
        execlp("ps", "ps", "-o", "pid,ppid,stat,comm", "-p", alvo, (char *)NULL);
        perror("exec"); /* so chega aqui se o exec falhar */
        _exit(127);
    }
    printf("pai: fork() retornou %d (PID do filho); aguardando com wait\n", (int)pid);
    fflush(stdout);
    int status;
    if (waitpid(pid, &status, 0) < 0) { perror("wait"); return 1; }
    relatar(pid, status);
    return 0;
}

static int modo_zumbi(int segundos) {
    pid_t pid = fork();
    if (pid < 0) { perror("fork"); return 1; }
    if (pid == 0) _exit(7); /* o filho termina imediatamente com codigo 7 */

    printf("pai PID=%d criou o filho %d, que ja terminou.\n", (int)getpid(), (int)pid);
    printf("pai: vou esperar %d s ANTES de chamar wait.\n", segundos);
    dormir_ms(500);
    printf("Estado do filho agora (PID PPID STAT COMANDO):\n");
    mostrar(pid);
    printf("Em outro terminal: ps -o pid,ppid,stat,comm --ppid %d\n", (int)getpid());
    fflush(stdout);
    dormir_ms(segundos * 1000L);

    int status;
    if (waitpid(pid, &status, 0) < 0) { perror("wait"); return 1; }
    relatar(pid, status);
    printf("Estado do filho depois do wait:\n");
    mostrar(pid);
    return 0;
}

static int modo_orfao(void) {
    pid_t pid = fork();
    if (pid < 0) { perror("fork"); return 1; }
    if (pid == 0) {
        printf("filho PID=%d: meu PPID agora e %d\n", (int)getpid(), (int)getppid());
        fflush(stdout);
        dormir_ms(2000); /* o pai termina durante esta pausa */
        printf("filho PID=%d: depois que o pai terminou, meu PPID e %d\n",
               (int)getpid(), (int)getppid());
        mostrar(getppid());
        fflush(stdout);
        _exit(0);
    }
    printf("pai PID=%d: vou terminar sem esperar o filho %d\n", (int)getpid(), (int)pid);
    fflush(stdout);
    dormir_ms(500);
    printf("pai PID=%d: terminando (o prompt pode voltar antes do filho escrever)\n",
           (int)getpid());
    return 0;
}

int main(int argc, char *argv[]) {
    if (argc > 1 && strcmp(argv[1], "exec") == 0) return modo_exec();
    if (argc > 1 && strcmp(argv[1], "orfao") == 0) return modo_orfao();
    if (argc > 1 && strcmp(argv[1], "zumbi") == 0) {
        int s = argc > 2 ? atoi(argv[2]) : 5;
        if (s < 1 || s > 30) { fputs("Use entre 1 e 30 segundos.\n", stderr); return 1; }
        return modo_zumbi(s);
    }
    fputs("Uso: ./ciclo exec | ./ciclo zumbi [segundos] | ./ciclo orfao\n", stderr);
    return 1;
}
