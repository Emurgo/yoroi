import type {
  CardanoTypes,
  CardanoWalletDependencies,
  WalletEvent,
  YoroiWallet,
} from '@yoroi/cardano-wallet'
import {App, Chain, HW, Network, Portfolio} from '@yoroi/types'

import {WasmModuleProxy} from '@emurgo/cross-csl-core'

/**
 * KeychainManager interface for managing wallet keys in secure storage
 * This should be provided by the app via WalletManagerOptions
 */
export type KeychainManager = {
  removeWalletKey: (walletId: string) => Promise<void>
  setWalletKey: (walletId: string, key: string) => Promise<void>
}

export type NetworkTokenManagers = Readonly<
  Record<Chain.SupportedNetworks, Portfolio.Manager.Token>
>

export type WalletManagerEvent = {
  type: 'hw-device-info'
  hwDeviceInfo: HW.DeviceInfo
}

export type WalletManagerOptions = {
  keychainManager?: Readonly<KeychainManager>
  networkManagers: Readonly<Record<Chain.SupportedNetworks, Network.Manager>>
  rootStorage: Readonly<App.Storage>
  /**
   * Dependencies for Cardano wallet factory
   * These are platform-specific implementations
   */
  cardanoWalletDependencies: CardanoWalletDependencies
}

export type WalletManagerSubscription = (
  event: WalletManagerEvent | WalletEvent,
) => void

export type SyncWalletInfo = {
  id: YoroiWallet['id']
  updatedAt: number
  status: 'waiting' | 'syncing' | 'done' | 'error'
  error?: Error
  // last sync network updated only on error/success
  network: Chain.SupportedNetworks | null
}
export type SyncWalletInfos = Readonly<Map<YoroiWallet['id'], SyncWalletInfo>>

export type WalletFactory = {
  build({
    id,
    accountPubKeyHex,
    accountVisual,
    readOnlyAddresses,
    rewardAddressHex,
  }: {
    id: string
    accountPubKeyHex?: string
    accountVisual: number
    readOnlyAddresses?: {
      knownAddress?: string
      internal?: string[]
      external?: string[]
      rewardAddressHex?: string
      enableDiscovery?: boolean
    }
    rewardAddressHex?: string
  }): Promise<YoroiWallet>

  calcChecksum(pubKeyHex: string): CardanoTypes.WalletChecksum

  makeKeys({mnemonic, csl}: {mnemonic: string; csl: WasmModuleProxy}): {
    rootKey: string
    accountPubKeyHex: string
  }
}
