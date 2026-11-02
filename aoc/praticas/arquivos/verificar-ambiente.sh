#!/usr/bin/env bash
# Somente diagnostico; nao instala nem altera configuracoes.
printf 'Arquitetura: '; uname -m
for ferramenta in bash gcc objdump od lscpu getconf; do
  if command -v "$ferramenta" >/dev/null 2>&1; then
    printf 'OK %s\n' "$ferramenta"
  else
    printf 'AUSENTE %s (avise o professor)\n' "$ferramenta"
  fi
done
printf 'Opcional: '; command -v gdb || true
printf 'Espaco usado na conta:\n'; du -sh "$HOME"
printf 'Limites do shell:\n'; ulimit -a
