#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

#define TOTAL_LOGS 100

int main(void) {
    const char *linha_log = "192.168.1.50 - GET /index.html 200 OK\n";
    size_t len = strlen(linha_log);

    printf("=== GRAVANDO %d LOGS DE ACESSO DO SERVIDOR NO DISCO ===\n", TOTAL_LOGS);

    // Metodo 1: Sem buffer da biblioteca C; o kernel ainda pode usar page cache.
    int fd_direto = open("logs_direto.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd_direto < 0) return 1;

    for (int i = 0; i < TOTAL_LOGS; i++) {
        if (write(fd_direto, linha_log, len) != (ssize_t)len) {
            perror("write"); close(fd_direto); return 1;
        }
    }
    close(fd_direto);

    // Metodo 2: Com buffer de E/S (dados acumulados na memoria do processo)
    FILE *f_buffer = fopen("logs_buffer.txt", "w");
    if (!f_buffer) return 1;

    for (int i = 0; i < TOTAL_LOGS; i++) {
        if (fputs(linha_log, f_buffer) == EOF) { perror("fputs"); fclose(f_buffer); return 1; }
    }
    if (fclose(f_buffer) == EOF) { perror("fclose"); return 1; }

    puts("Arquivo 'logs_direto.txt' gerado com 100 chamadas de sistema write().");
    puts("Arquivo 'logs_buffer.txt' gerado com bufferizacao eficiente da biblioteca C.");
    puts("\nConclusao de SO: Buffers podem reduzir chamadas de sistema e transicoes de modo.");

    return 0;
}
