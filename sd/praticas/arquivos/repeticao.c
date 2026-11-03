#include <stdio.h>
#include <string.h>

int main(int argc, char **argv) {
    const char *modo = argc == 2 ? argv[1] : "sem";
    if (argc > 2 || (strcmp(modo, "sem") && strcmp(modo, "dedup") && strcmp(modo, "reinicio"))) {
        fputs("Uso: ./repeticao [sem|dedup|reinicio]\n", stderr); return 2;
    }
    int dedup = strcmp(modo, "sem") != 0;
    int total = 84, visto = 0, resposta = 0, efeitos = 0;
    for (int tentativa = 1; tentativa <= 2; ++tentativa) {
        if (tentativa == 2 && strcmp(modo, "reinicio") == 0) {
            visto = 0; puts("Reinicio modelado: efeito preservado, tabela volatil perdida.");
        }
        printf("Recebe id=P1:5 valor=12 tentativa=%d\n", tentativa);
        if (dedup && visto) puts("Duplicata: devolve resposta armazenada sem reaplicar.");
        else { total += 12; ++efeitos; visto = 1; resposta = total; }
        if (tentativa == 1) puts("Resposta suprimida: cliente observa timeout, causa desconhecida.");
        else printf("Cliente recebe resposta=%d\n", resposta);
    }
    printf("Total=%d Efeitos=%d\n", total, efeitos);
    return 0;
}
