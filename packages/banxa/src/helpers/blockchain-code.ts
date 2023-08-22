export type BanxaBlockchainCode = 'ADA'

const banxaSupportedBlockchainCodes: BanxaBlockchainCode[] = ['ADA']

export function banxaIsBlockchainCode(
  value: any,
): value is BanxaBlockchainCode {
  return banxaSupportedBlockchainCodes.includes(value as BanxaBlockchainCode)
}
