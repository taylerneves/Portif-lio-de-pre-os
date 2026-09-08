# Portfólio — Site Simples / Normal / Premium

Projeto React + Vite + TypeScript com:

- **Tailwind CSS v4** para estilos
- **Framer Motion** — expand das caixas ao passar o mouse e a galeria de sites
- **GSAP** — multidão de pessoas andando no fundo (`src/components/CrowdField.tsx`)
- **react-peeps** — personagens reais da biblioteca **Open Peeps** (Pablo Stanley, licença CC0) renderizados como SVG
- **Lenis** — scroll suave dentro da galeria de sites (sticky scroll)

## Rodar localmente

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (geralmente http://localhost:5173).

## Build de produção

```bash
npm run build
npm run preview
```

## O que trocar antes de publicar

1. **`src/App.tsx`**
   - `WHATSAPP_NUMBER`: seu número com DDI + DDD, só dígitos (ex: `5511999999999`).
   - Array `TIERS`: nome, descrição, cor, `stopPercent` (fração da multidão que para) e a lista `sites` (nome, `url` real do site, `img` do print) de cada plano.
   - Nome no cabeçalho (`Seu Nome — Sites`).

2. **`src/components/CrowdField.tsx`**
   - `count`: quantas pessoas aparecem (padrão 56). Mais gente = visual mais denso, porém mais elementos SVG animados.
   - Arrays `BODIES`, `HAIRS`, `FACES`, `FACIAL_HAIR`, `ACCESSORIES`: controlam a variedade de poses/cabelos/rostos sorteados. A lista completa de opções está em `node_modules/react-peeps/lib/peeps/*/z_options.d.ts`.

## Como a lógica de negócio funciona

- **`CrowdField.tsx`**: cada pessoa é um componente `<Peep />` real do Open Peeps (pose
  "andando"), posicionado com `position: absolute` e animado via GSAP (`x`/`y` no próprio
  elemento, sem canvas). Cada peep tem um número fixo (`attentionRank`, sorteado uma vez).
  Quando o mouse passa por uma caixa, chamamos
  `crowdRef.current.setAttention(percentual, x_do_centro_da_caixa, cor)`; quem tem
  `attentionRank < percentual` pausa a caminhada, vira o rosto (flip horizontal) na direção
  da caixa e ganha um brilho na cor do plano. Por isso quem para no Simples (30%) sempre é
  um subconjunto de quem para no Normal (68%), que por sua vez é subconjunto do Premium
  (100% — todo mundo para). Os demais continuam andando normalmente, alguns indo e outros
  voltando (direção sorteada a cada travessia).

- **`PricingBoxes.tsx`**: adaptação horizontal do `HoverExpand_002` (Skiper53). Ao passar
  o mouse, a caixa cresce (`flexGrow` animado via Framer Motion), as outras encolhem, e a
  descrição aparece. Dispara `onHoverTier` com o centro X da caixa em pixels — é esse valor
  que o `CrowdField` usa para saber para onde a multidão deve olhar.

- **`StickyGallery.tsx`**: adaptação do `StickyCard_003` (Skiper34) para um overlay de
  tela cheia com scroll suave via Lenis. Cada card é `position: sticky` e vai escalando/
  escurecendo conforme o próximo sobe por cima — igual ao efeito original, só que sem
  depender do scroll da página inteira. Clicar na imagem abre o site em nova aba. O botão
  "Quero esse" no canto monta um link `wa.me` com o nome do plano e do site que está
  visível no momento.

## Nota sobre performance

O pacote `react-peeps` inclui todas as combinações possíveis de cabelo/rosto/roupa no
bundle, então o JS final fica maior (~2,4 MB antes de gzip, ~970 KB gzipado). Para reduzir
isso mais pra frente dá pra: (1) importar só os componentes específicos usados em vez de
sortear entre muitas opções, ou (2) usar `React.lazy`/`import()` dinâmico por peça.
