import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n';

const loadMock = vi.fn().mockResolvedValue({ holdings: [] });
const deleteMock = vi.fn().mockResolvedValue({ deleted: true });

vi.mock('../../services/api', () => ({
  listPortfolios: vi.fn().mockResolvedValue([
    { id: 'abc', name: 'Carteira', created_at: '2026-01-01T00:00:00Z' },
  ]),
  loadPortfolio: (...args) => loadMock(...args),
  deletePortfolio: (...args) => deleteMock(...args),
}));

import SavedPortfolios from './index';

describe('SavedPortfolios', () => {
  it('lists saved portfolios and supports load and delete', async () => {
    render(
      <MemoryRouter>
        <SavedPortfolios />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByText('Carteira')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText('Load'));
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => {
      expect(loadMock).toHaveBeenCalledWith('abc');
      expect(deleteMock).toHaveBeenCalledWith('abc');
    });
  });
});
