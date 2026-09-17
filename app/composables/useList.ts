/**
 * Reads arrays from the locale files. `tm()` returns compiled message nodes in
 * production, so it is only used for the length; the text itself goes through `t()`.
 */
export function useList() {
  const { t, tm } = useI18n()
  // Available to every list item, so copy can say {price} without hardcoding it.
  const params = { price: useAppConfig().price }

  const count = (key: string) => {
    const value = tm(key) as unknown
    return Array.isArray(value) ? value.length : 0
  }

  const strings = (key: string) => Array.from({ length: count(key) }, (_, i) => t(`${key}[${i}]`, params))

  const objects = <K extends string>(key: string, fields: K[]) =>
    Array.from(
      { length: count(key) },
      (_, i) => Object.fromEntries(fields.map((f) => [f, t(`${key}[${i}].${f}`, params)])) as Record<K, string>,
    )

  return { strings, objects }
}
