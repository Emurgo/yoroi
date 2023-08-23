export type BanxaBlockchainCode = 'ADA'

const banxaSupportedBlockchainCodes: Readonly<BanxaBlockchainCode[]> = [
  'ADA',
] as const

export function banxaIsBlockchainCode(
  value: any,
): value is BanxaBlockchainCode {
  return banxaSupportedBlockchainCodes.includes(value as BanxaBlockchainCode)
}
