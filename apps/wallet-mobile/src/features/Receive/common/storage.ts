import {App} from '@yoroi/types'

import {AddressMode} from '../../../yoroi-wallets/types/yoroi'

export const keyAddressMode = 'addressMode'

export const saveAddressMode = (walletStorage: App.Storage) => (addressMode: AddressMode) =>
  walletStorage.setItem(keyAddressMode, addressMode)
