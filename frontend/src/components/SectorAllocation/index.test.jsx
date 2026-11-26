import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n';
import SectorAllocation from './index';

describe('SectorAllocation', () => {
  it('groups holdings and labels partial data', () => {
    render(
      <SectorAllocation
        holdings={[
          {
            sector: 'energy',
            purchase_total: 100,
            current_value: 110,
            total_dividends: 0,
            balance: 10,
          },
          {
            sector: 'financial',
            purchase_total: 900,
            current_value: 0,
            total_dividends: 0,
            balance: 0,
          },
        ]}
        partial
      />,
    );
    expect(screen.getByText(/Allocation by sector/i)).toBeInTheDocument();
    expect(screen.getByText(/Partial:/i)).toBeInTheDocument();
    expect(screen.getByText(/10.0%/)).toBeInTheDocument();
    expect(screen.getByText(/90.0%/)).toBeInTheDocument();
  });
});
