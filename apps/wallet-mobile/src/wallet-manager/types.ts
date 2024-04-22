import {CardanoTypes, YoroiWallet} from '../yoroi-wallets/cardano/types'
import {HWDeviceInfo} from '../yoroi-wallets/hw/hw'
import {NetworkId, WalletImplementationId} from '../yoroi-wallets/types/other'

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
