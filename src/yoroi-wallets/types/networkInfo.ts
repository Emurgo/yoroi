export type NetworkInfo = {
  id: string
  displayName: string
  primaryTokenId: string
  mnemonicLength: number

  getTime: (utcTimeMS: number) => {
    epoch: number
    slot: number
    absoluteSlot: number
    slotsRemaining: number
    slotsPerEpoch: number
    secondsRemainingInEpoch: number
    percentageElapsed: number
  }

  validateAddress: (address: string) => Promise<Record<string, boolean>>

  explorers: {
    addressExplorer?: (address: string) => string
    blockExplorer?: (blockId: string) => string
    transactionExplorer?: (txId: string) => string
    poolExplorer?: (poolId: string) => string
    nftExplorer?: (nftId: string) => string
    tokenExplorer?: (tokenId: string) => string
    fundExplorer?: () => string
  }
}