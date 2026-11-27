import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n';
import RiskSection from './index';

describe('RiskSection', () => {
  it('shows risk metrics and colours a negative drawdown red', () => {
    render(
      <RiskSection
        risk={{
          volatility: 0.25,
          max_drawdown: -0.12,
          diversification: 0.5,
          coverage: 1.0,
          assets: [
            {
              symbol: 'PETR4.sa',
              volatility: 0.25,
              max_drawdown: -0.12,
            },
          ],
        }}
      />,
    );
    expect(screen.getAllByText('25.00%')[0]).toBeInTheDocument();
    expect(screen.getAllByText('-12.00%')[0]).toHaveClass('MuiTypography-h6');
  });

  it('warns when coverage is incomplete', () => {
    render(
      <RiskSection
        risk={{
          volatility: 0.2,
          max_drawdown: -0.1,
          diversification: 0.5,
          coverage: 0.4,
          assets: [],
        }}
      />,
    );
    expect(screen.getByText(/Partial coverage/i)).toBeInTheDocument();
  });

  it('renders nothing without data', () => {
    const { container } = render(<RiskSection />);
    expect(container).toBeEmptyDOMElement();
  });
});
