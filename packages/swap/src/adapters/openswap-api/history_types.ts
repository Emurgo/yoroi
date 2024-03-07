export type History = {
  attachedLvl: number
  finalizedAt: number
  fromAmount: string | number
  fromToken: FromTokenOrToToken
  outputIdx?: number | null
  paidAmount: string | number
  placedAt: number
  pubKeyHash: string
  receivedAmount: string | number
  scriptVersion?: string | null
  status: string
  toAmount: string | number
  toToken: ToToken
  txHash: string
  aggregatorPlatform?: null
  batcherFee?: number | null
  dex?: string | null
  stakeKeyHash?: string | null
}
export type FromTokenOrToToken = {
  website: string
  symbol: string
  decimalPlaces: number
  image: string
  description: string
  address: Address
  categories?: (string | null)[] | null
  supply: Supply
  status: string
  sign?: string | null
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
  website: string
  symbol: string
  decimalPlaces: number
  image: string
  description: string
  address: Address
  categories?: (string | null)[] | null
  supply: Supply1
  status: string
  sign?: string | null
}
export type Supply1 = {
  total: string
  circulating?: string | null
}
