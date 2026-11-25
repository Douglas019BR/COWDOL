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

  it('renders sub-cent quotes without losing precision', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ USDBRL: { bid: '0.0035', pctChange: '0' } }),
      }),
    );
    render(<CurrencyTicker />);
    await waitFor(() =>
      expect(screen.getByText('0.0035')).toBeInTheDocument(),
    );
  });

  it('ignores a stale refresh response that resolves after a newer one', async () => {
    const pending = [];
    const intervals = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise((resolve) => pending.push(resolve))),
    );
    vi.stubGlobal('setInterval', vi.fn((callback) => intervals.push(callback)));
    vi.stubGlobal('clearInterval', vi.fn());

    render(<CurrencyTicker />);
    await waitFor(() => expect(pending).toHaveLength(1));
    intervals[0]();
    await waitFor(() => expect(pending).toHaveLength(2));

    const response = (value) => ({
      ok: true,
      json: async () => ({ USDBRL: { bid: value, pctChange: '0' } }),
    });
    pending[1](response('2.00'));
    await waitFor(() => expect(screen.getByText('2.00')).toBeInTheDocument());
    pending[0](response('1.00'));
    await waitFor(() => expect(screen.queryByText('1.00')).not.toBeInTheDocument());
  });

  it('renders nothing when the external API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { container } = render(<CurrencyTicker />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
