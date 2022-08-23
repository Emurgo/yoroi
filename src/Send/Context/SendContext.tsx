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
    tokenId: primaryTokenId,
  })

  const actions = React.useRef({
    receiverChanged: (receiver) => dispatch({type: 'receiverChanged', receiver}),
    amountChanged: (amount) => dispatch({type: 'amountChanged', amount}),
    tokenSelected: (tokenId) => dispatch({type: 'tokenSelected', tokenId}),
    sendAllChanged: () => dispatch({type: 'sendAllChanged'}),
    allTokensSelected: () => dispatch({type: 'allTokensSelected', primaryTokenId}),
    resetForm: () => dispatch({type: 'resetForm', primaryTokenId}),
  }).current

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
      tokenId: state.tokenId !== undefined ? state.tokenId : primaryTokenId,
    }),
    [actions, primaryTokenId, state],
  )

  return <SendContext.Provider value={context}>{children}</SendContext.Provider>
}

const initialState: SendState = {
  sendAll: false,
  tokenId: '',
  receiver: '',
  amount: '',
}

type SendAction =
  | {
      type: 'receiverChanged'
      receiver: string
    }
  | {
      type: 'amountChanged'
      amount: string
    }
  | {
      type: 'sendAllChanged'
    }
  | {
      type: 'allTokensSelected'
      primaryTokenId: TokenId
    }
  | {
      type: 'resetForm'
      primaryTokenId: TokenId
    }
  | {
      type: 'tokenSelected'
      tokenId: SendState['tokenId']
    }
  | {type: undefined | null}

const sendReducer = (state: SendState, action: SendAction) => {
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
    case 'sendAllChanged':
      return {
        ...state,
        sendAll: state.sendAll === true ? false : true,
      }
    case 'tokenSelected':
      return {
        ...state,
        sendAll: false,
        tokenId: action.tokenId,
      }
    case 'allTokensSelected':
      return {
        ...state,
        sendAll: true,
        tokenId: undefined,
      }
    case 'resetForm':
      return {
        ...initialState,
        tokenId: undefined,
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
  tokenId: TokenId | undefined
  receiver: string
  amount: string
}

type SendContext = Pick<SendState, 'sendAll' | 'receiver' | 'amount'> & {
  tokenId: TokenId
  receiverChanged: (receiver: SendState['receiver']) => void
  amountChanged: (amount: SendState['amount']) => void
  tokenSelected: (tokenId: SendState['tokenId']) => void
  sendAllChanged: () => void
  allTokensSelected: () => void
  resetForm: () => void
}
