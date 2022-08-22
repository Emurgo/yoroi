import * as React from 'react'

import {getDefaultAssetByNetworkId} from '../../legacy/config'
import {YoroiWallet} from '../../yoroi-wallets'
import {TokenId} from '../../yoroi-wallets/types'

type SendProvider = {
  wallet: YoroiWallet
}

const SendContext = React.createContext<undefined | SendContext>(undefined)
export const SendProvider: React.FC<SendProvider> = ({children, wallet}) => {
  const primaryTokenId = getDefaultAssetByNetworkId(wallet.networkId).identifier

  const [state, dispatch] = React.useReducer(sendReducer, {
    ...initialState,
    primaryTokenId,
    selectedTokenId: primaryTokenId,
  })

  return (
    <SendContext.Provider
      value={{
        ...state,
        changeSelectedTokenId: (selectedTokenId) =>
          dispatch({
            type: 'changeSelectedTokenId',
            payload: {
              selectedTokenId,
            },
          }),
        changeReceiver: (receiver) =>
          dispatch({
            type: 'changeReceiver',
            payload: {
              receiver,
            },
          }),
        changeAmount: (amount) =>
          dispatch({
            type: 'changeAmount',
            payload: {
              amount,
            },
          }),
        toggleSendAll: () =>
          dispatch({
            type: 'toggleSendAll',
            payload: {},
          }),
        onTokenSelected: (selectedTokenId) =>
          dispatch({
            type: 'onTokenSelected',
            payload: {
              selectedTokenId,
            },
          }),
        onSendAllSelected: () =>
          dispatch({
            type: 'onSendAllSelected',
            payload: {
              primaryTokenId,
            },
          }),
        resetForm: () =>
          dispatch({
            type: 'resetForm',
            payload: {},
          }),
      }}
    >
      {children}
    </SendContext.Provider>
  )
}

const initialState: SendState = {
  sendAll: false,
  primaryTokenId: '',
  selectedTokenId: '',
  receiver: '',
  amount: '',
}

const sendReducer = (state, action) => {
  switch (action.type) {
    case 'changeSelectedTokenId':
      return {
        ...state,
        selectedTokenId: action.payload.selectedTokenId,
      }
    case 'changeReceiver':
      return {
        ...state,
        receiver: action.payload.receiver,
      }
    case 'changeAmount':
      return {
        ...state,
        amount: action.payload.amount,
      }
    case 'toggleSendAll':
      return {
        ...state,
        sendAll: state.sendAll === true ? false : true,
      }
    case 'onTokenSelected':
      return {
        ...state,
        sendAll: false,
        selectedTokenId: action.payload.selectedTokenId,
      }
    case 'onSendAllSelected':
      return {
        ...state,
        sendAll: true,
        selectedTokenId: action.payload.primaryTokenId,
      }
    case 'resetForm':
      return {
        ...initialState,
        selectedTokenId: state.primaryTokenId,
      }
    default:
      throw new Error(`sendReducer: action type ${action.type} not supported`)
  }
}

export const useSend = () => React.useContext(SendContext) || missingProvider()

const missingProvider = () => {
  throw new Error('SendProvider is missing')
}

type SendState = {
  primaryTokenId: TokenId
  sendAll: boolean
  selectedTokenId: TokenId
  receiver: string
  amount: string
}

type SendContext = SendState & {
  changeSelectedTokenId: (selectedTokenId: SendState['selectedTokenId']) => void
  changeReceiver: (receiver: SendState['receiver']) => void
  changeSendAll: (sendAll: SendState['sendAll']) => void
  changeAmount: (amount: SendState['amount']) => void
  toggleSendAll: () => void
  onTokenSelected: (selectedTokenId: SendState['selectedTokenId']) => void
  onSendAllSelected: () => void
  resetForm: () => void
}
