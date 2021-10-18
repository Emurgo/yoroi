// @flow

import type {State, WalletMeta} from './state'

export var walletMetaSelector: (state: State) => WalletMeta
export var isReadOnlySelector: (state: State) => boolean
export var languageSelector: (state: State) => string
export var isSystemAuthEnabledSelector: (state: State) => boolean
export var isAuthenticatedSelector: (state: State) => boolean
export var isAppSetupCompleteSelector: (state: State) => boolean
export var installationIdSelector: (state: State) => boolean
export var isMaintenanceSelector: (state: State) => boolean
