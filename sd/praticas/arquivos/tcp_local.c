#define _POSIX_C_SOURCE 200809L
#include <arpa/inet.h>
#include <errno.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <sys/wait.h>
#include <unistd.h>

/* Extensao somente em ambiente autorizado. Loopback; porta efemera. */
static void erro(const char *onde) { perror(onde); exit(1); }
int main(void) {
    signal(SIGPIPE, SIG_IGN); alarm(5);
    int servidor = socket(AF_INET, SOCK_STREAM, 0);
    if (servidor < 0) erro("socket");
    struct sockaddr_in endereco = {0};
    endereco.sin_family = AF_INET;
    endereco.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
    endereco.sin_port = 0;
    if (bind(servidor, (struct sockaddr *)&endereco, sizeof endereco) < 0) erro("bind");
    socklen_t tamanho = sizeof endereco;
    if (getsockname(servidor, (struct sockaddr *)&endereco, &tamanho) < 0) erro("getsockname");
    if (listen(servidor, 1) < 0) erro("listen");
    pid_t filho = fork();
    if (filho < 0) erro("fork");
    if (filho == 0) {
        alarm(5); close(servidor);
        int cliente = socket(AF_INET, SOCK_STREAM, 0);
        if (cliente < 0) _exit(1);
        if (connect(cliente, (struct sockaddr *)&endereco, sizeof endereco) < 0) { perror("connect"); _exit(1); }
        const char texto[] = "12\n18\n24\n30\n";
        size_t enviados = 0;
        while (enviados < sizeof texto - 1) {
            ssize_t n = send(cliente, texto + enviados, sizeof texto - 1 - enviados, 0);
            if (n < 0 && errno == EINTR) continue;
            if (n <= 0) _exit(1);
            enviados += (size_t)n;
        }
        close(cliente); _exit(0);
    }
    int conexao;
    do { conexao = accept(servidor, NULL, NULL); } while (conexao < 0 && errno == EINTR);
    if (conexao < 0) { perror("accept"); close(servidor); (void)waitpid(filho, NULL, 0); return 1; }
    close(servidor);
    char linha[16], c; size_t usados = 0; int total = 0, registros = 0, falhou = 0;
    for (;;) {
        ssize_t n = recv(conexao, &c, 1, 0);
        if (n < 0 && errno == EINTR) continue;
        if (n < 0) { perror("recv"); falhou = 1; break; }
        if (!n) break;
        if (c == '\n') {
            linha[usados] = '\0'; char *fim;
            errno = 0; long valor = strtol(linha, &fim, 10);
            if (errno || !usados || *fim || valor < 0 || valor > 100 || registros >= 4) { falhou = 1; break; }
            total += (int)valor; ++registros; usados = 0;
        } else if (usados + 1 < sizeof linha) linha[usados++] = c;
        else { falhou = 1; break; }
    }
    close(conexao); int status;
    while (waitpid(filho, &status, 0) < 0) if (errno != EINTR) erro("waitpid");
    if (usados || registros != 4 || !WIFEXITED(status) || WEXITSTATUS(status)) falhou = 1;
    printf("TCP loopback: leituras=%d total=%d resultado=%s\n", registros, total, falhou ? "ERRO" : "OK");
    alarm(0); return falhou ? 1 : 0;
}
