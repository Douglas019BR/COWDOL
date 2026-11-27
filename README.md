# COWDOL — Plataforma de Gestão de Investimentos

## Visão Geral

COWDOL é uma plataforma open-source de gestão de investimentos focada no mercado brasileiro. Envie um CSV da sua carteira e a aplicação calcula preços, dividendos, lucro/prejuízo, alocação por setor e recomendações, usando dados de mercado em tempo real do Yahoo Finance.

## Funcionalidades

- **Upload de CSV** com validação de colunas, delimitador e linhas inválidas (coluna `SECTOR` opcional)
- **Resultados por ativo**: valor investido, valor atual, dividendos, diferença e saldo
- **Totais da carteira**: total investido, valor atual, dividendos e lucro/prejuízo
- **Alocação por setor** com gráfico de pizza e percentuais
- **Melhores e piores investimentos** (top 5 por taxa de retorno)
- **Simulador de juros** compostos ou simples, com taxa anual ou mensal
- **Recomendação de fundos** baseada em retorno e dividendos (heurística, não é aconselhamento financeiro)
- **Interface EN/PT** responsiva e ticker de moedas
- Valores negativos exibidos em vermelho em toda a interface

## Arquitetura

O projeto é dividido em duas aplicações independentes, sem banco de dados (os cálculos são feitos por requisição a partir do CSV enviado):

- **Backend**: FastAPI + Pydantic, acesso ao Yahoo Finance isolado atrás de um provider com cache limitado e tratamento de rate limit. Python 3.12, `ruff`, `mypy` e `pytest`.
- **Frontend**: Vite + React 18 + MUI + React Router + react-i18next + PapaParse. Vitest e ESLint para testes e lint.

Detalhes e decisões em [ROADMAP.md](./ROADMAP.md). O Yahoo Finance é uma fonte não oficial; o provider centraliza o acesso para permitir troca futura de provedor.

## Primeiros Passos

### Backend

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt        # inclui as dependências de runtime
uvicorn server:app --host 127.0.0.1 --port 8000
```

### Frontend

```sh
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. A API padrão é `http://localhost:8000`.

### Configuração

| Variável | Onde | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | frontend | URL base da API (padrão `http://localhost:8000`) |
| `COWDOL_CORS_ORIGINS` | backend | Origens permitidas, separadas por vírgula |
| `COWDOL_CACHE_TTL_SECONDS` | backend | TTL do cache de cotações/dividendos (padrão `300`) |

## Testes e Qualidade

```sh
# Backend (em backend/)
ruff check . && ruff format --check . && mypy app tests && pytest

# Frontend (em frontend/)
npm run lint && npm test && npm run build

# Repositório
python3 scripts/secret_scan.py
python3 -m unittest scripts/test_secret_scan.py
frontend/node_modules/.bin/cspell --config cspell.json .
```

Os mesmos comandos rodam automaticamente no GitHub Actions em cada push e PR. As versões das dependências Python estão fixadas em `requirements*.txt`; o frontend usa lockfile com versões exatas.

## Estrutura

```
backend/app/          API, modelos, cálculo e provider de market data
backend/tests/        testes unitários e de API
frontend/src/         componentes, páginas, serviços e utilitários
.github/workflows/    CI de backend, frontend e guardrails
scripts/              varredura de segredos e testes da varredura
```

## Contribuindo

1. Crie uma issue descrevendo o trabalho.
2. Crie uma branch `feat-<número da issue>/<descrição>` (ex.: `feat-45/sector-groups`).
3. Faça alterações com testes e evidências de execução.
4. Abra um PR para `main` referenciando a issue; o CodeRabbit revisa automaticamente.

Diretrizes completas em [CONTRIBUTING.md](./CONTRIBUTING.md) e [AGENTS.md](./AGENTS.md).

## Licença

MIT — veja [LICENSE](./LICENSE).

## Contato

douglassermarini@gmail.com ou outro colaborador.
