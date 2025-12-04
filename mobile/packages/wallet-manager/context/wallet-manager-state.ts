import {YoroiWallet} from '@yoroi/cardano-wallet'
import {getLogger} from '@yoroi/common'
import {Chain, Network, Wallet} from '@yoroi/types'

import {castDraft, freeze, produce} from 'immer'

// networkManagers is now passed via WalletManager, not imported from constants
import {WalletManager} from '../wallet-manager'

export const walletManagerReducer = (
  state: WalletManagerState,
  action: WalletManagerAction,
  networkManagers: Readonly<Record<Chain.SupportedNetworks, Network.Manager>>,
) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case WalletManagerActionType.NetworkSelected:
        draft.selected.network = action.network
        draft.selected.networkManager = castDraft(
          networkManagers[action.network],
        )
        break

      case WalletManagerActionType.WalletSelected:
        draft.selected.wallet = castDraft(action.wallet)
        draft.selected.meta = castDraft(action.meta)
        break

      case WalletManagerActionType.SelectedMetaUpdated:
        // only cares if selected one has been updated
        if (draft.selected.meta != null) {
          const newMeta = action.metas.get(draft.selected.meta.id)
          if (newMeta != null) {
            draft.selected.meta = castDraft(newMeta)
          } else {
            getLogger().error('walletManagerReducer: selected meta is gone')
          }
        }
        break
    }
  })
}

export type WalletManagerState = {
  selected: {
    wallet: YoroiWallet | null
    meta: Wallet.Meta | null
    network: Chain.SupportedNetworks
    networkManager: Network.Manager
  }
}

export type WalletManagerAction =
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

export const createWalletManagerDefaultState = (
  networkManagers: Readonly<Record<Chain.SupportedNetworks, Network.Manager>>,
): Readonly<WalletManagerState> =>
  freeze(
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
  walletSelected(args: {
    wallet: YoroiWallet | null
    meta: Wallet.Meta | null
  }): void
  networkSelected(network: Chain.SupportedNetworks): void
  selectedMetaUpdated(metas: Map<YoroiWallet['id'], Wallet.Meta>): void
}

export type WalletManagerContextType = WalletManagerState & {
  walletManager: WalletManager | null
}
export const createWalletManagerInitialContext = (
  networkManagers: Readonly<Record<Chain.SupportedNetworks, Network.Manager>>,
): WalletManagerContextType =>
  freeze(
    {
      ...createWalletManagerDefaultState(networkManagers),
      walletManager: null,
    },
    true,
  )

// missingInit removed - no longer needed
