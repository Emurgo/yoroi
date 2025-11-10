import {bech32} from 'bech32'

export const bech32ToHex = (bech: string) => {
  const decoded = bech32.decodeUnsafe(bech, 1000)
  if (!decoded) return undefined
  return Buffer.from(bech32.fromWords(decoded.words)).toString('hex')
}
