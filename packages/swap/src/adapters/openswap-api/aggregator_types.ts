export type Aggregated = {
  fromToken: FromTokenOrToToken
  toToken: FromTokenOrToToken
  batchToken: BatchToken
  batcherFee: string
  fromAmount: string
  toAmount: string
  attachedValues?: AttachedValuesEntity[] | null
  owner: string
  sender: string
  providerSpecifics?: null
  txHash: string
  outputIdx: number
  status: string
  provider: string
  placedAt?: null
  finalizedAt?: null
  batcherAddress: string
}
export type FromTokenOrToToken = {
  address: Address
  symbol: string
  image: string
  decimalPlaces: number
}
export type Address = {
  policyId: string
  name: string
}
export type BatchToken = {
  address: Address
  symbol: string
  decimalPlaces: number
}
export type AttachedValuesEntity = {
  address: Address
  amount: string
}
