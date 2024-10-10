import {Chain, Wallet} from '@yoroi/types'
import {NetworkManager} from '@yoroi/types/lib/typescript/network/manager'
import {castDraft, freeze, produce} from 'immer'

import {throwLoggedError} from '../../../kernel/logger/helpers/throw-logged-error'
import {logger} from '../../../kernel/logger/logger'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {networkManagers} from '../common/constants'
import {WalletManager} from '../wallet-manager'

export const walletManagerReducer = (state: WalletManagerState, action: WalletManagerAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case WalletManagerActionType.NetworkSelected:
        draft.selected.network = action.network
        draft.selected.networkManager = castDraft(networkManagers[action.network])
        break

      case WalletManagerActionType.WalletSelected:
        draft.selected.wallet = castDraft(action.wallet)
        draft.selected.meta = action.meta
        break

      case WalletManagerActionType.SelectedMetaUpdated:
        // only cares if selected one has been updated
        if (draft.selected.meta != null) {
          const newMeta = action.metas.get(draft.selected.meta.id)
          if (newMeta != null) {
            draft.selected.meta = newMeta
          } else {
            logger.error('walletManagerReducer: selected meta is gone')
          }
        }
        break
    }
  })
}

type WalletManagerAction =
  | {
      type: WalletManagerActionType.NetworkSelected
      network: Chain.SupportedNetworks
    }
  | {
      type: WalletManagerActionType.WalletSelected
      wallet: YoroiWallet | null
      meta: Wallet.Meta | null
    }
  | {
      type: WalletManagerActionType.SelectedMetaUpdated
      metas: Map<YoroiWallet['id'], Wallet.Meta>
    }

export type WalletManagerState = {
  selected: {
    wallet: YoroiWallet | null
    meta: Wallet.Meta | null
    network: Chain.SupportedNetworks
    networkManager: NetworkManager
  }
}

export const walletManagerDefaultState: Readonly<WalletManagerState> = freeze(
  {
    selected: {
      network: Chain.Network.Mainnet,
      networkManager: networkManagers[Chain.Network.Mainnet],
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
  walletSelected(args: {wallet: YoroiWallet | null; meta: Wallet.Meta | null}): void
  networkSelected(network: Chain.SupportedNetworks): void
  selectedMetaUpdated(metas: Map<YoroiWallet['id'], Wallet.Meta>): void
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
  throwLoggedError('WalletManagerContext is missing initialization')
}
