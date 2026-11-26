[![make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/jehan771/best-national-statistics-site-20261126-0539/rank.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/jehan771/best-national-statistics-site-20261126-0539/reward.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)

# Indonesia in Numbers

A national statistics site for Indonesia — population, economy, labour,
poverty and wellbeing — built for the
[make.fun competition](https://make.fun/c/best-national-statistics-site-20261126-0539).

## The site

Six hash-routed pages, all working offline from static files:

- **Dashboard** — headline indicators, population and GDP-growth charts
  (bar/line toggle), five largest provinces, latest releases.
- **Population** — 2015–2024 population series, age structure, and a
  searchable, sortable table of the 10 largest provinces.
- **Economy** — GDP, growth, sector mix (by sector / by spending toggle),
  biggest industries, inflation, and trade.
- **Labour & Poverty** — unemployment, formal vs informal work, and the
  poverty series 2018–2024 with a year-range toggle.
- **Society** — Human Development Index, life expectancy, schooling.
- **Methodology** — every source, and how to read the numbers.

Charts are hand-drawn SVG from the figures in `app/data.js`. No libraries,
no trackers, no network requests — the site works from `file://` or any
static server.

## Real figures, named sources

Every number was verified against its source on 26 November 2026:

- **World Bank, World Development Indicators** — population 2015–2024
  (283,487,931 in 2024), GDP $1,396.3bn, GDP per capita $4,925, real GDP
  growth 2015–2024.
- **BPS-Statistics Indonesia** — unemployment 4.76% (Sakernas, Feb 2025),
  poverty 8.57% (Sep 2024), HDI 75.02 (2024), CPI inflation 1.57% (Dec 2024).
- **Destatis** — sector shares of gross value added 2024.
- **EIU via Asian Exim Banks** — goods trade 2024 ($264.7bn exports,
  $233.7bn imports).

Where sources disagree (e.g. BPS vs World Bank life expectancy), the site
shows the figure with its source and explains the difference.

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
`vendor/makefun-frontend.ts` library.

## Layout

```
main.ts                  hand-in program
serve.ts                 local static server (dev convenience)
vendor/makefun-frontend.ts  kit library, unchanged
app/
  index.html             shell: header, nav, footer
  style.css              design system
  data.js                the verified dataset
  main.js                router, pages, SVG charts, table controls
screenshots/            4 real renders of the site (1 cover + 3 pages,
                         incl. one 390×844 phone view)
shots.json               which view each screenshot shows
LICENSE                  MIT
```

## License

MIT — see [LICENSE](LICENSE).
