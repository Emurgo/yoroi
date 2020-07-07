// @flow
import blake2b from 'blake2b'
import crc32 from 'buffer-crc32'

export type WalletChecksum = {
  ImagePart: string,
  TextPart: string,
}

export function legacyWalletChecksum(
  publicKeyHash: string /* note: lowercase hex representation */,
): WalletChecksum {
  // ImagePart
  const output = new Uint8Array(64)
  const input = Buffer.from(publicKeyHash)
  const ImagePart = blake2b(output.length)
    .update(input)
    .digest('hex')

  // TextPart
  const [a, b, c, d] = crc32(ImagePart)
  const alpha = 'ABCDEJHKLNOPSTXZ'
  const letters = (x: number): string =>
    `${alpha[Math.floor(x / 16)]}${alpha[x % 16]}`
  // eslint-disable-next-line no-bitwise
  const numbers = `${((c << 8) + d) % 10000}`.padStart(4, '0')
  const TextPart = `${letters(a)}${letters(b)}-${numbers}`

  return {ImagePart, TextPart}
}
