#!/usr/bin/env bash
# Apenas leitura. Nenhuma mudanca de configuracao, acesso administrativo ou rede.
set -eu
export LC_ALL=C
printf '=== O ambiente que esta executando seu programa ===\n'
uname -srmo
if command -v gcc >/dev/null 2>&1; then gcc --version | head -n 1; fi
permitidas=$(awk '/^Cpus_allowed_list:/ {print $2}' /proc/self/status)
printf 'CPUs permitidas para esta conta: %s\n' "$permitidas"
primeira=${permitidas%%,*}
primeira=${primeira%%-*}
printf 'Cache informada pelo Linux para a CPU %s (nao e medicao de velocidade):\n' "$primeira"
encontrou=0
for pasta in /sys/devices/system/cpu/cpu"$primeira"/cache/index*; do
    [ -r "$pasta/level" ] || continue
    encontrou=1
    printf 'Nivel L%s | tipo=%s | tamanho=%s | linha_bytes=%s\n' \
        "$(cat "$pasta/level")" "$(cat "$pasta/type")" \
        "$(cat "$pasta/size")" "$(cat "$pasta/coherency_line_size")"
done
if [ "$encontrou" -eq 0 ]; then
    printf 'Informacao de cache indisponivel nesta conta. Registre esta mensagem.\n'
fi
printf 'Observacao: ambiente virtualizado pode mostrar a visao do hospedeiro ou do convidado.\n'
printf 'Permissao de contadores (somente leitura): '
if [ -r /proc/sys/kernel/perf_event_paranoid ]; then cat /proc/sys/kernel/perf_event_paranoid; else printf 'nao informada\n'; fi
if command -v perf >/dev/null 2>&1; then
    printf 'perf encontrado; isso nao garante acesso aos contadores.\n'
else
    printf 'perf nao encontrado; as duas atividades funcionam sem ele.\n'
fi
