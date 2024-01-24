export type BanxaFiatType = 'USD' | 'EUR'

const supportedFiatTypes: Readonly<BanxaFiatType[]> = ['USD', 'EUR'] as const

export function banxaIsFiatType(value: any): value is BanxaFiatType {
  return supportedFiatTypes.includes(value as BanxaFiatType)
}
