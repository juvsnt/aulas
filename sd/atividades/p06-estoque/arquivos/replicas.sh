#!/bin/bash
# Tres copias (A, B e C) da mesma informacao, em tres arquivos.
modo=$1
texto=$2

if [ "$modo" = "iniciar" ]; then
    for r in A B C; do echo "foto antiga" > replica_$r.txt; done
    echo "As tres replicas comecam iguais."

elif [ "$modo" = "eventual" ]; then
    echo "$texto" > replica_A.txt
    echo "Gravei em A e ja respondi ao cliente."
    ( sleep 5; echo "$texto" > replica_B.txt
      sleep 5; echo "$texto" > replica_C.txt ) > /dev/null 2>&1 &

elif [ "$modo" = "forte" ]; then
    exec 9> replicas.lock
    flock 9                       # LOCK: ninguem le durante a escrita
    for r in A B C; do
        echo "$texto" > replica_$r.txt
        sleep 1                   # atraso da rede, simulado
    done
    echo "Gravei em A, B e C. So agora respondo ao cliente."

elif [ "$modo" = "ler" ]; then
    exec 9> replicas.lock
    flock -s 9                    # espera se houver escrita forte
    for r in A B C; do echo "Replica $r: $(cat replica_$r.txt)"; done

else
    echo "Uso: ./replicas.sh iniciar | eventual TEXTO | forte TEXTO | ler"
fi
# fim do script
