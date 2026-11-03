#include <stdio.h>
#include <string.h>

int main(int argc, char **argv) {
    int falha = argc == 2 && strcmp(argv[1], "falha") == 0;
    if (argc > 2 || (argc == 2 && !falha)) {
        fputs("Uso: ./coordenacao [falha]\n", stderr); return 2;
    }
    int titular = 1, vivo[] = {0, 1, 1, 1}, atualizacoes = 0;
    for (int rodada = 1; rodada <= 6; ++rodada) {
        if (falha && rodada == 2) vivo[2] = 0;
        if (!vivo[titular]) {
            printf("Rodada=%d token com P%d indisponivel: sem progresso\n", rodada, titular);
            continue;
        }
        printf("Rodada=%d P%d entra, atualiza e sai; passa token\n", rodada, titular);
        ++atualizacoes; titular = titular % 3 + 1;
    }
    printf("Atualizacoes=%d; um unico titular por rodada neste modelo\n", atualizacoes);
    int eleito = 0;
    for (int i = 1; i <= 3; ++i) if (vivo[i]) eleito = i;
    printf("Selecao com visao unica: maior id vivo=P%d\n", eleito);
    puts("Visoes divergentes: {P1,P2} escolhe P2; {P3} escolhe P3.");
    puts("Escolher lider nao revoga automaticamente um token antigo.");
    return 0;
}
