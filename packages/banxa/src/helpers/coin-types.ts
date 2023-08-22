export type BanxaCoinType = 'ADA'

const banxaSupportedCoinTypes: BanxaCoinType[] = ['ADA']

export function banxaIsCoinType(value: any): value is BanxaCoinType {
  return banxaSupportedCoinTypes.includes(value as BanxaCoinType)
}
