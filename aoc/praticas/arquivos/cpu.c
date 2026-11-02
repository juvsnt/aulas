#include <stdio.h>
#include <stdlib.h>
#include <string.h>
/* Modelo: PC indexa instrucoes; dados usam enderecos 0 e 1. */
int main(int argc, char **argv) {
    char *fim;
    long valor = argc > 1 ? strtol(argv[1], &fim, 10) : 24;
    if (argc > 2 || (argc > 1 && (fim == argv[1] || *fim)) || valor < -1000 || valor > 1000) {
        fputs("Use uma leitura inteira de -1000 a 1000.\n", stderr); return 1;
    }
    int mem[] = {(int)valor, 0}, r = 0, zf = 0, cmp = 0, pc = 0;
    const char *ops[] = {"LOAD", "ADD", "STORE", "CMP", "JGE", "HALT", "HALT"};
    int args[] = {0, 2, 1, 24, 6, 0, 0};
    for (;;) {
        int atual = pc, arg = args[pc];
        const char *op = ops[pc]; /* Busca: IR recebe a instrucao no PC. */
        pc++;
        if (!strcmp(op, "LOAD")) r = mem[arg];
        else if (!strcmp(op, "ADD")) r += arg;
        else if (!strcmp(op, "STORE")) mem[arg] = r;
        else if (!strcmp(op, "CMP")) { cmp = r - arg; zf = cmp == 0; }
        else if (!strcmp(op, "JGE") && cmp >= 0) pc = arg;
        printf("PC=%d IR=%s %d R=%d ZF=%d\n", atual, op, arg, r, zf);
        printf("  proximo_PC=%d memoria[1]=%d\n", pc, mem[1]);
        if (!strcmp(op, "HALT")) break;
    }
    return 0;
}
