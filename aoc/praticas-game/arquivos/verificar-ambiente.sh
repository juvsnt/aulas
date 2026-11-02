#!/usr/bin/env bash
set -euo pipefail
echo "=== VERIFICACAO DO AMBIENTE LIAC (TRILHA CONSOLE RETRO) ==="
echo -n "Arquitetura: " && uname -m
echo -n "GCC: " && (command -v gcc >/dev/null && gcc --version | head -n1 || echo "NAO ENCONTRADO")
echo -n "OBJDUMP: " && (command -v objdump >/dev/null && objdump --version | head -n1 || echo "NAO ENCONTRADO")
echo "Pronto para as praticas de AOC!"
