# Design System — Turistando SP

Fonte de verdade: `packages/core/src/design/tokens.ts` (TS) espelhado em
`apps/web/app/globals.css` (CSS custom properties). Trocar um token muda o site inteiro.

## Conceito

Papel · concreto paulistano · sinalização urbana · placas de rua · coordenadas · grids ·
brutalismo editorial. Mesmo sem o logo, uma screenshot deve pertencer ao projeto.
Referências: arquitetura modernista/brutalista paulistana, mapas, fichas urbanas.

## Paleta

| Token | Claro | Papel |
|------|-------|------|
| `--bg` | `#F2EDE3` | papel / off-white |
| `--surface` | `#FBF8F1` | superfície elevada |
| `--text` | `#191512` | preto urbano |
| `--text-muted` | `#5C554A` | concreto |
| `--border` | `#D9D2C2` | linha |
| `--accent` | `#F4B400` | **amarelo de sinalização** (accent) |
| `--terracotta` | `#C24A2C` | vermelho/terracota (identidade, pontual) |
| `--green` | `#3E6B4B` | verde urbano (pontual) |
| `--band` | `#17130E` | preto profundo (faixas escuras / footer) |

Semânticos: `--success` (verde), `--warning` (âmbar), `--error` (terracota).
**Dark mode** completo (`[data-theme='dark']`), preservando a identidade; preferência
salva em `localStorage` e respeita `prefers-color-scheme`. Contraste alvo: **WCAG AA+**.

## Tipografia (3 papéis)

- **Display** — `Anton` (condensada, pesada): manchetes gigantes. `--font-display`.
- **Heading** — `Archivo` (grotesca forte): títulos de seção. `--font-heading`.
- **Body** — `Inter` (legível): leitura longa. `--font-body`.
- **Mono** — `Space Mono`: ficha urbana — `EXP.042`, `23°32'52"S`, `R$ 32,00`, `2H40`,
  datas e rótulos. Usada com parcimônia. `--font-mono`.

Escala fluida (`clamp`) de `hero` a `label` em `typography.scale`.

## Componentes de marca (`components/brand`)

| Componente | Uso |
|-----------|-----|
| `UrbanLabel` | rótulo mono com "tick" amarelo (`■ TURISTANDO SP 001`) |
| `ExplorationNumber` | `EXP.042` com ponto terracota |
| `Coordinates` | `23°32'52"S 46°38'09"W` |
| `Rating` | estrelas 1–5 (accent) |
| `TransportBadge` | ícone + rótulo (metrô, trem, ônibus, carro, bike, a pé) |
| `Tag` | etiqueta mono com borda |
| `Stamp` | selo "Visitado" / "Favorito" (rotacionado) |
| `Photo` | foto real **ou** placeholder urbano gerado (silhueta + grid + coordenadas) |

Ícones: traço geométrico em `components/brand/Icons.tsx` — **sem emoji**.

## Layout & componentes

`container` / `container-wide` (max 1280/1480), `--gutter` fluido, `section`/`band`.
Cards: `exp-card`, `place-card`, `mini-card`, `NeighborhoodCard`, `CategoryCard`.
Ficha urbana (`.ficha`), callouts de artigo (`tip`/`info`/`warning`), `costs`, `quote`,
`gallery`. Bordas quase retas (`--radius: 3px`), sombras duras pontuais — nada de
glassmorphism, gradientes aleatórios ou cantos muito arredondados.

## Renderer de artigo

`components/feature/ArticleRenderer.tsx` transforma `ArticleBlock[]` em UI:
`paragraph · heading · image · gallery · quote · tip · info · warning · map · costs ·
transport · separator · relatedPlaces`. É o mesmo formato que o editor de blocos do painel
produzirá.

## Responsividade & a11y

Mobile-first (360→1920). Bottom-nav no mobile. `:focus-visible` visível, alvos ≥ 40px,
`alt` em toda imagem, navegação por teclado, `prefers-reduced-motion` respeitado.
