import {Chain} from '@yoroi/types'
import {castDraft, freeze, produce} from 'immer'

import {logger} from '../../../kernel/logger/logger'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {WalletMeta} from '../common/types'
import {WalletManager} from '../wallet-manager'

export const walletManagerReducer = (state: WalletManagerState, action: WalletManagerAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case WalletManagerActionType.NetworkSelected:
        draft.selected.network = action.network
        break

      case WalletManagerActionType.WalletSelected:
        draft.selected.wallet = castDraft(action.wallet)
        draft.selected.meta = action.meta
        break

      case WalletManagerActionType.SelectedMetaUpdated:
        draft.selected.meta = action.meta
        break
    }
  })
}

export type WalletManagerAction =
  | {
      type: WalletManagerActionType.NetworkSelected
      network: Chain.SupportedNetworks
    }
  | {
      type: WalletManagerActionType.WalletSelected
      wallet: YoroiWallet | null
      meta: WalletMeta | null
    }
  | {
      type: WalletManagerActionType.SelectedMetaUpdated
      meta: WalletMeta
    }

export type WalletManagerState = {
  selected: {
    wallet: YoroiWallet | null
    meta: WalletMeta | null
    network: Chain.SupportedNetworks
  }
}

export const walletManagerDefaultState: Readonly<WalletManagerState> = freeze(
  {
    selected: {
      network: Chain.Network.Mainnet,
      wallet: null,
      meta: null,
    },
  },
  true,
)

export enum WalletManagerActionType {
  WalletSelected = 'walletSelected',
  NetworkSelected = 'networkSelected',
  SelectedMetaUpdated = 'selectedMetaUpdated',
}
export type WalletManagerActions = {
  walletSelected(args: {wallet: YoroiWallet | null; meta: WalletMeta | null}): void
  networkSelected(network: Chain.SupportedNetworks): void
  selectedMetaUpdated(meta: WalletMeta): void
}

export type WalletManagerContextType = WalletManagerState & {walletManager: WalletManager | null}
export const walletManagerInitialContext: WalletManagerContextType = freeze(
  {
    ...walletManagerDefaultState,
    walletManager: null,
    networkSelected: missingInit,
    walletSelected: missingInit,
  },
  true,
)

/* istanbul ignore next */
function missingInit() {
  logger.error('WalletManagerContext is missing initialization')
}
