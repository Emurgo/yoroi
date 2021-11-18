// @flow

import BigNumber from 'bignumber.js'

import {Token, TransactionInfo} from '../src/TxHistory/types'
import type {State, WalletMeta} from './state'

export var availableAssetsSelector: (state: State) => Record<string, Token>
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

// prettier-ignore
interface PartialMultiToken {
  getDefaultId: () => string,
  getDefault: () => Token,
  values: Array<{amount: BigNumber, identifier: string, networkId: number}>
}
export var tokenBalanceSelector: (state: State) => PartialMultiToken
