export type BanxaCoinType = 'ADA'

const banxaSupportedCoinTypes: Readonly<BanxaCoinType[]> = ['ADA'] as const

export function banxaIsCoinType(value: any): value is BanxaCoinType {
  return banxaSupportedCoinTypes.includes(value as BanxaCoinType)
}
