import {isNameServer, isResolvableDomain} from '@yoroi/resolver'
import {Chain, Links, Portfolio, Resolver, Transfer} from '@yoroi/types'
import {castDraft, freeze, produce} from 'immer'

export const combinedReducers = (
  state: TransferState,
  action: TransferAction | TargetAction,
) => {
  return {
    ...transferReducer(
      {
        ...state,
        targets: targetsReducer(state, action as TargetAction),
      },
      action as TransferAction,
    ),
  }
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
        draft.selectedTokenId = defaultTransferState.selectedTokenId
        draft.memo = defaultTransferState.memo
        draft.unsignedTx = castDraft(defaultTransferState.unsignedTx)
        draft.selectedTargetIndex = defaultTransferState.selectedTargetIndex
        draft.linkAction = castDraft(defaultTransferState.linkAction)
        draft.targets = defaultTransferState.targets
        break
    }
  })
}

const targetsReducer = (state: TransferState, action: TargetAction) => {
  return produce(state.targets, (draft) => {
    switch (action.type) {
      case TransferActionType.ReceiverResolveChanged: {
        const {resolve} = action
        const selectedTargetIndex = state.selectedTargetIndex

        draft.forEach((target, index) => {
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

        draft.forEach((target, index) => {
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

        draft.forEach((target, index) => {
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

        draft.forEach((target, index) => {
          if (index === selectedTargetIndex) {
            target.entry.amounts[selectedTokenId] = amount
          }
        })
        break
      }

      case TransferActionType.AmountRemoved: {
        const {tokenId} = action
        const selectedTargetIndex = state.selectedTargetIndex

        draft.forEach((target, index) => {
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
    selectedTargetIndex: 0,
    selectedTokenId: '.', // no problem satisfying the type here, if ptId is dif it needs init by the client
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
}

export const defaultTransferActions = {
  ...defaultTargetActions,
  ...defaultStateActions,
} as const

export type TransferState = Readonly<{
  selectedTargetIndex: number
  selectedTokenId: Portfolio.Token.Id
  unsignedTx: Chain.Cardano.UnsignedTx | undefined
  memo: string
  targets: Transfer.Targets
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
  unsignedTxChanged: (UnsignedTx: Chain.Cardano.UnsignedTx | undefined) => void
  tokenSelectedChanged: (tokenId: Portfolio.Token.Id) => void
  reset: () => void
  memoChanged: (memo: string) => void
  linkActionChanged: (linkAction: Links.YoroiAction) => void
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
      unsignedTx: Chain.Cardano.UnsignedTx | undefined
    }
  | {
      type: TransferActionType.LinkActionChanged
      linkAction: Links.YoroiAction
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
}

/* istanbul ignore next */
function missingInit() {
  console.error('[@yoroi/swap] missing initialization')
}
