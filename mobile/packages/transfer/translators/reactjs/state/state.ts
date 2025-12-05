import {getLogger} from '@yoroi/common'
import {isNameServer, isResolvableDomain} from '@yoroi/resolver'
import {
  Address,
  Branded,
  Chain,
  Links,
  Portfolio,
  Resolver,
  Transfer,
} from '@yoroi/types'

import {castDraft, freeze, produce} from 'immer'

import {targetGetAllocatedToOthers} from '../../../helpers/target-get-allocated-to-others'
import {TransferAllocatedToOtherTargets} from '../../../types'

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
      // Memo is now handled in ReviewTx, removed from transfer package
      case TransferActionType.TokenSelectedChanged:
        draft.selectedTokenId = action.tokenId
        break
      case TransferActionType.LinkActionChanged:
        draft.linkAction = castDraft(action.linkAction)
        break
      case TransferActionType.TargetIndexSelected:
        if (action.index >= 0 && action.index < draft.targets.length) {
          draft.selectedTargetIndex = action.index
        }
        break
      case TransferActionType.TargetAdded:
        draft.targets.push({
          receiver: {
            resolve: '',
            as: 'address',
            selectedNameServer: undefined,
            addressRecords: undefined,
          },
          entry: {
            address: '' as Address,
            amounts: {},
          },
        })
        // Select the newly added target
        draft.selectedTargetIndex = draft.targets.length - 1
        break
      case TransferActionType.TargetRemoved:
        if (action.index >= 0 && action.index < draft.targets.length) {
          draft.targets.splice(action.index, 1)
          // Adjust selected index if needed
          if (draft.selectedTargetIndex >= draft.targets.length) {
            draft.selectedTargetIndex = Math.max(0, draft.targets.length - 1)
          } else if (draft.selectedTargetIndex > action.index) {
            draft.selectedTargetIndex = draft.selectedTargetIndex - 1
          }
          // Recalculate allocated amounts
          draft.allocated = targetGetAllocatedToOthers({targets: draft.targets})
        }
        break
      case TransferActionType.Reset:
        draft.allocated = defaultTransferState.allocated
        draft.selectedTargetIndex = defaultTransferState.selectedTargetIndex
        draft.selectedTokenId = defaultTransferState.selectedTokenId
        draft.unsignedTx = castDraft(defaultTransferState.unsignedTx)
        draft.linkAction = castDraft(defaultTransferState.linkAction)
        draft.targets = defaultTransferState.targets
        break
    }
  })
}

const targetsReducer = (state: TransferState, action: TargetAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case TransferActionType.ReceiverResolveChanged: {
        const {resolve, targetIndex} = action
        // Use provided targetIndex or fall back to selectedTargetIndex for backward compatibility
        const targetIndexToUse = targetIndex ?? state.selectedTargetIndex

        if (
          targetIndexToUse >= 0 &&
          targetIndexToUse < draft.targets.length &&
          draft.targets[targetIndexToUse]
        ) {
          const target = draft.targets[targetIndexToUse]!
          const isDomain: boolean = isResolvableDomain(resolve)
          const as: Resolver.Receiver['as'] = isDomain ? 'domain' : 'address'
          target.receiver = {
            resolve,
            as,
            selectedNameServer: undefined,
            addressRecords: undefined,
          }
          target.entry.address = isDomain
            ? ('' as Address)
            : Branded.asAddress(resolve)
        }
        break
      }

      case TransferActionType.AddressRecordsFetched: {
        const {addressRecords, targetIndex} = action
        // Use provided targetIndex or fall back to selectedTargetIndex for backward compatibility
        const targetIndexToUse = targetIndex ?? state.selectedTargetIndex

        if (
          targetIndexToUse >= 0 &&
          targetIndexToUse < draft.targets.length &&
          draft.targets[targetIndexToUse]
        ) {
          const target = draft.targets[targetIndexToUse]!
          if (addressRecords !== undefined) {
            const keys = Object.keys(addressRecords).filter(isNameServer)
            const nameServer = keys.length === 1 ? keys[0] : undefined
            target.receiver.selectedNameServer = nameServer
            if (nameServer !== undefined) {
              const addr = addressRecords[nameServer] ?? ''
              target.entry.address = addr
                ? Branded.asAddress(addr)
                : ('' as Address)
            }
          } else {
            target.receiver.selectedNameServer = undefined
          }
          target.receiver.addressRecords = addressRecords
        }
        break
      }

      case TransferActionType.NameServerSelectedChanged: {
        const {nameServer, targetIndex} = action
        // Use provided targetIndex or fall back to selectedTargetIndex for backward compatibility
        const targetIndexToUse = targetIndex ?? state.selectedTargetIndex

        if (
          targetIndexToUse >= 0 &&
          targetIndexToUse < draft.targets.length &&
          draft.targets[targetIndexToUse]
        ) {
          const target = draft.targets[targetIndexToUse]!
          target.receiver.selectedNameServer = nameServer

          if (nameServer !== undefined) {
            const addr = target.receiver.addressRecords?.[nameServer] ?? ''
            target.entry.address = addr
              ? Branded.asAddress(addr)
              : ('' as Address)
          } else {
            const isDomain = target.receiver.as === 'domain'
            if (isDomain) target.entry.address = '' as Address
          }
        }
        break
      }

      case TransferActionType.AmountChanged: {
        const {amount, targetIndex} = action
        // Use provided targetIndex or fall back to selectedTargetIndex for backward compatibility
        const targetIndexToUse = targetIndex ?? state.selectedTargetIndex
        const selectedTokenId = state.selectedTokenId

        if (
          targetIndexToUse >= 0 &&
          targetIndexToUse < draft.targets.length &&
          draft.targets[targetIndexToUse]
        ) {
          draft.targets[targetIndexToUse]!.entry.amounts[selectedTokenId] =
            amount
        }
        draft.allocated = targetGetAllocatedToOthers({targets: draft.targets})
        break
      }

      case TransferActionType.AmountRemoved: {
        const {tokenId, targetIndex} = action
        // Use provided targetIndex or fall back to selectedTargetIndex for backward compatibility
        const targetIndexToUse = targetIndex ?? state.selectedTargetIndex

        if (
          targetIndexToUse >= 0 &&
          targetIndexToUse < draft.targets.length &&
          draft.targets[targetIndexToUse]
        ) {
          delete draft.targets[targetIndexToUse]!.entry.amounts[tokenId]
        }
        draft.allocated = targetGetAllocatedToOthers({targets: draft.targets})
        break
      }

      case TransferActionType.AddTokenToTarget: {
        const {targetIndex, token} = action
        if (
          targetIndex >= 0 &&
          targetIndex < draft.targets.length &&
          draft.targets[targetIndex]
        ) {
          draft.targets[targetIndex]!.entry.amounts[token.info.id] = token
        }
        draft.allocated = targetGetAllocatedToOthers({targets: draft.targets})
        break
      }

      case TransferActionType.RemoveTokenFromTarget: {
        const {targetIndex, tokenId} = action
        if (
          targetIndex >= 0 &&
          targetIndex < draft.targets.length &&
          draft.targets[targetIndex]
        ) {
          delete draft.targets[targetIndex]!.entry.amounts[tokenId]
        }
        draft.allocated = targetGetAllocatedToOthers({targets: draft.targets})
        break
      }

      case TransferActionType.UpdateTokenAmountForTarget: {
        const {targetIndex, tokenId, quantity} = action
        if (
          targetIndex >= 0 &&
          targetIndex < draft.targets.length &&
          draft.targets[targetIndex]?.entry.amounts[tokenId]
        ) {
          draft.targets[targetIndex]!.entry.amounts[tokenId]!.quantity =
            quantity
        }
        draft.allocated = targetGetAllocatedToOthers({targets: draft.targets})
        break
      }
    }
  })
}

export const defaultTransferState: TransferState = freeze(
  {
    allocated: new Map(),

    selectedTargetIndex: 0,
    selectedTokenId: '.' as Portfolio.Token.Id, // it's ok satisfying the type here, if ptId is dif it needs init by the client
    unsignedTx: undefined,
    // Memo removed - now handled in ReviewTx

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
          address: '' as Address,
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
  addTokenToTarget: missingInit,
  removeTokenFromTarget: missingInit,
  updateTokenAmountForTarget: missingInit,
}

const defaultStateActions: TransferActions = {
  unsignedTxChanged: missingInit,
  tokenSelectedChanged: missingInit,
  reset: missingInit,
  // memoChanged removed - now handled in ReviewTx
  linkActionChanged: missingInit,
  targetAdded: missingInit,
  targetRemoved: missingInit,
  targetIndexSelected: missingInit,
}

export const defaultTransferActions = {
  ...defaultTargetActions,
  ...defaultStateActions,
} as const

export type TransferState = Readonly<{
  // inputs
  selectedTargetIndex: number
  selectedTokenId: Portfolio.Token.Id
  unsignedTx: Chain.Cardano.UnsignedTx | undefined
  // Memo removed - now handled in ReviewTx via ReviewTxMemoProvider

  // derived state
  targets: Transfer.Targets
  allocated: TransferAllocatedToOtherTargets

  // injected when deeplink request transfer
  linkAction: Links.YoroiAction | undefined
}>

export type TargetActions = Readonly<{
  // Amount (uses selectedTargetIndex if targetIndex not provided)
  amountChanged: (amount: Portfolio.Token.Amount, targetIndex?: number) => void
  amountRemoved: (tokenId: Portfolio.Token.Id, targetIndex?: number) => void
  // Receiver (uses selectedTargetIndex if targetIndex not provided)
  receiverResolveChanged: (
    resolve: Resolver.Receiver['resolve'],
    targetIndex?: number,
  ) => void
  nameServerSelectedChanged: (
    nameServer: Resolver.Receiver['selectedNameServer'],
    targetIndex?: number,
  ) => void
  addressRecordsFetched: (
    addressRecords: Resolver.Receiver['addressRecords'],
    targetIndex?: number,
  ) => void
  // Target-specific actions (require targetIndex)
  addTokenToTarget: (targetIndex: number, token: Portfolio.Token.Amount) => void
  removeTokenFromTarget: (
    targetIndex: number,
    tokenId: Portfolio.Token.Id,
  ) => void
  updateTokenAmountForTarget: (
    targetIndex: number,
    tokenId: Portfolio.Token.Id,
    quantity: Portfolio.Token.Amount['quantity'],
  ) => void
}>

export type TransferActions = Readonly<{
  unsignedTxChanged: (UnsignedTx: Chain.Cardano.UnsignedTx | undefined) => void
  tokenSelectedChanged: (tokenId: Portfolio.Token.Id) => void
  reset: () => void
  // memoChanged removed - now handled in ReviewTx
  linkActionChanged: (linkAction: Links.YoroiAction) => void
  targetAdded: () => void
  targetRemoved: (index: number) => void
  targetIndexSelected: (index: number) => void
}>

export type TargetAction = Readonly<
  | {
      type: TransferActionType.ReceiverResolveChanged
      resolve: Resolver.Receiver['resolve']
      targetIndex?: number
    }
  | {
      type: TransferActionType.NameServerSelectedChanged
      nameServer: Resolver.Receiver['selectedNameServer']
      targetIndex?: number
    }
  | {
      type: TransferActionType.AddressRecordsFetched
      addressRecords: Resolver.Receiver['addressRecords']
      targetIndex?: number
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
      targetIndex?: number
    }
  | {
      type: TransferActionType.AmountRemoved
      tokenId: Portfolio.Token.Id
      targetIndex?: number
    }
  | {
      type: TransferActionType.AddTokenToTarget
      targetIndex: number
      token: Portfolio.Token.Amount
    }
  | {
      type: TransferActionType.RemoveTokenFromTarget
      targetIndex: number
      tokenId: Portfolio.Token.Id
    }
  | {
      type: TransferActionType.UpdateTokenAmountForTarget
      targetIndex: number
      tokenId: Portfolio.Token.Id
      quantity: Portfolio.Token.Amount['quantity']
    }
>

export type TransferAction = Readonly<
  | {
      type: TransferActionType.Reset
    }
  // MemoChanged removed - now handled in ReviewTx
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
  | {
      type: TransferActionType.TargetAdded
    }
  | {
      type: TransferActionType.TargetRemoved
      index: number
    }
  | {
      type: TransferActionType.TargetIndexSelected
      index: number
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
  // MemoChanged removed - now handled in ReviewTx
  UnsignedTxChanged = 'unsignedTxChanged',
  LinkActionChanged = 'linkActionChanged',
  TargetAdded = 'targetAdded',
  TargetRemoved = 'targetRemoved',
  TargetIndexSelected = 'targetIndexSelected',
  AddTokenToTarget = 'addTokenToTarget',
  RemoveTokenFromTarget = 'removeTokenFromTarget',
  UpdateTokenAmountForTarget = 'updateTokenAmountForTarget',
}

/* istanbul ignore next */
function missingInit() {
  getLogger().error('[@yoroi/transfer] missing initialization', {
    origin: 'transfer',
  })
}
