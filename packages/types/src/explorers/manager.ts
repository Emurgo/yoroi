export type ExplorersManager = Readonly<{
  token: (fingerprint: string) => string
  address: (address: string) => string
  tx: (txHash: string) => string
  pool: (poolId: string) => string
}>
