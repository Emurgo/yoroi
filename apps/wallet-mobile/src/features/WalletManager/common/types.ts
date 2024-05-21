import {Portfolio} from '@yoroi/types'

import {CardanoTypes, YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {HWDeviceInfo} from '../../../yoroi-wallets/hw/hw'
import {NetworkId, WalletImplementationId} from '../../../yoroi-wallets/types/other'

export type NetworkManager = {
  primaryTokenInfo: Portfolio.Token.Info
  chainId: number
  eras: ReadonlyArray<NetworkEraConfig>
}

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

export type WalletManagerEvent =
  | {type: 'easy-confirmation'; enabled: boolean}
  | {type: 'hw-device-info'; hwDeviceInfo: HWDeviceInfo}
  | {type: 'selected-wallet-id'; id: YoroiWallet['id']}

export type WalletManagerSubscription = (event: WalletManagerEvent) => void

export type WalletInfo = {
  sync: {
    updatedAt: number
    status: 'waiting' | 'syncing' | 'done' | 'error'
    error?: Error
  }
}
export type WalletInfos = Map<YoroiWallet['id'], WalletInfo>
