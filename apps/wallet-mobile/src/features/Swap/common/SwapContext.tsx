import * as React from 'react'

import {useSelectedWallet} from '../../../SelectedWallet/Context/SelectedWalletContext'
import {useBalance, useLockedAmount} from '../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {Quantities} from '../../../yoroi-wallets/utils'

export type SwapState = {
  selectedTokenFromId: string
  selectedTokenToId: string
  yoroiUnsignedTx: YoroiUnsignedTx | undefined
}

export type SwapAction =
  | {
      type: 'resetInputsForm'
    }
  | {
      type: 'tokenFromSelectedChanged'
      tokenId: string
    }
  | {
      type: 'tokenToSelectedChanged'
      tokenId: string
    }
  | {
      type: 'yoroiUnsignedTxChanged'
      yoroiUnsignedTx: YoroiUnsignedTx | undefined
    }

type SwapActions = {
  yoroiUnsignedTxChanged: (yoroiUnsignedTx: YoroiUnsignedTx | undefined) => void
  tokenFromSelectedChanged: (tokenId: string) => void
  tokenToSelectedChanged: (tokenId: string) => void
  resetInputsForm: () => void
}

export const initialState: SwapState = {
  selectedTokenFromId: '',
  selectedTokenToId: '',
  yoroiUnsignedTx: undefined,
}

const swapReducer = (state: SwapState, action: SwapAction) => {
  switch (action.type) {
    case 'resetInputsForm':
      return {...initialState}

    case 'tokenFromSelectedChanged':
      return {
        ...state,
        selectedTokenFromId: action.tokenId,
      }

    case 'tokenToSelectedChanged':
      return {
        ...state,
        selectedTokenToId: action.tokenId,
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

const SwapContext = React.createContext<undefined | (SwapActions & SwapState)>(undefined)
export const SwapProvider = ({children, ...props}: {initialState?: Partial<SwapState>; children: React.ReactNode}) => {
  const [state, dispatch] = React.useReducer(swapReducer, {
    ...initialState,
    ...props.initialState,
  })

  const actions = React.useRef<SwapActions>({
    resetInputsForm: () => dispatch({type: 'resetInputsForm'}),

    tokenFromSelectedChanged: (tokenId: string) => {
      return dispatch({type: 'tokenFromSelectedChanged', tokenId})
    },

    tokenToSelectedChanged: (tokenId: string) => dispatch({type: 'tokenToSelectedChanged', tokenId}),

    yoroiUnsignedTxChanged: (yoroiUnsignedTx) => dispatch({type: 'yoroiUnsignedTxChanged', yoroiUnsignedTx}),
  }).current

  const context = React.useMemo(() => ({...state, ...actions}), [actions, state])

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>
}

export const useSwap = () => React.useContext(SwapContext) || missingProvider()

const missingProvider = () => {
  throw new Error('SwapProvider is missing')
}

export const useTokenQuantities = (tokenId: string) => {
  const wallet = useSelectedWallet()

  const balanceAvailable = useBalance({wallet, tokenId})

  const isPrimary = tokenId === wallet.primaryTokenInfo.id
  const primaryLocked = useLockedAmount({wallet})
  const locked = isPrimary ? primaryLocked : Quantities.zero

  const spendable = Quantities.diff(balanceAvailable, locked)

  return {
    balanceAvailable,
    locked,
    spendable,
  }
}
