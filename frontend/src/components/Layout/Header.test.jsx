import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n';
import Header from './Header';

describe('Header language switcher', () => {
  it('switches the interface to Portuguese', () => {
    render(<Header />);
    fireEvent.click(screen.getByText('PT'));
    expect(screen.getByText(/plataforma de gestão/i)).toBeInTheDocument();
  });
});
