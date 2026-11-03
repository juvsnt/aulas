#!/usr/bin/env bash
# investigar.sh - atalhos de observacao da Atividade da Unidade II.
# Somente consulta processos do proprio usuario; sem sudo, instalacao ou rede.
# Uso: ./investigar.sh compilar | estado PID | arvore | threads PID | disputa [s] | limpar
set -u
PROGRAMAS="carga espera ciclo threads contador impasse"

uso() {
  cat <<'TEXTO'
Uso:
  ./investigar.sh compilar        compila os seis programas
  ./investigar.sh estado PID      "prontuario" do processo (/proc/PID/status)
  ./investigar.sh arvore          seus processos em arvore (PID, PPID, estado, nice)
  ./investigar.sh threads PID     threads do processo (ps -T e /proc/PID/task)
  ./investigar.sh disputa [s]     duas cargas no mesmo nucleo: nice 0 x nice 10
  ./investigar.sh limpar          encerra programas desta atividade que ficaram ativos
TEXTO
}

compilar() {
  local ok=0
  for p in $PROGRAMAS; do
    if gcc -std=c11 -Wall -Wextra -O0 "$p.c" -o "$p" -pthread; then
      printf 'OK %s\n' "$p"
    else
      printf 'FALHOU %s (avise o professor)\n' "$p"; ok=1
    fi
  done
  return $ok
}

exige_pid() {
  if [[ -z "${1:-}" || ! -d "/proc/$1" ]]; then
    echo "Informe o PID de um processo ativo. Ex.: ./investigar.sh estado 1234" >&2
    exit 1
  fi
}

estado() {
  exige_pid "${1:-}"
  grep -E '^(Name|State|Pid|PPid|Threads|voluntary_ctxt_switches|nonvoluntary_ctxt_switches):' \
    "/proc/$1/status"
  printf 'Nice:\t%s\n' "$(ps -o ni= -p "$1" | tr -d ' ')"
}

arvore() {
  ps -u "$USER" -o pid,ppid,stat,ni,time,comm --forest
}

threads() {
  exige_pid "${1:-}"
  ps -T -o pid,spid,stat,time,comm -p "$1"
  printf 'Diretorios em /proc/%s/task: ' "$1"
  ls "/proc/$1/task" | tr '\n' ' '; echo
}

disputa() {
  local s="${1:-5}"
  [[ -x ./carga ]] || { echo "Compile antes: ./investigar.sh compilar" >&2; exit 1; }
  local fixar=""
  if command -v taskset >/dev/null 2>&1 && taskset -c 0 true 2>/dev/null; then
    fixar="taskset -c 0"
    echo "As duas cargas foram fixadas no nucleo 0 (taskset)."
  else
    echo "AVISO: taskset indisponivel; as cargas podem usar nucleos diferentes."
  fi
  echo "Disputando a CPU por $s s: carga com nice 0 e carga com nice 10..."
  $fixar ./carga "$s" &
  $fixar nice -n 10 ./carga "$s" &
  wait
}

limpar() {
  local achou=0
  for p in $PROGRAMAS; do
    for pid in $(pgrep -u "$USER" -x "$p"); do
      kill -CONT "$pid" 2>/dev/null   # um processo parado (T) precisa continuar para receber TERM
      kill -TERM "$pid" 2>/dev/null && { echo "encerrado: $p (PID $pid)"; achou=1; }
    done
  done
  [[ $achou -eq 1 ]] || echo "Nenhum programa da atividade estava ativo."
}

case "${1:-}" in
  compilar) compilar ;;
  estado)   estado "${2:-}" ;;
  arvore)   arvore ;;
  threads)  threads "${2:-}" ;;
  disputa)  disputa "${2:-5}" ;;
  limpar)   limpar ;;
  *)        uso; exit 1 ;;
esac
