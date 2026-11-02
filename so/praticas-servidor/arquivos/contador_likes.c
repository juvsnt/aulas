#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <string.h>

#define CLICKS_POR_CLIENTE 50000

long contador_likes = 0;
pthread_mutex_t trava_likes = PTHREAD_MUTEX_INITIALIZER;
int usar_mutex = 0;

void *cliente_clicando(void *arg) {
    (void)arg;
    for (int i = 0; i < CLICKS_POR_CLIENTE; i++) {
        if (usar_mutex) {
            pthread_mutex_lock(&trava_likes);
            contador_likes++; // Regiao critica protegida por exclusao mutua
            pthread_mutex_unlock(&trava_likes);
        } else {
            // Regiao critica desprotegida: leitura e gravacao sofrem perda por corrida
            long temp = contador_likes;
            // Pequeno laço para forçar a intercalacao de threads na CPU
            for (volatile int j = 0; j < 5; j++);
            contador_likes = temp + 1;
        }
    }
    return NULL;
}

int main(int argc, char **argv) {
    usar_mutex = (argc > 1 && strcmp(argv[1], "com_mutex") == 0);

    printf("=== SERVIDOR WEB: 2 CLIENTES CLICANDO EM CURTIR (%s) ===\n",
           usar_mutex ? "COM MUTEX" : "SEM MUTEX (RACE CONDITION)");
    printf("Total esperado: 2 clientes x %d cliques = %d curtidas\n",
           CLICKS_POR_CLIENTE, CLICKS_POR_CLIENTE * 2);

    pthread_t thread1, thread2;
    pthread_create(&thread1, NULL, cliente_clicando, NULL);
    pthread_create(&thread2, NULL, cliente_clicando, NULL);

    pthread_join(thread1, NULL);
    pthread_join(thread2, NULL);

    printf("Total REAL computado no servidor: %ld curtidas\n", contador_likes);

    if (contador_likes == CLICKS_POR_CLIENTE * 2) {
        puts(usar_mutex ? "Sucesso! Mutex protegeu as atualizacoes."
                        : "Total coincidiu nesta execucao; isso nao comprova ausencia de corrida.");
    } else {
        printf("Perda detectada! Faltaram %ld curtidas por falta de exclusao mutua.\n",
               (CLICKS_POR_CLIENTE * 2) - contador_likes);
    }

    return 0;
}
