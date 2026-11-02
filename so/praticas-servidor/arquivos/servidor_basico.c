#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>
#include <errno.h>

int main(void) {
    printf("=== SERVIDOR WEB: ATENDENDO REQUISICAO VIA SYSCALLS ===\n");
    printf("Processo do servidor em execucao: PID = %ld\n\n", (long)getpid());

    // 1. O servidor recebe o pedido de arquivo index.html do cliente
    FILE *pedido = fopen("pedido.txt", "w");
    if (!pedido) { perror("pedido.txt"); return 1; }
    fputs("GET /index.html HTTP/1.1\n", pedido);
    fclose(pedido);

    // 2. Syscall de abertura para leitura do pedido
    int fd_pedido = open("pedido.txt", O_RDONLY);
    if (fd_pedido < 0) { perror("open pedido"); return 1; }

    char buffer[128];
    ssize_t bytes_lidos = read(fd_pedido, buffer, sizeof(buffer) - 1);
    if (bytes_lidos < 0) { perror("read"); close(fd_pedido); return 1; }
    buffer[bytes_lidos] = '\0';
    close(fd_pedido);

    printf("Requisicao recebida pelo descritor de arquivo: %s", buffer);

    // 3. Syscall gerando a resposta HTTP 200 OK
    int fd_resposta = open("resposta.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd_resposta < 0) { perror("open resposta"); return 1; }

    const char *resposta = "HTTP/1.1 200 OK\nContent-Type: text/html\n\n<h1>Servidor LIAC Online</h1>\n";
    if (write(fd_resposta, resposta, strlen(resposta)) != (ssize_t)strlen(resposta)) {
        perror("write resposta"); close(fd_resposta); return 1;
    }
    close(fd_resposta);
    puts("Resposta gravada com sucesso em 'resposta.txt' (HTTP 200 OK).");

    // 4. Demonstrando o Erro 404 no kernel: tentando abrir arquivo que nao existe
    puts("\n=== ENOENT NO KERNEL E DECISAO HTTP NA APLICACAO ===");
    int fd_invalido = open("pagina_inexistente.html", O_RDONLY);
    if (fd_invalido < 0) {
        printf("open('pagina_inexistente.html'): Retorno = -1\n");
        printf("Codigo de erro errno = %d (%s)\n", errno, strerror(errno));
        if (errno == ENOENT) {
            puts("Resultado no servidor: HTTP 404 Not Found (Arquivo nao encontrado no sistema de arquivos)!");
        }
    } else {
        close(fd_invalido);
    }

    return 0;
}
