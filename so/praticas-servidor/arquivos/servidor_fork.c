#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>
#include <string.h>

int main(int argc, char **argv) {
    // Se invocado com argumento "trabalhador", simula a execucao apos o exec
    if (argc == 2 && strcmp(argv[1], "trabalhador") == 0) {
        printf("[PROCESSO FILHO APOS EXEC] PID = %ld | PPID = %ld\n",
               (long)getpid(), (long)getppid());
        puts("Trabalhador processou o pedido do cliente com sucesso.");
        return 200; // Codigo HTTP 200 OK retornado como exit status
    }

    printf("=== SERVIDOR MASTER (PAI): GERENCIANDO REQUISICOES ===\n");
    int conexoes_ativas = 1;
    printf("Servidor Pai iniciado: PID = %ld | Conexoes = %d\n",
           (long)getpid(), conexoes_ativas);

    puts("\n[CLIENTE CONECTOU] Criando processo filho (fork) para atender o cliente...");
    fflush(stdout);

    pid_t pid = fork();

    if (pid < 0) {
        perror("fork");
        return 1;
    }

    if (pid == 0) {
        // Codigo do processo filho (trabalhador)
        conexoes_ativas = 99; // Modifica apenas a copia da memoria do filho!
        printf("[FILHO ANTES DO EXEC] PID = %ld | PPID = %ld | Minhas conexoes = %d\n",
               (long)getpid(), (long)getppid(), conexoes_ativas);
        fflush(stdout);

        // Substitui a imagem do processo pelo trabalhador
        execl("./servidor_fork", "servidor_fork", "trabalhador", (char *)NULL);
        perror("execl");
        _exit(1);
    }

    // Codigo do processo Pai: aguarda o filho terminar
    int status;
    waitpid(pid, &status, 0);

    puts("\n=== RESUMO NO SERVIDOR PAI ===");
    printf("Conexoes no Pai continuam intactas: %d (Memoria isolada do filho!)\n", conexoes_ativas);
    if (WIFEXITED(status)) {
        printf("Processo filho terminou com status HTTP = %d\n", WEXITSTATUS(status));
    }

    return 0;
}
