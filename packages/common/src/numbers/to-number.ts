export function toNumber(input: unknown) {
  const parsed = Number(input)
  return isNaN(parsed) ? 0 : parsed
}
