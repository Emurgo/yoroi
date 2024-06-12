import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {App, Chain, HW, Network, Portfolio, Wallet} from '@yoroi/types'

import {KeychainManager} from '../../../kernel/storage/Keychain'
import {CardanoTypes, WalletEvent, YoroiWallet} from '../../../yoroi-wallets/cardano/types'

export type NetworkTokenManagers = Readonly<Record<Chain.SupportedNetworks, Portfolio.Manager.Token>>

export type WalletManagerEvent = {type: 'hw-device-info'; hwDeviceInfo: HW.DeviceInfo}

export type WalletManagerOptions = {
  keychainManager?: Readonly<KeychainManager>
  networkManagers: Readonly<Record<Chain.SupportedNetworks, Network.Manager>>
  rootStorage: Readonly<App.Storage>
}

export type WalletManagerSubscription = (event: WalletManagerEvent | WalletEvent) => void

export type SyncWalletInfo = {
  id: YoroiWallet['id']
  updatedAt: number
  status: 'waiting' | 'syncing' | 'done' | 'error'
  error?: Error
}
export type SyncWalletInfos = Readonly<Map<YoroiWallet['id'], SyncWalletInfo>>

export type WalletFactory = {
  createFromXPriv({
    id,
    storage,
    accountPubKeyHex,
    networkManager,
  }: {
    id: string
    storage: App.Storage
    accountPubKeyHex: string
    networkManager: Network.Manager
  }): Promise<YoroiWallet>

  createFromXPub({
    id,
    storage,
    accountPubKeyHex,
    hwDeviceInfo,
    isReadOnly,
    networkManager,
  }: {
    id: string
    accountPubKeyHex: string
    hwDeviceInfo: HW.DeviceInfo | null
    isReadOnly: boolean
    storage: App.Storage
    networkManager: Network.Manager
  }): Promise<YoroiWallet>

  restore({
    walletMeta,
    storage,
    networkManager,
  }: {
    storage: App.Storage
    walletMeta: Wallet.Meta
    networkManager: Network.Manager
  }): Promise<YoroiWallet>

  calcChecksum(pubKeyHex: string): CardanoTypes.WalletChecksum

  makeKeys({
    mnemonic,
    csl,
  }: {
    mnemonic: string
    csl: WasmModuleProxy
  }): Promise<{rootKey: string; accountPubKeyHex: string}>
}
