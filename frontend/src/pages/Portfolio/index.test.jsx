import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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
    render(<Portfolio />);
    fireEvent.click(screen.getByText('upload'));
    fireEvent.click(screen.getByText(/Analyse|Analisar/));
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
});
