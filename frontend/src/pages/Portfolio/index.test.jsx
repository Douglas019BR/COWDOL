import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n';

const resolvers = [];

vi.mock('../../services/api', () => ({
  calculateProfit: vi.fn(
    () =>
      new Promise((resolve) => {
        resolvers.push(resolve);
      }),
  ),
}));

vi.mock('../../components/PortfolioUpload', () => ({
  default: ({ onParsed }) => (
    <button
      onClick={() =>
        onParsed({ holdings: [{ symbol: 'TEST3.sa' }], errors: [] })
      }
    >
      upload
    </button>
  ),
}));

import Portfolio from './index';

describe('Portfolio', () => {
  it('ignores results from an analysis superseded by a new file', async () => {
    render(
      <MemoryRouter>
        <Portfolio />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('upload'));
    fireEvent.click(screen.getByText(/Analyse portfolio|Analisar carteira/));
    fireEvent.click(screen.getByText('upload'));

    resolvers[0]({
      holdings: [
        {
          symbol: 'STALE',
          amount: 1,
          purchase_total: 10,
          current_value: 12,
          value_difference: 2,
          total_dividends: 0,
          balance: 2,
          currency: 'BRL',
        },
      ],
    });

    await waitFor(() => expect(resolvers).toHaveLength(1));
    expect(screen.queryByText('STALE')).not.toBeInTheDocument();
  });

  it('shows allocation when every market-data lookup fails', async () => {
    render(
      <MemoryRouter>
        <Portfolio />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('upload'));
    fireEvent.click(screen.getByText(/Analyse portfolio|Analisar carteira/));
    resolvers.at(-1)({
      holdings: [
        {
          symbol: 'FAIL',
          amount: 1,
          purchase_total: 100,
          current_value: 0,
          value_difference: 0,
          total_dividends: 0,
          balance: 0,
          currency: 'BRL',
          sector: 'energy',
          error: 'lookup failed',
        },
      ],
    });
    await waitFor(() =>
      expect(screen.getByText(/Allocation by sector/i)).toBeInTheDocument(),
    );
  });
});
