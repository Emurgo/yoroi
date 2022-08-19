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
  const primaryTokenId = getDefaultAssetByNetworkId(wallet.networkId).identifier

  const [state, dispatch] = React.useReducer(sendReducer, {...initialState, selectedTokenId: primaryTokenId})
  const sendActions = sendActionsMapper(dispatch)

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
  selectedTokenId: '',
  receiver: '',
  amount: '',
}

const sendReducer = (state, action) => {
  switch (action.type) {
    case SendActionTypes.SET_SELECTED_TOKEN_ID:
      return {
        ...state,
        selectedTokenId: action.payload.selectedTokenId,
      }
    case SendActionTypes.SET_RECEIVER:
      return {
        ...state,
        receiver: action.payload.receiver,
      }
    case SendActionTypes.SET_SEND_ALL:
      return {
        ...state,
        sendAll: action.payload.sendAll,
      }
    case SendActionTypes.SET_AMOUNT:
      return {
        ...state,
        amount: action.payload.amount,
      }
    case SendActionTypes.CLEAR:
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
      type: SendActionTypes.SET_SELECTED_TOKEN_ID,
      payload: {
        selectedTokenId,
      },
    }),
  setReceiver: (receiver) =>
    dispatch({
      type: SendActionTypes.SET_RECEIVER,
      payload: {
        receiver,
      },
    }),
  setSendAll: (sendAll) =>
    dispatch({
      type: SendActionTypes.SET_SEND_ALL,
      payload: {
        sendAll,
      },
    }),
  setAmount: (amount) =>
    dispatch({
      type: SendActionTypes.SET_AMOUNT,
      payload: {
        amount,
      },
    }),
  clear: () =>
    dispatch({
      type: SendActionTypes.CLEAR,
      payload: {},
    }),
})

enum SendActionTypes {
  SET_SELECTED_TOKEN_ID = 'SET_SELECTED_TOKEN_ID',
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
  type: SendActionTypes
  payload: Partial<SendState>
}
type SendDispatch = React.Dispatch<SendAction>
