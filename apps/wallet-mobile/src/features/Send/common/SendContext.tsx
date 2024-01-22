import {isNameServer, isResolvableDomain} from '@yoroi/resolver'
import {Balance, Resolver} from '@yoroi/types'
import {produce} from 'immer'
import * as React from 'react'

import {useSelectedWallet} from '../../../SelectedWallet/Context/SelectedWalletContext'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {useBalance, useLockedAmount} from '../../../yoroi-wallets/hooks'
import {Address, YoroiTarget, YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../yoroi-wallets/utils/utils'

export type SendState = {
  selectedTargetIndex: number
  selectedTokenId: string
  yoroiUnsignedTx: YoroiUnsignedTx | undefined

  memo: string

  targets: Array<YoroiTarget>
}

type TargetActions = {
  // Amount
  amountChanged: (quantity: Balance.Quantity) => void
  amountRemoved: (tokenId: string) => void
  // Receiver
  receiverResolveChanged: (resolve: Resolver.Receiver['resolve']) => void
  nameServerSelectedChanged: (nameServer: Resolver.Receiver['selectedNameServer']) => void
  addressRecordsFetched: (addressRecords: Resolver.Receiver['addressRecords']) => void
}

type SendActions = {
  yoroiUnsignedTxChanged: (yoroiUnsignedTx: YoroiUnsignedTx | undefined) => void
  tokenSelectedChanged: (tokenId: string) => void
  reset: () => void
  memoChanged: (memo: string) => void
}

const combinedReducers = (state: SendState, action: SendAction | TargetAction) => {
  return {
    ...sendReducer(
      {
        ...state,
        targets: targetsReducer(state, action as TargetAction),
      },
      action as SendAction,
    ),
  }
}

const SendContext = React.createContext<undefined | (SendActions & TargetActions & SendState)>(undefined)
export const SendProvider = ({children, ...props}: {initialState?: Partial<SendState>; children: React.ReactNode}) => {
  const [state, dispatch] = React.useReducer(combinedReducers, {
    ...initialState,
    ...props.initialState,
  })

  const actions = React.useRef<SendActions & TargetActions>({
    reset: () => dispatch({type: 'reset'}),

    receiverResolveChanged: (resolve: Resolver.Receiver['resolve']) =>
      dispatch({type: 'receiverResolveChanged', resolve}),
    nameServerSelectedChanged: (nameServer: Resolver.Receiver['selectedNameServer']) =>
      dispatch({type: 'nameServerSelectedChanged', nameServer}),
    addressRecordsFetched: (addressRecords: Resolver.Receiver['addressRecords']) =>
      dispatch({type: 'addressRecordsFetched', addressRecords}),

    memoChanged: (memo) => dispatch({type: 'memoChanged', memo}),

    yoroiUnsignedTxChanged: (yoroiUnsignedTx) => dispatch({type: 'yoroiUnsignedTxChanged', yoroiUnsignedTx}),
    tokenSelectedChanged: (tokenId: string) => dispatch({type: 'tokenSelectedChanged', tokenId}),
    amountChanged: (quantity: Balance.Quantity) => dispatch({type: 'amountChanged', quantity}),
    amountRemoved: (tokenId: string) => dispatch({type: 'amountRemoved', tokenId}),
  }).current

  const context = React.useMemo(() => ({...state, ...actions}), [actions, state])

  return <SendContext.Provider value={context}>{children}</SendContext.Provider>
}

export type SendAction =
  | {
      type: 'reset'
    }
  | {
      type: 'memoChanged'
      memo: SendState['memo']
    }
  | {
      type: 'tokenSelectedChanged'
      tokenId: string
    }
  | {
      type: 'yoroiUnsignedTxChanged'
      yoroiUnsignedTx: YoroiUnsignedTx | undefined
    }

const sendReducer = (state: SendState, action: SendAction) => {
  switch (action.type) {
    case 'reset':
      return {...initialState}

    case 'memoChanged':
      return {
        ...state,
        memo: action.memo,
      }

    case 'tokenSelectedChanged':
      return {
        ...state,
        selectedTokenId: action.tokenId,
      }

    case 'yoroiUnsignedTxChanged':
      return {
        ...state,
        yoroiUnsignedTx: action.yoroiUnsignedTx,
      }

    default:
      return state
  }
}

export type TargetAction =
  | {
      type: 'receiverResolveChanged'
      resolve: Resolver.Receiver['resolve']
    }
  | {
      type: 'nameServerSelectedChanged'
      nameServer: Resolver.Receiver['selectedNameServer']
    }
  | {
      type: 'addressRecordsFetched'
      addressRecords: Resolver.Receiver['addressRecords']
    }
  | {
      type: 'addressChanged'
      address: Address
    }
  | {
      type: 'tokenSelectedChanged'
      tokenId: string
    }
  | {
      type: 'amountChanged'
      quantity: Balance.Quantity
    }
  | {
      type: 'amountRemoved'
      tokenId: string
    }

const targetsReducer = (state: SendState, action: TargetAction) => {
  return produce(state.targets, (draft) => {
    switch (action.type) {
      case 'receiverResolveChanged': {
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

      case 'addressRecordsFetched': {
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

      case 'nameServerSelectedChanged': {
        const {nameServer} = action
        const selectedTargetIndex = state.selectedTargetIndex

        draft.forEach((target, index) => {
          if (index === selectedTargetIndex) {
            target.receiver.selectedNameServer = nameServer

            if (nameServer !== undefined) {
              target.entry.address = target.receiver.addressRecords?.[nameServer] ?? ''
            } else {
              const isDomain = target.receiver.as === 'domain'
              if (isDomain) target.entry.address = ''
            }
          }
        })
        break
      }

      case 'amountChanged': {
        const {quantity} = action
        const selectedTargetIndex = state.selectedTargetIndex
        const selectedTokenId = state.selectedTokenId

        draft.forEach((target, index) => {
          if (index === selectedTargetIndex) {
            target.entry.amounts[selectedTokenId] = quantity
          }
        })
        break
      }

      case 'amountRemoved': {
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

export const useSend = () => React.useContext(SendContext) || missingProvider()

const missingProvider = () => {
  throw new Error('SendProvider is missing')
}

export const initialState: SendState = {
  selectedTargetIndex: 0,
  selectedTokenId: '',
  yoroiUnsignedTx: undefined,

  memo: '',

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
}

export const useTokenQuantities = (tokenId: string) => {
  const wallet = useSelectedWallet()
  const {targets, selectedTargetIndex} = useSend()
  const initialQuantity = Amounts.getAmount(targets[selectedTargetIndex].entry.amounts, tokenId).quantity

  const balance = useBalance({wallet, tokenId})
  const used = getTotalUsedByOtherTargets({targets, selectedTokenId: tokenId, selectedTargetIndex})
  const available = Quantities.diff(balance, used)

  const isPrimary = tokenId === wallet.primaryTokenInfo.id
  const primaryLocked = useLockedAmount({wallet})
  const locked = isPrimary ? primaryLocked : Quantities.zero

  const spendable = Quantities.diff(available, locked)

  return {
    balance,
    used,
    available,
    initialQuantity,
    locked,
    spendable,
  }
}

/**
 * @summary Returns the total amount of tokens used by other targets
 * @returns Quantity
 */
const getTotalUsedByOtherTargets = ({
  targets,
  selectedTargetIndex,
  selectedTokenId,
}: {
  targets: Array<YoroiTarget>
  selectedTargetIndex: number
  selectedTokenId: string
}) => {
  const isNotTheSelectedTarget = (_target: YoroiTarget, index: number) => index !== selectedTargetIndex
  return targets.filter(isNotTheSelectedTarget).reduce((acc, target) => {
    const quantity = Amounts.getAmount(target.entry.amounts, selectedTokenId).quantity
    return Quantities.sum([acc, quantity])
  }, Quantities.zero)
}

export const useSelectedSecondaryAmountsCounter = (wallet: YoroiWallet) => {
  const {targets} = useSend()
  const isSecondaryAmount = isSecondaryAmountFilter(wallet)

  return targets.reduce((acc, target) => {
    return Amounts.toArray(target.entry.amounts).filter(isSecondaryAmount).length + acc
  }, 0)
}

const isSecondaryAmountFilter =
  (wallet: YoroiWallet) =>
  ({tokenId}: Balance.Amount) =>
    tokenId !== wallet.primaryTokenInfo.id
