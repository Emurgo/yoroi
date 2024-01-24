/**
 * Perform a division that rounds up the result to the nearest integer.
 *
 * @param dividend - The number to be divided.
 * @param divisor - The number by which division is to be performed.
 *
 * @returns The rounded-up result of the division, or 0 if either dividend or divisor is 0.
 */
export const ceilDivision = (dividend: bigint, divisor: bigint): bigint => {
  if (dividend <= 0n || divisor <= 0n) return 0n
  const adjustedDivisor = divisor - 1n

  return (dividend + adjustedDivisor) / divisor
}
