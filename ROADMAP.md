# COWDOL Rewrite Roadmap

> **Status: delivered.** All ten features below were implemented, reviewed with CodeRabbit and merged into `main` through PRs #23-#48. Quality guardrails (exact pins, cspell, secret scan and CI) are described in [README.md](./README.md). Sector grouping now uses a pie chart.

## Context

COWDOL is an open-source Brazilian investment-management platform created several years ago. The current codebase is a single-page app:

- **Backend**: FastAPI with two routes (`/hello-world`, `/profit-calculate`), live data from Yahoo Finance via `yfinance`, no database, no persistence, no request validation, no automated tests and no CI.
- **Frontend**: React 18 (Create React App), MUI, React Router, PapaParse, i18n, a currency ticker, and one functional page (CSV upload -> portfolio table).
- **State**: the roadmap items in `README.md` are still open; the repository has dead scaffolding, a stale failing CRA test, a crashing `/hello` route and a pinned `yfinance==0.2.57` from 2024.

The decision is to **rebuild from zero** with the same technologies, a maintained build tool, and one independently reviewable PR per feature.

## Yahoo Finance spike (completed 2026-11-20)

`yfinance==1.8.0` was installed in an isolated virtualenv and exercised against real tickers from `backend/input.csv`:

| Symbol | Last close (BRL) | Dividend records |
| --- | --- | --- |
| BBSE3.sa | 36.99 | 29 (last 2026-08-07) |
| PETR4.sa | 42.67 | 62 (last 2026-08-24) |
| TAEE11.sa | 40.17 | 61 (last 2026-11-17) |
| NIKE34.sa | 101.10 | 59 (last 2026-09-01) |

`.info` for BBSE3.sa returned `currency=BRL`, `exchange=SAO`. All calls completed in under 2 seconds, with no API key and no HTTP 429.

**Conclusion:** yfinance is still free and usable for this project. It is unofficial, intended for personal use, and has no published rate limits or SLA. The rewrite must centralize all Yahoo access in one service module, keep call volume low, cache results, and handle `YFRateLimitError` explicitly so a provider switch is a one-file change.

## Target architecture

### Backend
- FastAPI (latest stable), Python 3.12.
- `ruff` for lint and format, `mypy` for type checking, `pytest` for unit tests.
- Explicit Pydantic request/response models; no raw `dict` bodies.
- Market-data access isolated behind a provider interface; yfinance is the default implementation.
- No database in v1; data is computed per request from the uploaded CSV and cached in memory.
- `zoneinfo` replaces the undeclared `pytz` dependency.

### Frontend
- Vite + React 18 + MUI + React Router + react-i18next + PapaParse.
- Vitest + ESLint for tests and static checks.
- Environment-configurable API base URL (no hardcoded `localhost:8000`).
- Responsive layout with EN/PT translations shipped locally.

### Compatibility contract
The new app keeps the existing CSV headers (`SYMBOL;AMOUNT;PURCHASE_DATE;PURCHASE_VALUE`, dates `DD/MM/YYYY`) and the existing per-asset result fields (`symbol`, `amount`, `current_value`, `purchase_total`, `value_difference`, `total_dividends`, `balance`) so existing portfolios keep working.

## Delivery process

1. One GitHub issue per feature (existing open issues are reused where they match: #10 calculator, #14 tests, #21 i18n).
2. One branch per feature following `feat-<issue>/<description>` (see `CONTRIBUTING.md`).
3. One PR per feature targeting `main`, linked to its issue, opened for review.
4. Each PR includes unit tests, evidence (test/lint/typecheck output), and passes deterministic checks before review:
   - Backend: `ruff check`, `ruff format --check`, `mypy`, `pytest`.
   - Frontend: `eslint`, `vitest run`, `vite build`.
5. PRs are based on `main` after the previous PR merges; if several need to stay open at once, they are stacked and retargeted.
6. Implementation and review are separate cycles; a different model reviews each PR before it is considered complete.

## Feature backlog

### Phase 0 - Foundations

**F1 - Backend foundation** (issue #14)
Fresh FastAPI app with Pydantic models, health endpoint, provider interface with yfinance implementation, `ruff`/`mypy`/`pytest` configuration and a CI workflow.
*Acceptance:* `ruff check`, `ruff format --check`, `mypy` and `pytest` all pass; health endpoint returns 200; a mocked provider test verifies the contract.

**F2 - Frontend foundation** (new issue)
Vite + React + MUI + Router scaffold, Vitest + ESLint, base layout, theme, API client reading `VITE_API_URL`.
*Acceptance:* `eslint`, `vitest run` and `vite build` pass; smoke test renders the layout.

### Phase 1 - Core portfolio

**F3 - Robust CSV upload and parsing** (new issue)
Header validation (case-insensitive), delimiter detection, parse errors, file type/size checks, clear error messages, typed API client with HTTP status handling.
*Acceptance:* unit tests cover valid CSV, wrong headers, empty file and malformed rows; error states render in the UI.

**F4 - Live market data and per-asset profit/loss** (new issue)
Current price, dividends since purchase, per-asset totals with caching and rate-limit handling.
*Acceptance:* mocked yfinance tests verify price, dividend filtering and error handling; recalculation matches the legacy `input.csv` contract.

**F5 - Portfolio totals** (new issue)
Total invested, current value, total dividends and total profit/loss summary, with EN/PT labels.
*Acceptance:* unit tests for aggregation including empty portfolio and mixed profit/loss; summary visible in UI.

**F6 - Top 5 best and worst investments** (new issue)
Rank assets by return, show best/worst five with percentages.
*Acceptance:* unit tests for ranking, ties and fewer than five assets; UI section renders both lists.

### Phase 2 - Enhancements

**F7 - Compound-interest simulator** (issue #10)
Simulate monthly contributions, rate and period with a results table/chart.
*Acceptance:* unit tests for known values and edge cases; interactive UI with EN/PT labels.

**F8 - Fund recommendation engine** (new issue)
Data-driven fund recommendations from a documented, testable rule set over available indicators.
*Acceptance:* unit tests for ranking rules and empty data; recommendations render with explanation.

**F9 - EN/PT i18n and responsive layout** (issue #21)
Complete translations, language switcher, responsive layout for phone and desktop.
*Acceptance:* no untranslated keys in either locale; layout verified at mobile and desktop widths.

**F10 - Currency ticker** (new issue)
Header ticker for currency pairs against BRL with graceful failure when the external API is unavailable.
*Acceptance:* mocked fetch tests for success and failure; ticker degrades without breaking the page.

## Risks

- **Yahoo Finance is unofficial**: no SLA, possible 429s and breaking endpoint changes. Mitigated by the provider interface, caching and explicit rate-limit handling. Fallback providers to evaluate if it becomes unreliable: brapi, Finnhub or Alpha Vantage.
- **CRA to Vite migration**: existing i18n WIP on `feat-21/internationalization` was committed locally and will be ported into the new scaffold in F9.
- **Data correctness**: Brazilian tickers, BRL currency and `DD/MM/YYYY` dates must stay consistent with the legacy CSV format.

## Out of scope for v1

- Authentication, user accounts and server-side persistence.
- Paid market-data providers.
- Containers/deployment pipelines beyond the CI checks described above.
