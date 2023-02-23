import { NetworkModule } from "../.."

export const CardanoMainnet: NetworkModule = {
  Wallet: CardanoMainnetShelley,
  matchNetworkId: (networkId: number) => {
    if (networkId === 0) {
      return true // byron mainnet
    }
    if (networkId === 1) {
      return true // shelley mainnet
    }
    
    return false
  },
}
