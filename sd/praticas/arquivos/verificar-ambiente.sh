#!/usr/bin/env bash
# Diagnostico de leitura: nao abre sockets, nao instala nem altera politicas.
set -u
printf 'SD: diagnostico local, sem homologacao automatica\n'
for ferramenta in bash gcc uname getconf; do
  if command -v "$ferramenta"; then :; else printf 'AUSENTE: %s\n' "$ferramenta"; fi
done
uname -sr
getconf LONG_BIT
printf 'Limites do shell (nao equivalem a quotas completas):\n'
ulimit -u
ulimit -f
printf 'Confirmar com o professor: C11, fork/pipe, quotas e politica de rede vigente.\n'
