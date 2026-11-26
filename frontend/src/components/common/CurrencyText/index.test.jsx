import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrencyText from './index';

describe('CurrencyText', () => {
  it('marks negative values for red text', () => {
    render(<CurrencyText value={-10.5} />);
    expect(screen.getByText(/-R\$ 10,50/)).toHaveAttribute(
      'data-negative',
      'true',
    );
  });

  it('does not mark non-negative values', () => {
    render(<CurrencyText value={10.5} />);
    expect(screen.getByText(/R\$ 10,50/)).toHaveAttribute(
      'data-negative',
      'false',
    );
  });
});
