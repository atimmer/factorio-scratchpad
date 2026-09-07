# Factorio Scratchpad

A small spreadsheet-like scratchpad for working through Factorio recipe ratios.
Write notes on the left; the right reproduces your text and evaluates lines ending
in `=`. Notes automatically save in this browser, and can be downloaded as text.

- Live site: https://atimmer.github.io/factorio-scratchpad/
- Repository: https://github.com/atimmer/factorio-scratchpad

## Usage

```text
Coal liquefaction, no modules
refineries = 10 =
cycles = refineries / 5 =
heavy = (90 - 25) * cycles =
heavy_plants = heavy / (40 / 2) =
ceil(heavy_plants) =
```

Define values using `name = expression =`, then reference them on later lines.
Names are case-sensitive and contain letters, digits, or underscores (not a leading
digit). Every calculation needs the final equals sign. Lines without it are notes.
Calculations run top to bottom; forward references show a helpful error.

Supports `+`, `-`, `*`, `/`, `^`, parentheses, decimal/scientific notation, postfix
percent (`20%` means `0.2`), and `ceil`, `floor`, `round`, `abs`, `sqrt`, `min`, `max`.
Exponentiation associates right and precedes unary minus. Results display up to
10 significant digits; intermediate calculations use JavaScript number precision.
Invalid formulas show inline errors without stopping other lines. Optional units go in brackets after a variable name: `coal [items/s] = 20 =`
displays `20 items/s`. Reference the number as `coal` in later formulas. Labels
are arbitrary text (for example `heavy oil/s` or `MW`) and only annotate that
declaration’s result; they do not affect arithmetic, convert units, or propagate
to other expressions. No automatic recipe solving or unit conversion.

The starter example uses standard coal liquefaction and cracking with crafting
speed 1, no modules/beacons/productivity, and recycles 25 heavy oil per cycle.
Recipe source: [Factorio Wiki — oil processing](https://wiki.factorio.com/Oil_processing).
Change the notes to model your own setup, speeds, and productivity.

## Local setup

Requires Node.js 24 and npm. Run `npm ci`, `npm test`, and `npm run build`.
The production output is `dist/`. Manage any local development server through
Anton's `devservers` CLI; the `dev` script runs Vite.

React + strict TypeScript + Vite, with a small arithmetic parser and no backend.
`src/calculator.ts` owns evaluation, `src/example.ts` owns the starter notes,
`src/main.tsx` owns the UI/storage/download, and `src/style.css` owns styling.
The UI preserves two columns on small screens; each pane scrolls horizontally
when lines are wide. Fonts load from Google Fonts with system fallbacks.

Notes use localStorage key `factorio-scratchpad.notes.v1`; they do not sync across
browsers or devices. Empty notes remain empty on reload. If browser storage is
unavailable, the page still works and prompts you to download notes. Clearing
browser data deletes saved notes. Download a text copy for backup.

## Repository and deployment

Initialized with Jujutsu (`jj git init`). `main` is the deployment bookmark.
The public GitHub repository is `atimmer/factorio-scratchpad`. GitHub Pages uses
GitHub Actions: `.github/workflows/deploy.yml` installs locked dependencies, runs
calculator tests and the TypeScript/production build, then deploys `dist/` on main.
Pull requests run checks without deployment. Vite's base is `/factorio-scratchpad/`.
This follows [Vite's GitHub Pages guidance](https://vite.dev/guide/static-deploy#github-pages).
Project-specific agent instructions are in `AGENTS.md`.
