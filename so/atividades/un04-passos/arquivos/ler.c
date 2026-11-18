#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>

int main(void) {
    int fd = open("nota.txt", O_RDONLY);
    printf("open devolveu o FD %d\n", fd);
    if (fd == -1) {
        printf("erro: nao foi possivel abrir nota.txt\n");
        return 1;
    }

    char buffer[100];
    ssize_t n = read(fd, buffer, sizeof buffer);
    printf("read leu %zd bytes; agora write(1, ...) mostra na tela:\n", n);

    write(1, buffer, n);
    close(fd);
    return 0;
}
// fim do codigo
