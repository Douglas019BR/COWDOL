import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import CurrencyTicker from './index';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CurrencyTicker', () => {
  it('renders fetched quotes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ USDBRL: { bid: '5.12', pctChange: '0.5' } }),
      }),
    );
    render(<CurrencyTicker />);
    await waitFor(() =>
      expect(screen.getByText('USD/BRL')).toBeInTheDocument(),
    );
  });

  it('renders nothing when the external API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { container } = render(<CurrencyTicker />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
