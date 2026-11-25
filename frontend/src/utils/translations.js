export function flattenKeys(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') return flattenKeys(value, path);
    return [path];
  });
}

export function findTranslationKeys(source) {
  return [...source.matchAll(/\bt\(\s*(['"])([^'"]+)\1\s*\)/g)].map(
    (match) => match[2],
  );
}
