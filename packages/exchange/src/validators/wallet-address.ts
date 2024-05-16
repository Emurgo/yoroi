export function isPossibleCardanoAddress(address: string) {
  const shelleyRegex = /^(addr1)[0-9a-z]+$/
  return shelleyRegex.test(address)
}
