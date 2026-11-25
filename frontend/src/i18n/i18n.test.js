import { describe, expect, it } from 'vitest';
import i18n from './index';

describe('document language', () => {
  it('follows the active translation language', async () => {
    await i18n.changeLanguage('pt');
    expect(document.documentElement.lang).toBe('pt');
    await i18n.changeLanguage('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
