set pagination off
set debuginfod enabled off
set disable-randomization off
set disassembly-flavor intel
break calibrar
run
print leitura
info registers rip rbp rsp
x/i $pc
stepi
x/i $pc
