export type Order = {
  attachedLvl: string
  finalizedAt: number
  fromAmount: string
  fromToken: FromToken
  outputIdx: number
  paidAmount: string
  placedAt: number
  pubKeyHash: string
  receivedAmount: string
  scriptVersion: string
  status: string
  toAmount: string
  toToken: ToToken
  txHash: string
  feeField: number
  allowPartial: boolean
}
export type FromToken = {
  website: string
  symbol: string
  decimalPlaces: number
  image: string
  description: string
  address: Address
  categories?: string[] | null
  supply: Supply
  status: string
}
export type Address = {
  policyId: string
  name: string
}
export type Supply = {
  total: string
  circulating: string
}
export type ToToken = {
  address: Address
  symbol: string
  description: string
  image: string
  website: string
  decimalPlaces: number
  sign: string
  categories?: null[] | null
  supply: Supply
  status: string
}
