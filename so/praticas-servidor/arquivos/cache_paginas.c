#include <stdio.h>
#include <string.h>

#define TOTAL_ACESSOS 6
#define MOLDURAS 3

int main(int argc, char **argv) {
    const char *algo = (argc > 1) ? argv[1] : "lru";
    int acessos[TOTAL_ACESSOS] = {1, 2, 3, 1, 4, 2}; // Sequencia de imagens acessadas

    printf("=== CACHE DE IMAGENS DO SERVIDOR: ALGORITMO %s ===\n",
           (strcmp(algo, "fifo") == 0) ? "FIFO (First-In First-Out)" : "LRU (Least Recently Used)");
    printf("Capacidade da memoria RAM: %d imagens em cache\n\n", MOLDURAS);

    int frames[MOLDURAS] = {-1, -1, -1};
    int tempo_uso[MOLDURAS] = {0, 0, 0};
    int ordem_chegada[MOLDURAS] = {0, 0, 0};
    int faltas = 0, hits = 0;
    int relogio = 0;

    for (int i = 0; i < TOTAL_ACESSOS; i++) {
        int pagina = acessos[i];
        relogio++;
        int hit = 0;

        for (int m = 0; m < MOLDURAS; m++) {
            if (frames[m] == pagina) {
                hit = 1;
                tempo_uso[m] = relogio; // Atualiza recência no LRU
                break;
            }
        }

        if (hit) {
            hits++;
            printf("Acesso a Imagem %d: [HIT] Ja estava em cache na RAM!\n", pagina);
        } else {
            faltas++;
            // Escolhe qual moldura substituir
            int vitima = 0;
            // Se houver moldura vazia, usa ela
            int encontrou_vazio = 0;
            for (int m = 0; m < MOLDURAS; m++) {
                if (frames[m] == -1) {
                    vitima = m;
                    encontrou_vazio = 1;
                    break;
                }
            }

            if (!encontrou_vazio) {
                if (strcmp(algo, "fifo") == 0) {
                    // Substitui a mais antiga que chegou
                    int menor_chegada = ordem_chegada[0];
                    for (int m = 1; m < MOLDURAS; m++) {
                        if (ordem_chegada[m] < menor_chegada) {
                            menor_chegada = ordem_chegada[m];
                            vitima = m;
                        }
                    }
                } else {
                    // LRU: substitui a menos usada recentemente
                    int menor_uso = tempo_uso[0];
                    for (int m = 1; m < MOLDURAS; m++) {
                        if (tempo_uso[m] < menor_uso) {
                            menor_uso = tempo_uso[m];
                            vitima = m;
                        }
                    }
                }
            }

            int imagem_expulsa = frames[vitima];
            frames[vitima] = pagina;
            tempo_uso[vitima] = relogio;
            ordem_chegada[vitima] = relogio;

            if (imagem_expulsa != -1) {
                printf("Acesso a Imagem %d: [FALTA DE PAGINA] Expulsou Imagem %d da RAM\n",
                       pagina, imagem_expulsa);
            } else {
                printf("Acesso a Imagem %d: [FALTA DE PAGINA] Carregou no frame livre %d\n",
                       pagina, vitima);
            }
        }
    }

    printf("\n=== RESULTADO DA SUBSTITUICAO (%s) ===\n", algo);
    printf("Total de acessos: %d\n", TOTAL_ACESSOS);
    printf("Faltas de pagina: %d | Hits em RAM: %d\n", faltas, hits);

    return 0;
}
