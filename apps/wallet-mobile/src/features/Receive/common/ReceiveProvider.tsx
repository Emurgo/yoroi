import {produce} from 'immer'
import React from 'react'
// import {TextInput} from 'react-native'

// import {useLanguage} from '../../../i18n'
// import {useSelectedWallet} from '../../../SelectedWallet'
// import {useBalances} from '../../../yoroi-wallets/hooks'
// import {useStrings} from './useStrings'

export const useReceive = () => React.useContext(ReceiveContext)

export const ReceiveProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<ReceiveState>
}) => {
  // const wallet = useSelectedWallet()
  // const {numberLocale} = useLanguage()

  // const amountInputRef = React.useRef<TextInput | null>(null)

  const [state, dispatch] = React.useReducer(receiveReducer, {
    ...defaultState,
    ...initialState,
  })

  // const balances = useBalances(wallet)

  // const strings = useStrings()

  const actions = React.useRef<ReceiveActions>({
    receiveTypeChanged: (receiveType: ReceiveType) =>
      dispatch({type: ReceiveActionType.ReceiveTypeChanged, receiveType}),
  }).current

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions],
  )

  return <ReceiveContext.Provider value={context}>{children}</ReceiveContext.Provider>
}

const receiveReducer = (state: ReceiveState, action: ReceiveAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case ReceiveActionType.ReceiveTypeChanged:
        draft.receiveType = action.receiveType
        break

      // TODO add form validation and logic in provider
      default:
        throw new Error(`RequestFormReducer invalid action`)
    }
  })
}

export type ReceiveType = 'single' | 'multiple'

type ReceiveAction = {type: ReceiveActionType.ReceiveTypeChanged; receiveType: ReceiveType}

export type ReceiveState = {
  receiveType: ReceiveType
  addressDetails: {
    currentAddress: string
    spendingHash: string
    stakingHash: string
    error: string | undefined
  }
  canRequestAmount: boolean
}

type ReceiveActions = {
  receiveTypeChanged: (type: ReceiveType) => void
}

const defaultState: ReceiveState = Object.freeze({
  receiveType: 'single',
  addressDetails: {
    currentAddress: '',
    spendingHash: '',
    stakingHash: '',
    error: undefined,
  },
  canRequestAmount: false,
})

function missingInit() {
  console.error('[ReceiveContext] missing initialization')
}

const initialReceiveFormContext: ReceiveContext = {
  ...defaultState,
  receiveTypeChanged: missingInit,
}

enum ReceiveActionType {
  ReceiveTypeChanged = 'receiveTypeChanged',
}

type ReceiveContext = ReceiveState & ReceiveActions

const ReceiveContext = React.createContext<ReceiveContext>(initialReceiveFormContext)
