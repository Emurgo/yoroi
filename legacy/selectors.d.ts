// @flow

import {Token, TransactionInfo} from '../src/components/TxHistory/types'
import type {State, WalletMeta} from './state'

export var walletMetaSelector: (state: State) => WalletMeta
export var isReadOnlySelector: (state: State) => boolean
export var languageSelector: (state: State) => string
export var isSystemAuthEnabledSelector: (state: State) => boolean
export var isAuthenticatedSelector: (state: State) => boolean
export var isAppSetupCompleteSelector: (state: State) => boolean
export var installationIdSelector: (state: State) => boolean
export var isMaintenanceSelector: (state: State) => boolean
export var isOnlineSelector: (state: State) => boolean
export var isSynchronizingHistorySelector: (state: State) => boolean
export var lastHistorySyncErrorSelector: (state: State) => boolean
export var transactionsInfoSelector: (state: State) => Record<string, TransactionInfo>
export var walletIsInitializedSelector: (state: State) => boolean
export var availableAssetsSelector: (state: State) => Record<string, Token>

interface PartialMultiToken {
  getDefaultId: () => string,
  getDefault: () => Token
}
export var tokenBalanceSelector: (state: State) => PartialMultiToken