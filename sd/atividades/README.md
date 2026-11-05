# SD — Atividades avulsas

Atividades de Sistemas Distribuídos **fora do percurso** `../praticas/`, com
entrega individual. Usam o mesmo visual do percurso (`../praticas/styles.css`,
inclusive os comandos em azul com `$`) e acrescentam `atividades.css` e
`script.js` (respostas no navegador com prefixo `sd-atividade-`, conferência
das partes obrigatórias e geração do arquivo de entrega).

| Pasta | Atividade | Situação |
| --- | --- | --- |
| `p05-difusao/` | P05 — Uma mensagem para todos (Unidade 5) | Homologada no LIAC em 05/11/2026 |

## P05 — exceção de Python

Por decisão do professor (05/11/2026), a P05 usa **Python 3, só biblioteca
padrão**. As demais práticas de SD continuam em C11 e Bash.

Arquitetura adotada: **Plano B** (simulador local por aluno). No LIAC, TCP e
UDP em `127.0.0.1` são bloqueados para alunos (regra D.4 do servidor), mesmo
dentro da própria conta; sockets Unix funcionam. Cada participante é um
processo criado por `os.fork`, e as mensagens são datagramas `AF_UNIX` numa
pasta da rodada dentro de `~/atividades/sd-p05/.p05/` (modo 700). Não há
porta de rede, serviço permanente, `sudo` ou dependência entre alunos.

`p05.py` cria os processos a cada comando e os encerra no fim, inclusive
com Ctrl+C ou tempo limite (25 s por comando, 8 s por participante). O estado
entre comandos (indisponíveis, última mensagem, IDs já recebidos por cada
participante e histórico para `evidencias`) fica em `estado.json` (600). Uma
trava (`flock`) impede duas execuções simultâneas na mesma conta. Limites:
mensagem de até 60 caracteres, até 8 destinatários no custo, histórico de 100
registros.

Distribuição para os alunos: `/srv/material/sd/p05.py` no LIAC (atalho
`~/material/sd/p05.py`). A página tem um Plano B que recria o arquivo por
colagem (here-document).

## Estrutura

- `<atividade>/pagina.modelo.html` — fonte editável da página.
- `<atividade>/index.html` — página gerada (não editar à mão).
- `<atividade>/arquivos/` — programas entregues aos alunos.
- `<atividade>/PROFESSOR.md` — respostas esperadas e mediação (**só local**, no `.gitignore`).

Diretivas do modelo: `@@CMD`, `@@OUT exata|aprox`, `@@SRC`, `@@ENTREGA id | rótulo`
e `@@PENSAR` (detalhes em `construir.py`). Só `@@ENTREGA`, a tabela, a
identificação e as evidências entram no arquivo de entrega.

## Manutenção

```bash
cd sd/atividades
python3 -I construir.py p05-difusao   # gera index.html
python3 -I verificar.py p05-difusao   # executa todos os comandos da página
```

O verificador executa os blocos da página na ordem, numa pasta HOME
temporária, compara as saídas exibidas (as `aprox` ignoram tempos e data),
confere o Plano B, IDs, rótulos e links, e falha se sobrar processo, socket
ou se a pasta privada não estiver em modo 700. Para rodar numa cópia parcial
(por exemplo, no LIAC com a conta de teste), use `--sem-links`.

Ao alterar `p05.py`, atualize as saídas no modelo, regenere e verifique, e
copie a nova versão para `/srv/material/sd/` no servidor.

## Publicação

O workflow `.github/workflows/deploy-pages.yml` copia `sd/atividades` para
`_site/sd/atividades` e remove as ferramentas (`*.py` da raiz, README,
modelos). `arquivos/p05.py` continua publicado para download.
