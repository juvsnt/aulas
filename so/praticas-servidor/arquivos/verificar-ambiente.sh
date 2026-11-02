#!/usr/bin/env bash
set -euo pipefail
echo "=== VERIFICACAO DO AMBIENTE LIAC (TRILHA SERVIDOR WEB) ==="
echo -n "Kernel Linux: " && uname -sr
echo -n "Compilador GCC: " && (command -v gcc >/dev/null && gcc --version | head -n1 || echo "NAO ENCONTRADO")
echo -n "Suporte a Threads: " && (gcc -pthread -E - </dev/null >/dev/null 2>&1 && echo "OK (pthreads disponivel)" || echo "NAO DISPONIVEL")
echo "Pronto para as praticas de Sistemas Operacionais!"
