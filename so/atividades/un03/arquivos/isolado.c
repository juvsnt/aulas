/* isolado.c - cada processo tem o seu espaco de enderecamento (Atividade 2).
 * Pai e filho mostram o endereco e o valor da mesma variavel x. */
#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <sys/wait.h>
#include <unistd.h>

int x = 10;                       /* variavel global */

int main(void) {
    pid_t pid = fork();           /* cria uma copia deste processo */
    if (pid < 0) { perror("fork"); return 1; }
    if (pid == 0) {               /* filho */
        x = 99;                   /* muda x somente no filho */
        printf("filho: endereco de x = %p | x = %d\n", (void *)&x, x);
        return 0;
    }
    wait(NULL);                   /* pai espera o filho terminar */
    printf("pai:   endereco de x = %p | x = %d\n", (void *)&x, x);
    return 0;
}
