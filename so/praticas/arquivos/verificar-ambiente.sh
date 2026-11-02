#!/usr/bin/env bash
# Consulta somente; nenhum acesso administrativo, instalacao ou rede.
for ferramenta in bash gcc ps uname lscpu free df stat ln chmod getconf sed head; do
  if command -v "$ferramenta" >/dev/null 2>&1; then
    printf 'OK %s\n' "$ferramenta"
  else
    printf 'AUSENTE %s (avise o professor)\n' "$ferramenta"
  fi
done
for ferramenta in strace lsblk readlink lsmod modinfo vmstat pmap; do
  if command -v "$ferramenta" >/dev/null 2>&1; then
    printf 'Opcional disponivel: %s\n' "$ferramenta"
  else
    printf 'Opcional ausente: %s\n' "$ferramenta"
  fi
done
printf 'Arquitetura: '; uname -m
printf 'Limites do shell:\n'; ulimit -a
