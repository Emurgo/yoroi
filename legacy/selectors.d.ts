// @flow

import BigNumber from 'bignumber.js'

import {DefaultAsset, Token, TokenEntry, TransactionInfo} from '../src/types/cardano'
import type {State, WalletMeta} from './state'

export var availableAssetsSelector: (state: State) => Record<string, Token | DefaultAsset>
export var customPinHashSelector: (state: State) => string | undefined
export var hasAnyTransaction: (state: State) => boolean
export var installationIdSelector: (state: State) => boolean
export var isAppSetupCompleteSelector: (state: State) => boolean
export var isAuthenticatedSelector: (state: State) => boolean
export var isMaintenanceSelector: (state: State) => boolean
export var isOnlineSelector: (state: State) => boolean
export var isReadOnlySelector: (state: State) => boolean
export var isSynchronizingHistorySelector: (state: State) => boolean
export var isSystemAuthEnabledSelector: (state: State) => boolean
export var languageSelector: (state: State) => string
export var lastHistorySyncErrorSelector: (state: State) => boolean
export var tokenInfoSelector: (state: State) => Record<string, Token>
export var transactionsInfoSelector: (state: State) => Record<string, TransactionInfo>
export var walletIsInitializedSelector: (state: State) => boolean
export var walletMetaSelector: (state: State) => WalletMeta
export var walletsListSelector: (state: State) => Array<WalletMeta>
export var easyConfirmationSelector: (state: State) => boolean
export var isHWSelector: (state: State) => boolean
export var walletNameSelector: (state: State) => string
export var walletNamesSelector: (state: State) => Array<string>
export var defaultNetworkAssetSelector: (state: State) => DefaultAsset
export var externalAddressIndexSelector: (state: State) => Record<string, number>
export var internalAddressIndexSelector: (state: State) => Record<string, number>
export var canGenerateNewReceiveAddressSelector: (state: State) => boolean
export var isUsedAddressIndexSelector: (state: State) => Record<string, boolean>
export var receiveAddressesSelector: (state: State) => Array<string>
export var hwDeviceInfoSelector: (state: State) => {bip44AccountPublic: string; hwFeatures: HWFeatures} | null
export var isDelegatingSelector: (state: State) => boolean
export var unsignedTxSelector = (state: State) => state.voting.unsignedTx
export var encryptedKeySelector: (state: State) => string
export var pinSelector: (state: State) => Array<string>
export var tokenBalanceSelector: (state: State) => MultiToken

// prettier-ignore
interface MultiToken {
  getDefaultId: () => string,
  getDefault: () => BigNumber,
  getDefaultEntry: () => TokenEntry,
  values: Array<{amount: BigNumber, identifier: string, networkId: number}>
}
