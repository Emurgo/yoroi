import * as React from 'react'
import {createContext, useContext} from 'react'

import {getDefaultAssetByNetworkId} from '../../legacy/config'
import {isEmptyString} from '../../legacy/utils'
import {YoroiWallet} from '../../yoroi-wallets'
import {TokenId, YoroiAmounts} from '../../yoroi-wallets/types'

type SendProvider = {
  wallet: YoroiWallet
  balances: YoroiAmounts
}

const SendContext = createContext<undefined | SendContext>(undefined)
export const SendProvider: React.FC<SendProvider> = ({children, balances, wallet}) => {
  const [state, dispatch] = React.useReducer(sendReducer, initialState)
  const sendActions = sendActionsMapper(dispatch)
  const primaryTokenId = getDefaultAssetByNetworkId(wallet.networkId).identifier

  React.useEffect(() => {
    if (state.selectedTokenId === initialState.selectedTokenId) {
      sendActions.setSelectedTokenId(primaryTokenId)
    }
  }, [sendActions, primaryTokenId, state])

  React.useEffect(() => {
    if (primaryTokenId !== state.selectedTokenId && isEmptyString(balances[state.selectedTokenId])) {
      sendActions.setSelectedTokenId(primaryTokenId)
      sendActions.clear()
    }
  }, [primaryTokenId, balances, sendActions, state.selectedTokenId, wallet.networkId])

  return (
    <SendContext.Provider
      value={{
        sendActions,
        sendState: state,
      }}
    >
      {children}
    </SendContext.Provider>
  )
}

const initialState: SendState = {
  sendAll: false,
  selectedTokenId: 'initial',
  receiver: '',
  amount: '',
}

const sendReducer = (state, action) => {
  switch (action.type) {
    case SendActionKind.SET_SELECTED_TOKEN_IDENTIFIER:
      return {
        ...state,
        selectedTokenId: action.payload.selectedTokenId,
      }
    case SendActionKind.SET_RECEIVER:
      return {
        ...state,
        receiver: action.payload.receiver,
      }
    case SendActionKind.SET_SEND_ALL:
      return {
        ...state,
        sendAll: action.payload.sendAll,
      }
    case SendActionKind.SET_AMOUNT:
      return {
        ...state,
        amount: action.payload.amount,
      }
    case SendActionKind.CLEAR:
      return {
        ...initialState,
        selectedTokenId: state.selectedTokenId,
      }
    default:
      throw new Error(`sendReducer: action type ${action.type} not supported`)
  }
}

type SendContext = {
  sendActions: ReturnType<typeof sendActionsMapper>
  sendState: SendState
}

export const useSend = () => useContext(SendContext) || missingProvider()

const missingProvider = () => {
  throw new Error('SendProvider is missing')
}

type SendActionMap = {
  setSelectedTokenId: (selectedTokenId: SendState['selectedTokenId']) => void
  setReceiver: (receiver: SendState['receiver']) => void
  setSendAll: (sendAll: SendState['sendAll']) => void
  setAmount: (amount: SendState['amount']) => void
  clear: () => void
}

const sendActionsMapper = (dispatch: SendDispatch): SendActionMap => ({
  setSelectedTokenId: (selectedTokenId) =>
    dispatch({
      type: SendActionKind.SET_SELECTED_TOKEN_IDENTIFIER,
      payload: {
        selectedTokenId,
      },
    }),
  setReceiver: (receiver) =>
    dispatch({
      type: SendActionKind.SET_RECEIVER,
      payload: {
        receiver,
      },
    }),
  setSendAll: (sendAll) =>
    dispatch({
      type: SendActionKind.SET_SEND_ALL,
      payload: {
        sendAll,
      },
    }),
  setAmount: (amount) =>
    dispatch({
      type: SendActionKind.SET_AMOUNT,
      payload: {
        amount,
      },
    }),
  clear: () =>
    dispatch({
      type: SendActionKind.CLEAR,
      payload: {},
    }),
})

enum SendActionKind {
  SET_SELECTED_TOKEN_IDENTIFIER = 'SET_SELECTED_TOKEN_IDENTIFIER',
  SET_RECEIVER = 'SET_RECEIVER',
  SET_SEND_ALL = 'SET_SEND_ALL',
  SET_AMOUNT = 'SET_AMOUNT',
  CLEAR = 'CLEAR',
}

type SendState = {
  sendAll: boolean
  selectedTokenId: TokenId
  receiver: string
  amount: string
}
type SendAction = {
  type: SendActionKind
  payload: Partial<SendState>
}
type SendDispatch = React.Dispatch<SendAction>
