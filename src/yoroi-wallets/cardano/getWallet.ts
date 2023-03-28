import {WALLET_IMPLEMENTATION_REGISTRY} from '../types'
import {ByronWallet} from './byron'
import {WALLET_CONFIG, WALLET_CONFIG_24} from './constants/common'
import * as MAINNET from './constants/mainnet/constants'
import * as TESTNET from './constants/testnet/constants'
import {ShelleyWalletMainnet, ShelleyWalletTestnet} from './shelley'

export const getWallet = ({networkId, implementationId}: {networkId: number; implementationId: string}) => {
  const walletMap = {
    [MAINNET.NETWORK_ID]: /* cardano mainnet */ {
      [WALLET_CONFIG.WALLET_IMPLEMENTATION_ID]: ShelleyWalletMainnet,
      [WALLET_CONFIG_24.WALLET_IMPLEMENTATION_ID]: ShelleyWalletMainnet,
      [WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON]: ByronWallet,
    },
    [TESTNET.NETWORK_ID]: /* cardano testnet */ {
      [WALLET_CONFIG.WALLET_IMPLEMENTATION_ID]: ShelleyWalletTestnet,
      [WALLET_CONFIG_24.WALLET_IMPLEMENTATION_ID]: ShelleyWalletTestnet,
    },
  }

  return walletMap[networkId]?.[implementationId]
}
