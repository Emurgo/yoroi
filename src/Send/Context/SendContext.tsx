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
    selectedTokenId: primaryTokenId,
  })

  const actions = React.useRef({
    receiverChanged: (receiver) => dispatch({type: 'receiverChanged', receiver}),
    amountChanged: (amount) => dispatch({type: 'amountChanged', amount}),
    sendAllCanged: () => dispatch({type: 'sendAllCanged'}),
    tokenSelected: (selectedTokenId) => dispatch({type: 'tokenSelected', selectedTokenId}),
    allTokensSelected: () => dispatch({type: 'allTokensSelected', primaryTokenId}),
    resetForm: () => dispatch({type: 'resetForm', primaryTokenId}),
  }).current

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
      selectedTokenId: state.selectedTokenId != null ? state.selectedTokenId : primaryTokenId,
    }),
    [actions, primaryTokenId, state],
  )

  return <SendContext.Provider value={context}>{children}</SendContext.Provider>
}

const initialState: SendState = {
  sendAll: false,
  selectedTokenId: '',
  receiver: '',
  amount: '',
}

const sendReducer = (state, action) => {
  switch (action.type) {
    case 'receiverChanged':
      return {
        ...state,
        receiver: action.receiver,
      }
    case 'amountChanged':
      return {
        ...state,
        amount: action.amount,
      }
    case 'sendAllCanged':
      return {
        ...state,
        sendAll: state.sendAll === true ? false : true,
      }
    case 'tokenSelected':
      return {
        ...state,
        sendAll: false,
        selectedTokenId: action.selectedTokenId,
      }
    case 'allTokensSelected':
      return {
        ...state,
        sendAll: true,
        selectedTokenId: action.primaryTokenId,
      }
    case 'resetForm':
      return {
        ...initialState,
        selectedTokenId: action.primaryTokenId,
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
  sendAll: boolean
  selectedTokenId: TokenId
  receiver: string
  amount: string
}

type SendContext = SendState & {
  receiverChanged: (receiver: SendState['receiver']) => void
  changeSendAll: (sendAll: SendState['sendAll']) => void
  amountChanged: (amount: SendState['amount']) => void
  sendAllCanged: () => void
  tokenSelected: (selectedTokenId: SendState['selectedTokenId']) => void
  allTokensSelected: () => void
  resetForm: () => void
}
