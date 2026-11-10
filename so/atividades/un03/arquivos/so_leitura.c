/* so_leitura.c - protecao de memoria (Atividade 2).
 * Uma pagina vira "somente leitura": ler funciona, escrever e bloqueado. */
#define _DEFAULT_SOURCE
#include <stdio.h>
#include <sys/mman.h>
#include <unistd.h>

int main(void) {
    size_t pagina = (size_t)sysconf(_SC_PAGESIZE);
    char *p = mmap(NULL, pagina, PROT_READ | PROT_WRITE,
                   MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);    /* uma pagina */
    if (p == MAP_FAILED) { perror("mmap"); return 1; }

    p[0] = 1;                          /* escrever ainda e permitido */
    mprotect(p, pagina, PROT_READ);    /* agora: somente leitura */

    printf("leitura ok: %d\n", p[0]);
    printf("tentando escrever...\n");
    fflush(stdout);                    /* mostra o texto antes de cair */
    p[0] = 2;                          /* proibido: a MMU avisa o SO */
    printf("escrita ok (nao deveria aparecer)\n");
    return 0;
}
