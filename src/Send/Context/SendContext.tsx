import * as React from 'react'

import {YoroiWallet} from '../../yoroi-wallets'
import {TokenId} from '../../yoroi-wallets/types'

type SendState = {
  tokenId: TokenId
  receiver: string
  amount: string
  sendAll: boolean
}

type SendActions = {
  receiverChanged: (receiver: SendState['receiver']) => void
  amountChanged: (amount: SendState['amount']) => void
  tokenSelected: (tokenId: SendState['tokenId']) => void
  sendAllChanged: () => void
  allTokensSelected: () => void
  resetForm: () => void
}

const SendContext = React.createContext<undefined | (SendActions & SendState)>(undefined)
export const SendProvider = ({
  children,
  wallet,
  ...props
}: {
  wallet: YoroiWallet
  initialState?: Partial<SendState>
  children: React.ReactNode
}) => {
  const [state, dispatch] = React.useReducer(sendReducer, {
    ...initialState(wallet.defaultAsset.identifier),
    ...props.initialState,
  })

  const actions = React.useRef<SendActions>({
    receiverChanged: (receiver) => dispatch({type: 'receiverChanged', receiver}),
    amountChanged: (amount) => dispatch({type: 'amountChanged', amount}),
    tokenSelected: (tokenId) => dispatch({type: 'tokenSelected', tokenId}),
    sendAllChanged: () => dispatch({type: 'sendAllChanged'}),
    allTokensSelected: () => dispatch({type: 'allTokensSelected', primaryTokenId: wallet.defaultAsset.identifier}),
    resetForm: () => dispatch({type: 'resetForm', primaryTokenId: wallet.defaultAsset.identifier}),
  }).current

  const context = React.useMemo(() => ({...state, ...actions}), [actions, state])

  return <SendContext.Provider value={context}>{children}</SendContext.Provider>
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
        sendAll: !state.sendAll,
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
        tokenId: action.primaryTokenId,
      }

    case 'resetForm':
      return initialState(action.primaryTokenId)

    default:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(`sendReducer: action type ${(action as any).type} not supported`)
  }
}

export const useSend = () => React.useContext(SendContext) || missingProvider()

const missingProvider = () => {
  throw new Error('SendProvider is missing')
}

const initialState = (primaryTokenId: TokenId) => ({
  tokenId: primaryTokenId,
  receiver: '',
  amount: '',
  sendAll: false,
})
