# Arquitetura ou Organização?

Aula interativa em formato web sobre **Arquitetura × Organização de
Computadores**, construída a partir da investigação de placas-mãe reais do
laboratório (Gateway MBDPCI016AAWW, ASUS SP97-XV, ASUS P4V800-X, ASUS K8V-MX
e PCWare IPX1800G1 — 5 gerações, de ~1994 a ~2014).

Não é uma conversão de slides: é uma experiência de scroll narrativo com
hotspots interativos sobre fotos/diagramas reais dos manuais, comparações
entre gerações, desafios de classificação em três níveis de dificuldade e um
modo de investigação para o aluno praticar antes de ir ao laboratório.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de produção em dist/
npm run preview  # servir o build localmente
```

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Radix UI
(primitivos no padrão shadcn/ui) · lucide-react.

## Estrutura

- `src/data/` — especificações das placas, hotspots, citações conceituais e
  desafios, todos com a fonte (manual/página) de cada informação.
- `src/components/lesson/` — seções da narrativa (conceito, método, níveis
  de dificuldade, síntese...).
- `src/components/hardware/` — galeria, explorador com hotspots, timeline e
  comparações entre placas.
- `src/components/investigation/` — modo investigação (missões).
- `src/context/` — progresso da aula (persistido em `localStorage`) e modo
  apresentação.

Nenhuma especificação técnica foi inventada — todas remetem a um manual ou
ficha de produto real.
