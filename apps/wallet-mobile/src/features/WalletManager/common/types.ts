import {App, Chain, Portfolio} from '@yoroi/types'

import {KeychainManager} from '../../../kernel/storage/Keychain'
import {CardanoTypes, WalletEvent, YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {HWDeviceInfo} from '../../../yoroi-wallets/hw/hw'
import {NetworkId, WalletImplementationId} from '../../../yoroi-wallets/types/other'

export type NetworkConfig = {
  network: Chain.SupportedNetworks
  primaryTokenInfo: Portfolio.Token.Info
  chainId: number
  eras: ReadonlyArray<NetworkEraConfig>
  name: string
  isMainnet: boolean
}

export type NetworkManager = {
  tokenManager: Portfolio.Manager.Token
  rootStorage: App.Storage<false, Portfolio.Token.Id>
} & NetworkConfig

export type NetworkEraConfig = {
  name: 'byron' | 'shelley'
  start: Date
  end: Date | undefined
  slotInSeconds: number
  slotsPerEpoch: number
}

export type NetworkEpochInfo = {
  epoch: number
  start: Date
  end: Date
  era: NetworkEraConfig
}

export type NetworkEpochProgress = {
  progress: number
  currentSlot: number
  timeRemaining: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
}

export type NetworkTokenManagers = Readonly<Record<Chain.SupportedNetworks, Portfolio.Manager.Token>>

export type WalletMeta = {
  id: string
  name: string
  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  isHW: boolean
  isEasyConfirmationEnabled: boolean
  checksum: CardanoTypes.WalletChecksum
  addressMode: AddressMode
  // legacy jormungandr
  isShelley?: boolean | null | undefined
}

export type AddressMode = 'single' | 'multiple'

export type WalletManagerEvent = {type: 'hw-device-info'; hwDeviceInfo: HWDeviceInfo}

export type WalletManagerOptions = {
  keychainManager?: Readonly<KeychainManager>
  networkManagers: Readonly<Record<Chain.SupportedNetworks, NetworkManager>>
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
