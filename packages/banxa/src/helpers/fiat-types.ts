export type BanxaFiatType = 'USD' | 'EUR'

const supportedFiatTypes: BanxaFiatType[] = ['USD', 'EUR']

export function banxaIsFiatType(value: any): value is BanxaFiatType {
  return supportedFiatTypes.includes(value as BanxaFiatType)
}
