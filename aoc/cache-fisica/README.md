# Cache física — AOC, unidade 4

Publicação estática no site da disciplina: https://juvsnt.github.io/aulas/aoc/cache-fisica/. Duas atividades individuais de até 30 minutos, com linguagem simples e programas em C11/Bash executados no Terminal Linux do LIAC.

## Funcionamento definido pelo professor

- Os programas e resultados ficam na pasta individual `~/atividades/aoc-cache-fisica` no LIAC.
- Respostas e etapa atual são salvas automaticamente no navegador, como nas práticas anteriores. A retomada automática depende do mesmo navegador/perfil e da preservação dos dados locais; não há sincronização entre aparelhos.
- O botão “Baixar respostas (.txt)” guarda uma cópia no aparelho em que a página está aberta, inclusive antes de terminar a atividade.
- Na última etapa, o aluno revisa e prepara os comandos para gravar `entrega-matriz.txt` ou `entrega-cadeia.txt` na sua pasta do LIAC. Ele precisa colar e executar o bloco no terminal. A página não transfere o arquivo por conta própria.
- A entrega segue somente o procedimento já utilizado no LIAC. O professor avalia exclusivamente o arquivo final indicado, não os arquivos de trabalho nem respostas em elaboração.
- Não há serviço de entrega adicional, banco de dados, contas próprias da página, área docente de recebimento, protocolo de envio ou dependência de infraestrutura externa. A seção “Seu trabalho fica com você até o envio” foi retirada por solicitação do professor.

## Atividades e arquivos

1. **Linhas ou colunas?** Comparação de matrizes 1024 e 512, com leitura por linhas e por colunas, medianas, conferência das somas e análise de localidade espacial.
2. **Perto ou longe?** Cadeia de acessos dependentes de 8 a 16384 KiB em ordem crescente e decrescente, com discussão da capacidade limitada da cache e das interferências.

| Arquivo/pasta | Finalidade |
| --- | --- |
| `index.html` | Entrada estática que abre `public/`, preservando o cartão local da disciplina. |
| `public/index.html` | Roteiro do aluno e campos com salvamento automático no navegador. |
| `docente-local/professor.html` | Guia exclusivo do professor, mantido somente localmente, fora da pasta pública e ignorado pelo Git. |
| `public/app.js` | Respostas e etapa no localStorage; revisão, download e preparação do arquivo final. |
| `public/relatorio.js` | Geração dos comandos de colagem para o arquivo final, com delimitador protegido. |
| `public/arquivos/` | Fonte C, diagnóstico somente de leitura e ZIP. |
| `construir.py` | Gera os comandos copiáveis e o ZIP a partir dos mesmos fontes. |
| `verificar.py` | Testa os programas C e a gravação do arquivo final por colagem no Bash. |
| `verificar_navegador.py` e `verificar-navegador.cjs` | Conferência docente da página estática com navegador automatizado. |

Python e Playwright são ferramentas de manutenção/teste do professor, sem uso pelos alunos no LIAC. O servidor HTTP usado na prévia só serve arquivos estáticos: não recebe respostas nem faz entregas.

## Abrir localmente

Na raiz do repositório:

```bash
python3 aoc/cache-fisica/construir.py
python3 -m http.server 8000 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:8000/aoc/cache-fisica/`. Não é necessário criar contas. O cartão preparado em `aoc/index.html` também abre esse caminho. O estilo da página principal de AOC fica em `pages/disciplinas.css` no repositório e é copiado para a raiz na publicação existente; a página de práticas tem seu próprio CSS.

## Verificar

```bash
python3 aoc/cache-fisica/verificar.py
node --check aoc/cache-fisica/public/app.js
node --check aoc/cache-fisica/public/relatorio.js
```

Para verificar no navegador com as ferramentas já baixadas nesta máquina:

```bash
python3 aoc/cache-fisica/verificar_navegador.py --playwright /tmp/aoc-cache-qa/node_modules/playwright --browsers /tmp/aoc-cache-qa/browsers --bibliotecas /tmp/aoc-cache-qa/libs/usr/lib/x86_64-linux-gnu
```

Em outro ambiente, ajustar os caminhos. A opção `--bibliotecas` só é necessária para bibliotecas extraídas localmente. Os testes HTTP de prévia usam apenas loopback; não há autenticação ou API. O relatório e as capturas em `revisao/` são registros locais, ignorados pelo Git.

## Limites e preparação para a aula

As medições acontecem de verdade, sem simulação de hits/misses. O tempo inclui o laço e o cálculo dos endereços. As leituras volatile preservam a ordem para a comparação didática e não representam código vetorizado. O resultado não identifica com exatidão as fronteiras L1/L2/L3. Os programas usam um processo e no máximo cerca de 17 MiB de dados, sem instalações, sudo, rede externa no terminal ou mudanças de configuração. Contadores perf não são requisitos.

Ainda é preciso conferir a colagem e os quatro comandos na conta estudantil autorizada do LIAC, testar aparelho físico e cronometrar uma aula piloto. Nenhum acesso ao LIAC foi feito nesta implementação. O arquivo final no LIAC é editável; a avaliação exclusivamente da entrega final é orientação docente, sem mecanismo novo de bloqueio ou recebimento.

A publicação copia somente `index.html` e `public/`, mantendo essa estrutura em `aoc/cache-fisica/`. Nunca copiar `docente-local/`, ferramentas ou registros de testes. O Guia Docente não deve ser publicado nem incluído em commits. O workflow de GitHub Pages inclui explicitamente somente a entrada e a pasta pública desta atividade.
