import {produce} from 'immer'
import _ from 'lodash'
import React from 'react'

import {useSelectedWallet} from '../../../SelectedWallet'
import {useReceiveAddresses} from '../../../yoroi-wallets/hooks'

export const useReceive = () => React.useContext(ReceiveContext)

export const ReceiveProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<ReceiveState>
}) => {
  const [state, dispatch] = React.useReducer(receiveReducer, {
    ...defaultState,
    ...initialState,
  })
  const wallet = useSelectedWallet()
  const receiveAddresses = useReceiveAddresses(wallet)
  const currentAddress = _.last(receiveAddresses)

  React.useEffect(() => {
    state.defaultAddress = currentAddress ?? ''
  }, [currentAddress, state])

  const actions = React.useRef<ReceiveActions>({
    currentAddressChanged: (address: string) => dispatch({type: ReceiveActionType.CurrentAddressChanged, address}),
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
      case ReceiveActionType.CurrentAddressChanged:
        draft.selectedAddress = action.address
        break

      default:
        throw new Error(`invalid action`)
    }
  })
}

export type ReceiveType = 'single' | 'multiple'

type ReceiveAction = {type: ReceiveActionType.CurrentAddressChanged; address: string}

export type ReceiveState = {
  selectedAddress: null | string
  defaultAddress: null | string
}

type ReceiveActions = {
  currentAddressChanged: (address: string) => void
}

const defaultState: ReceiveState = Object.freeze({
  selectedAddress: null,
  defaultAddress: null,
})

function missingInit() {
  console.error('[ReceiveContext] missing initialization')
}

const initialReceiveFormContext: ReceiveContext = {
  ...defaultState,
  currentAddressChanged: missingInit,
}

enum ReceiveActionType {
  CurrentAddressChanged = 'currentAddressChanged',
}

type ReceiveContext = ReceiveState & ReceiveActions

const ReceiveContext = React.createContext<ReceiveContext>(initialReceiveFormContext)
