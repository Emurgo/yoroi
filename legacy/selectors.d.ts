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
export var defaultNetworkAssetSelector: (state: State) => DefaultAsset
export var externalAddressIndexSelector: (state: State) => Record<string, number>
export var internalAddressIndexSelector: (state: State) => Record<string, number>
export var canGenerateNewReceiveAddressSelector: (state: State) => boolean
export var isUsedAddressIndexSelector: (state: State) => Record<string, boolean>
export var receiveAddressesSelector: (state: State) => Array<string>
export var hwDeviceInfoSelector: (state: State) => {bip44AccountPublic: string; hwFeatures: HWFeatures} | null
export var isDelegatingSelector: (state: State) => boolean
export var unsignedTxSelector: (state: State) => typeof state.voting.unsignedTx
export var encryptedKeySelector: (state: State) => string
export var pinSelector: (state: State) => Array<string>
export var hasPendingOutgoingTransactionSelector: (state: State) => boolean
export var lastUtxosFetchErrorSelector: (state: State) => typeof state.balance.lastFetchingError
export var utxosSelector: (state: State) => typeof state.balance.utxos
export var isAppInitializedSelector: (state: State) => boolean
export var canEnableBiometricSelector: (state: State) => boolean

export var accountBalanceSelector: (state: State) => typeof state.accountState.value | null
export var isFetchingAccountStateSelector: (state: State) => typeof state.accountState.isFetching
export var isFetchingPoolInfoSelector: (state: State) => typeof state.poolInfo.isFetching
export var isFetchingUtxosSelector: (state: State) => typeof state.balance.isFetching
export var isFlawedWalletSelector: (state: State) => typeof state.isFlawedWallet
export var lastAccountStateFetchErrorSelector: (state: State) => typeof state.accountState.lastFetchingError
export var poolInfoSelector: (state: State) => null | typeof state.poolInfo.meta
export var poolOperatorSelector: (state: State) => null | typeof state.accountState.poolOperator
export var serverStatusSelector: (state: State) => typeof state.serverStatus
export var totalDelegatedSelector: (state: State) => null | typeof state.accountState.totalDelegated
export var utxoBalanceSelector: (state: State) => BigNumber | null

// prettier-ignore
interface MultiToken {
  getDefaultId: () => string,
  getDefault: () => BigNumber,
  getDefaultEntry: () => TokenEntry,
  get(tokenIdentifier: string): BigNumber | void,
  values: Array<{amount: BigNumber, identifier: string, networkId: number}>
}
export var tokenBalanceSelector: (state: State) => MultiToken

// prettier-ignore
export type ServerStatusCache = {
  isServerOk: boolean,
  isMaintenance: boolean,
  serverTime: Date | null,
}

// prettier-ignore
export type RemotePoolMetaSuccess = {
  info: null | {
    name?: string | null,
    ticker?: string | null,
    description?: string | null,
    homepage?: string | null,
    // other stuff from SMASH.
  },
  history: Array<{
    epoch: number,
    slot: number,
    tx_ordinal: number,
    cert_ordinal: number,
    payload: RemoteCertificate,
  }>
}
