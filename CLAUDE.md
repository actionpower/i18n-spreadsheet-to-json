# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@actionpower/i18n-spreadsheet-to-json` — a published npm CLI/library that reads a Google Sheets document via the Sheets v4 REST API and writes per-language i18n JSON files into a `targetDir` (default `./locales`). Consumers configure it via an `i18nconfig.json` at their project root and invoke the `i18n` bin.

## Commands

- `yarn build` — `tsc` emits to `dist/` (the `bin/cli.js` shim imports from `dist/index.mjs`, so the CLI does not work locally until you build).
- `yarn test` — runs Jest with `jest.config.ts` (ts-jest + ESM). Run a single test with `yarn jest -c jest.config.ts -t "<test name>"` or by path.
- `yarn lint` / `yarn lint:fix` — ESLint over `**/*.{js,ts}`.
- After `build`, the CLI is `node bin/cli.js [sheetName|--all]` — no arg processes `customIncludedSheets` (or all sheets if unset), an explicit name overrides the config, and `--all` bypasses the config filter.
- Node `>= 18` is required (uses the built-in `fetch`). `.nvmrc` pins the version.

## Release / CI

- `.github/workflows/pr-check.yml` runs `tsc --noEmit`, `lint`, `test`, `build` against Node 18.x and 20.x for every PR.
- `.github/workflows/main.yml` runs on push to `main`: bumps `package.json` version, pushes the tag, and publishes to npm. **The bump type is read from labels on the most recently merged PR** — `version:major`, `version:minor`, `version:none` (skip publish), otherwise `patch`. Label the PR before merging.

## Architecture

Single-purpose pipeline implemented in `src/index.mts` as `I18nSpreadsheetConverter`. `createI18n(fileName?)` is the exported convenience entry that `bin/cli.js` calls with `process.argv[2]`.

Pipeline (`generateI18nFiles`):
1. `fetchSpreadsheetMetadata` → Sheets `GET /spreadsheets/{id}` to list all sheet titles.
2. `getSelectedSheetTitles` resolves which sheets to process — precedence: explicit `fileName` arg > `--all` sentinel > `customIncludedSheets` from config > all sheets.
3. `buildRangesParams` builds a `values:batchGet` query. Each range is `${title}!A2:${col}`, where `col` is computed from `numberToAlphabet(languages.length + 1)` — column A is the key path, columns B+ are language values in the same order as `config.languages`.
4. For each sheet, `processSheetData` runs `formatRawDataToObject` per locale and writes one JSON file per locale via `createJsonFile` (output is prettier-formatted before `fs.writeFileSync`).

Key conventions baked into `formatRawDataToObject`:
- Column 0 is a **dot-notation key path** fed to `lodash-es/setWith` to build nested objects.
- Rows are processed in **reverse** then `merge`d, so earlier rows in the sheet override later duplicates.
- Rows where the key starts with `//` are treated as comments and skipped; cells with value `_N/A` (`CONSTANTS.NON_VALUE`) are also skipped — both via `shouldSkipKey`.
- A locale's value comes from column index `languages.indexOf(locale) + 1`; missing cells become `""`.

Config loading (`parseConfig`): reads `i18nconfig.json` from the **current working directory** of the consumer. If the file is missing, `isTestEnvironment()` (true when `NODE_ENV=test` or `CI=true`) returns a stub config so tests can run without it; otherwise `handleConfigError()` logs guidance and exits with code 1.

## Source layout

- `src/index.mts` — `I18nSpreadsheetConverter` class + `createI18n` factory.
- `src/constants.mts` — `CONSTANTS` (column index, defaults, base URL) and ANSI-colored `ERROR_MESSAGES`.
- `src/types.mts` — `I18nConfig`, `LocaleData`, and the subset of Sheets API response shapes the code actually uses.
- `src/utils.mts` — config error handling, test-env detection, `numberToAlphabet` (1→A, 2→B, …; only valid for `languages.length + 1 <= 26`), `createApiError`.
- `src/logger.mts` — thin `console.log/error` wrapper with emoji/color prefixes.
- `bin/cli.js` — executable shim that imports `createI18n` from `dist/`.

## Module / TS notes

- The package is ESM-only (`"type": "module"`), source files use the `.mts` extension and import siblings as `.mjs` specifiers. Preserve this when adding files.
- `tsconfig.json` uses `module: NodeNext`, `strict: true`, and a `@/* → src/*` path alias (also wired in `jest.config.ts`).
- `tsconfig.test.json` is a separate `noEmit` config used for type-checking tests (it overrides to `moduleResolution: node` and includes `*.test.ts`); ESLint references both via `parserOptions.project`.
- Jest is configured for ESM (`extensionsToTreatAsEsm: [".ts", ".mts"]`, `useESM: true`) and maps `lodash-es/*` → `lodash/*` so the CJS build is used inside tests.
- `dist/` is committed (it's the published artifact and what `bin/cli.js` consumes); rebuild it when shipping changes to `src/`.
