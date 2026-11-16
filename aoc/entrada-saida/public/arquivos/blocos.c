/* blocos.c - AOC, Unidade 5, Atividade 3.
   Le o mesmo arquivo de 4 MiB cinco vezes, com pedidos (blocos) de
   tamanhos diferentes. Cada read() e um pedido ao sistema operacional.
   Mostra quantos pedidos foram feitos e quanto tempo levou.
   Limite: os dados vem da memoria (cache de arquivos do Linux), nao do
   disco. Mede-se o custo de cada pedido, nao o DMA. */
#define _POSIX_C_SOURCE 200809L
#include <fcntl.h>
#include <stdio.h>
#include <time.h>
#include <unistd.h>

#define TAMANHO (4u * 1024u * 1024u)   /* 4 MiB = 4.194.304 bytes */
#define NOME "dados_4MiB.bin"

static double relogio(void) {
    struct timespec t;
    clock_gettime(CLOCK_MONOTONIC, &t);
    return (double)t.tv_sec + (double)t.tv_nsec / 1e9;
}

int main(void) {
    static unsigned char buf[65536];

    /* 1. cria o arquivo de 4 MiB na pasta atual */
    int fd = open(NOME, O_WRONLY | O_CREAT | O_TRUNC, 0600);
    if (fd < 0) { perror(NOME); return 1; }
    for (unsigned i = 0; i < sizeof buf; i++) buf[i] = (unsigned char)(i * 7u);
    for (unsigned feito = 0; feito < TAMANHO; feito += (unsigned)sizeof buf)
        if (write(fd, buf, sizeof buf) != (ssize_t)sizeof buf) { perror("write"); return 1; }
    close(fd);

    /* 2. le o arquivo inteiro com cada tamanho de bloco */
    const size_t blocos[] = {1, 16, 512, 4096, 65536};
    printf("Arquivo de 4 MiB = %u bytes\n\n", TAMANHO);
    printf("%12s %12s %12s %16s\n", "bloco(bytes)", "pedidos", "tempo(ms)", "ns por pedido");
    for (size_t k = 0; k < sizeof blocos / sizeof blocos[0]; k++) {
        fd = open(NOME, O_RDONLY);
        if (fd < 0) { perror(NOME); return 1; }
        unsigned long long pedidos = 0, lidos = 0;
        ssize_t r;
        double t0 = relogio();
        while ((r = read(fd, buf, blocos[k])) > 0) {
            pedidos++;
            lidos += (unsigned long long)r;
        }
        double ms = (relogio() - t0) * 1e3;
        close(fd);
        if (r < 0 || lidos != TAMANHO) { fprintf(stderr, "erro de leitura\n"); return 1; }
        printf("%12zu %12llu %12.1f %16.1f\n", blocos[k], pedidos, ms,
               ms * 1e6 / (double)pedidos);
    }

    /* 3. apaga o arquivo para nao ocupar a sua cota */
    unlink(NOME);
    return 0;
}
