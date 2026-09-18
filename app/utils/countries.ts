/**
 * A country in the reader's own language, from the browser's own data, so country names need
 * no translation of ours. Used by the legal notice for the operator's country.
 */
export function countryName(code: string, locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) || code
  } catch {
    return code
  }
}
