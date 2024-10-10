// Token Registry
// 721: https://github.com/cardano-foundation/cardano-token-registry#semantic-content-of-registry-entries
export type TokenRegistryEntry = {
  subject: string
  name: Property<string>

  description?: Property<string>
  policy?: string
  logo?: Property<string>
  ticker?: Property<string>
  url?: Property<string>
  decimals?: Property<number>
}

type Signature = {
  publicKey: string
  signature: string
}

type Property<T> = {
  signatures: Array<Signature>
  sequenceNumber: number
  value?: T
}
