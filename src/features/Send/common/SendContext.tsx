import * as React from 'react'

import {Address, Quantity, TokenId, YoroiTarget, YoroiUnsignedTx} from '../../../yoroi-wallets/types'

export type SendState = {
  selectedTargetIndex: number
  selectedTokenId: TokenId
  yoroiUnsignedTx: YoroiUnsignedTx | undefined

  memo: string

  targets: Array<YoroiTarget>
}

type TargetActions = {
  amountChanged: (quantity: Quantity) => void
  amountRemoved: (tokenId: TokenId) => void
  receiverChanged: (receiver: string) => void
  addressChanged: (address: Address) => void
}

type SendActions = {
  yoroiUnsignedTxChanged: (yoroiUnsignedTx: YoroiUnsignedTx | undefined) => void
  tokenSelectedChanged: (tokenId: TokenId) => void
  resetForm: () => void
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
    resetForm: () => dispatch({type: 'resetForm'}),

    receiverChanged: (receiver: string) => dispatch({type: 'receiverChanged', receiver}),
    addressChanged: (address: Address) => dispatch({type: 'addressChanged', address}),

    memoChanged: (memo) => dispatch({type: 'memoChanged', memo}),

    yoroiUnsignedTxChanged: (yoroiUnsignedTx) => dispatch({type: 'yoroiUnsignedTxChanged', yoroiUnsignedTx}),
    tokenSelectedChanged: (tokenId: TokenId) => dispatch({type: 'tokenSelectedChanged', tokenId}),
    amountChanged: (quantity: Quantity) => dispatch({type: 'amountChanged', quantity}),
    amountRemoved: (tokenId: TokenId) => dispatch({type: 'amountRemoved', tokenId}),
  }).current

  const context = React.useMemo(() => ({...state, ...actions}), [actions, state])

  return <SendContext.Provider value={context}>{children}</SendContext.Provider>
}

type SendAction =
  | {
      type: 'resetForm'
    }
  | {
      type: 'memoChanged'
      memo: SendState['memo']
    }
  | {
      type: 'tokenSelectedChanged'
      tokenId: TokenId
    }
  | {
      type: 'yoroiUnsignedTxChanged'
      yoroiUnsignedTx: YoroiUnsignedTx | undefined
    }

const sendReducer = (state: SendState, action: SendAction) => {
  switch (action.type) {
    case 'resetForm':
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

type TargetAction =
  | {
      type: 'receiverChanged'
      receiver: string
    }
  | {
      type: 'addressChanged'
      address: Address
    }
  | {
      type: 'tokenSelectedChanged'
      tokenId: TokenId
    }
  | {
      type: 'amountChanged'
      quantity: Quantity
    }
  | {
      type: 'amountRemoved'
      tokenId: TokenId
    }

const targetsReducer = (state: SendState, action: TargetAction) => {
  switch (action.type) {
    case 'receiverChanged': {
      const {receiver} = action
      const selectedTargetIndex = state.selectedTargetIndex
      const updatedTargets = state.targets.map((target, index) => {
        if (index === selectedTargetIndex) {
          return {...target, receiver}
        }

        return {...target}
      })

      return updatedTargets
    }

    case 'addressChanged': {
      const {address} = action
      const selectedTargetIndex = state.selectedTargetIndex
      const updatedTargets = state.targets.map((target, index) => {
        if (index === selectedTargetIndex) {
          return {...target, entry: {...target.entry, address}}
        }

        return {...target}
      })

      return updatedTargets
    }

    case 'amountChanged': {
      const {quantity} = action
      const selectedTargetIndex = state.selectedTargetIndex
      const selectedTokenId = state.selectedTokenId
      const updatedTargets = state.targets.map((target, index) => {
        if (index === selectedTargetIndex) {
          return {...target, entry: {...target.entry, amounts: {...target.entry.amounts, [selectedTokenId]: quantity}}}
        }

        return {...target}
      })

      return updatedTargets
    }

    case 'amountRemoved': {
      const {tokenId} = action
      const selectedTargetIndex = state.selectedTargetIndex
      const updatedTargets = state.targets.map((target, index) => {
        if (index === selectedTargetIndex) {
          const amounts = Object.keys(target.entry.amounts).reduce((acc, key) => {
            if (key !== tokenId) {
              acc[key] = target.entry.amounts[key]
            }

            return acc
          }, {})
          return {...target, entry: {...target.entry, amounts}}
        }

        return {...target}
      })

      return updatedTargets
    }

    default:
      return state.targets
  }
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
      receiver: '',
      entry: {
        address: '',
        amounts: {},
      },
    },
  ],
}
