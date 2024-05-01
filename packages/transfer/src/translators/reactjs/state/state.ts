import {isNameServer, isResolvableDomain} from '@yoroi/resolver'
import {Chain, Links, Portfolio, Resolver, Transfer} from '@yoroi/types'
import {castDraft, freeze, produce} from 'immer'

import {TransferAllocatedByOtherTargets} from '../../../types'
import { targetGetTokenAllocatedToOthers } from '../../../helpers/target-get-allocated-to-others-by-token'

export const combinedReducers = (
  state: TransferState,
  action: TransferAction | TargetAction,
) => {
  let newState = transferReducer(state, action as TransferAction)
  newState = targetsReducer(newState, action as TargetAction)
  return newState
}

const transferReducer = (state: TransferState, action: TransferAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case TransferActionType.UnsignedTxChanged:
        draft.unsignedTx = castDraft(action.unsignedTx)
        break
      case TransferActionType.MemoChanged:
        draft.memo = action.memo
        break
      case TransferActionType.TokenSelectedChanged:
        draft.selectedTokenId = action.tokenId
        break
      case TransferActionType.LinkActionChanged:
        draft.linkAction = castDraft(action.linkAction)
        break
      case TransferActionType.Reset:
        draft = castDraft(defaultTransferState)
        break
      case TransferActionType.BalancesUpdated:
        draft.balances = action.balances
        draft.primaryBreakdown = action.primaryBreakdown
        draft.allocated = targetGetTokenAllocatedToOthers()
        break
    }
  })
}

const targetsReducer = (state: TransferState, action: TargetAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case TransferActionType.ReceiverResolveChanged: {
        const {resolve} = action
        const selectedTargetIndex = state.selectedTargetIndex

        draft.targets.forEach((target, index) => {
          if (index === selectedTargetIndex) {
            const isDomain: boolean = isResolvableDomain(resolve)
            const as: Resolver.Receiver['as'] = isDomain ? 'domain' : 'address'
            const address = isDomain ? '' : resolve
            target.receiver = {
              resolve,
              as,
              selectedNameServer: undefined,
              addressRecords: undefined,
            }
            target.entry.address = address
          }
        })
        break
      }

      case TransferActionType.AddressRecordsFetched: {
        const {addressRecords} = action
        const selectedTargetIndex = state.selectedTargetIndex

        draft.targets.forEach((target, index) => {
          if (index === selectedTargetIndex) {
            if (addressRecords !== undefined) {
              const keys = Object.keys(addressRecords).filter(isNameServer)
              const nameServer = keys.length === 1 ? keys[0] : undefined
              target.receiver.selectedNameServer = nameServer
              if (nameServer !== undefined) {
                target.entry.address = addressRecords[nameServer] ?? ''
              }
            } else {
              target.receiver.selectedNameServer = undefined
            }
            target.receiver.addressRecords = addressRecords
          }
        })
        break
      }

      case TransferActionType.NameServerSelectedChanged: {
        const {nameServer} = action
        const selectedTargetIndex = state.selectedTargetIndex

        draft.targets.forEach((target, index) => {
          if (index === selectedTargetIndex) {
            target.receiver.selectedNameServer = nameServer

            if (nameServer !== undefined) {
              target.entry.address =
                target.receiver.addressRecords?.[nameServer] ?? ''
            } else {
              const isDomain = target.receiver.as === 'domain'
              if (isDomain) target.entry.address = ''
            }
          }
        })
        break
      }

      case TransferActionType.AmountChanged: {
        const {amount} = action
        const selectedTargetIndex = state.selectedTargetIndex
        const selectedTokenId = state.selectedTokenId

        draft.targets.forEach((target, index) => {
          if (index === selectedTargetIndex) {
            target.entry.amounts[selectedTokenId] = amount
          }
        })
        break
      }

      case TransferActionType.AmountRemoved: {
        const {tokenId} = action
        const selectedTargetIndex = state.selectedTargetIndex

        draft.targets.forEach((target, index) => {
          if (index === selectedTargetIndex) {
            delete target.entry.amounts[tokenId]
          }
        })
        break
      }
    }
  })
}

export const defaultTransferState: TransferState = freeze(
  {
    balances: new Map(),
    primaryBreakdown: {
      availableRewards: 0n,
      lockedAsStorageCost: 0n,
      totalFromTxs: 0n,
    },

    allocated: new Map(),

    selectedTargetIndex: 0,
    selectedTokenId: '.', // it's ok satisfying the type here, if ptId is dif it needs init by the client
    unsignedTx: undefined,
    memo: '',

    linkAction: undefined,

    targets: [
      {
        receiver: {
          resolve: '',
          as: 'address',
          selectedNameServer: undefined,
          addressRecords: undefined,
        },
        entry: {
          address: '',
          amounts: {},
        },
      },
    ],
  },
  true,
)

const defaultTargetActions: TargetActions = {
  amountChanged: missingInit,
  amountRemoved: missingInit,
  receiverResolveChanged: missingInit,
  nameServerSelectedChanged: missingInit,
  addressRecordsFetched: missingInit,
}

const defaultStateActions: TransferActions = {
  unsignedTxChanged: missingInit,
  tokenSelectedChanged: missingInit,
  reset: missingInit,
  memoChanged: missingInit,
  linkActionChanged: missingInit,
  balancesUpdated: missingInit,
}

export const defaultTransferActions = {
  ...defaultTargetActions,
  ...defaultStateActions,
} as const

export type TransferState = Readonly<{
  balances: Map<Portfolio.Token.Id, Portfolio.Token.Amount>
  primaryBreakdown: Portfolio.PrimaryBreakdown

  // inputs
  selectedTargetIndex: number
  selectedTokenId: Portfolio.Token.Id
  unsignedTx: Chain.Cardano.UnsignedTx | undefined
  memo: string

  // derived state
  targets: Transfer.Targets
  allocated: TransferAllocatedByOtherTargets

  // injected when deeplink request transfer
  linkAction: Links.YoroiAction | undefined
}>

export type TargetActions = Readonly<{
  // Amount
  amountChanged: (amount: Portfolio.Token.Amount) => void
  amountRemoved: (tokenId: Portfolio.Token.Id) => void
  // Receiver
  receiverResolveChanged: (resolve: Resolver.Receiver['resolve']) => void
  nameServerSelectedChanged: (
    nameServer: Resolver.Receiver['selectedNameServer'],
  ) => void
  addressRecordsFetched: (
    addressRecords: Resolver.Receiver['addressRecords'],
  ) => void
}>

export type TransferActions = Readonly<{
  unsignedTxChanged: (UnsignedTx: Chain.Cardano.UnsignedTx) => void
  tokenSelectedChanged: (tokenId: Portfolio.Token.Id) => void
  reset: () => void
  memoChanged: (memo: string) => void
  linkActionChanged: (linkAction: Links.YoroiAction) => void
  balancesUpdated: (
    balances: TransferState['balances'],
    primaryBreakdown: TransferState['primaryBreakdown'],
  ) => void
}>

export type TargetAction = Readonly<
  | {
      type: TransferActionType.ReceiverResolveChanged
      resolve: Resolver.Receiver['resolve']
    }
  | {
      type: TransferActionType.NameServerSelectedChanged
      nameServer: Resolver.Receiver['selectedNameServer']
    }
  | {
      type: TransferActionType.AddressRecordsFetched
      addressRecords: Resolver.Receiver['addressRecords']
    }
  | {
      type: TransferActionType.AddressChanged
      address: Chain.Cardano.Address
    }
  | {
      type: TransferActionType.TokenSelectedChanged
      tokenId: Portfolio.Token.Id
    }
  | {
      type: TransferActionType.AmountChanged
      amount: Portfolio.Token.Amount
    }
  | {
      type: TransferActionType.AmountRemoved
      tokenId: Portfolio.Token.Id
    }
>

export type TransferAction = Readonly<
  | {
      type: TransferActionType.Reset
    }
  | {
      type: TransferActionType.MemoChanged
      memo: TransferState['memo']
    }
  | {
      type: TransferActionType.TokenSelectedChanged
      tokenId: Portfolio.Token.Id
    }
  | {
      type: TransferActionType.UnsignedTxChanged
      unsignedTx: Chain.Cardano.UnsignedTx
    }
  | {
      type: TransferActionType.LinkActionChanged
      linkAction: Links.YoroiAction
    }
  | {
      type: TransferActionType.BalancesUpdated
      balances: TransferState['balances']
      primaryBreakdown: TransferState['primaryBreakdown']
    }
>

export enum TransferActionType {
  ReceiverResolveChanged = 'receiverResolveChanged',
  NameServerSelectedChanged = 'nameServerSelectedChanged',
  AddressRecordsFetched = 'addressRecordsFetched',
  AddressChanged = 'addressChanged',
  TokenSelectedChanged = 'tokenSelectedChanged',
  AmountChanged = 'amountChanged',
  AmountRemoved = 'amountRemoved',
  Reset = 'reset',
  MemoChanged = 'memoChanged',
  UnsignedTxChanged = 'unsignedTxChanged',
  LinkActionChanged = 'linkActionChanged',
  BalancesUpdated = 'balancesUpdated',
}

/* istanbul ignore next */
function missingInit() {
  console.error('[@yoroi/transfer] missing initialization')
}
