#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

#define TOTAL_LOGS 100

int main(void) {
    const char *linha_log = "192.168.1.50 - GET /index.html 200 OK\n";
    size_t len = strlen(linha_log);

    printf("=== GRAVANDO %d LOGS DE ACESSO DO SERVIDOR NO DISCO ===\n", TOTAL_LOGS);

    // Metodo 1: Sem buffer (100 chamadas de sistema write individuais ao kernel)
    int fd_direto = open("logs_direto.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd_direto < 0) return 1;

    for (int i = 0; i < TOTAL_LOGS; i++) {
        write(fd_direto, linha_log, len); // 100 transições de modo usuario -> modo kernel!
    }
    close(fd_direto);

    // Metodo 2: Com buffer de E/S (dados acumulados na memoria do processo)
    FILE *f_buffer = fopen("logs_buffer.txt", "w");
    if (!f_buffer) return 1;

    for (int i = 0; i < TOTAL_LOGS; i++) {
        fputs(linha_log, f_buffer); // Acumula no buffer em espaco de usuario
    }
    fclose(f_buffer); // 1 unica transferencia em lote para o kernel

    puts("Arquivo 'logs_direto.txt' gerado com 100 chamadas de sistema write().");
    puts("Arquivo 'logs_buffer.txt' gerado com bufferizacao eficiente da biblioteca C.");
    puts("\nConclusao de SO: Buffers reduzem drasticamente as mudancas de contexto para o kernel.");

    return 0;
}
