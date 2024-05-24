export function replacer(_: unknown, value: unknown) {
  return typeof value === 'bigint' ? value.toString() : value
}
