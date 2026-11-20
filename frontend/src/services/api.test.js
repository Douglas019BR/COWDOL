import { afterEach, describe, expect, it, vi } from 'vitest';
import { calculateProfit } from './api';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('calculateProfit', () => {
  it('posts holdings and returns the parsed response', async () => {
    const body = { holdings: [] };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => body,
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(calculateProfit([{ symbol: 'BBSE3.sa' }])).resolves.toEqual(body);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  });

  it('throws on a non-ok HTTP response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    await expect(calculateProfit([])).rejects.toThrow('status 500');
  });
});
