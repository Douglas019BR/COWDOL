import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { findTranslationKeys, flattenKeys } from './translations';

const srcRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const readLocale = (language) =>
  JSON.parse(
    readFileSync(
      join(srcRoot, 'locales', language, 'translation.json'),
      'utf8',
    ),
  );

function listSourceFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? listSourceFiles(path) : [path];
  });
}

describe('translations', () => {
  it('has the same keys in English and Portuguese', () => {
    const en = flattenKeys(readLocale('en')).sort();
    const pt = flattenKeys(readLocale('pt')).sort();
    expect(pt).toEqual(en);
  });

  it('contains every static translation key used in source files', () => {
    const keys = new Set(flattenKeys(readLocale('en')));
    const used = new Set();
    listSourceFiles(srcRoot)
      .filter((path) => /\.(jsx?|js)$/.test(path) && !/\.test\./.test(path))
      .forEach((path) => {
        const source = readFileSync(path, 'utf8');
        findTranslationKeys(source).forEach((key) => used.add(key));
      });
    expect([...used].filter((key) => !keys.has(key))).toEqual([]);
  });
});

describe('findTranslationKeys', () => {
  it('recognizes both quote styles and surrounding whitespace', () => {
    expect(
      findTranslationKeys(`t('one.key'); t("two.key"); t( 'three.key' );`),
    ).toEqual(['one.key', 'two.key', 'three.key']);
  });
});
