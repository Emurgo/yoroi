export type EscrowDatum = {
  paymentCredHash: string // 28-byte hex
  stakingCredHash: string | null // 28-byte hex or null for enterprise addresses
  nightPerThaw: bigint
  nextThawTime: bigint // ms since unix epoch
  thawsRemaining: bigint
  interval: bigint // ms between thaws
}

export type EscrowUtxo = {
  txHash: string
  txIndex: number
  address: string // bech32
  nightAmount: string // lovelace quantity string
  adaAmount: string // lovelace quantity string
  datumHex: string // inline datum CBOR hex
  datum: EscrowDatum
}
