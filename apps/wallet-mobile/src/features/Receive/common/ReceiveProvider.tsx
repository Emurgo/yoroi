import {produce} from 'immer'
import _ from 'lodash'
import React from 'react'

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

  const actions = React.useRef<ReceiveActions>({
    selectedAddressChanged: (address: string) => dispatch({type: ReceiveActionType.SelectedAddressChanged, address}),
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
      case ReceiveActionType.SelectedAddressChanged:
        draft.selectedAddress = action.address
        break

      default:
        throw new Error('[ReceiverContext] invalid action')
    }
  })
}

type ReceiveAction = {type: ReceiveActionType.SelectedAddressChanged; address: string}

export type ReceiveState = {
  selectedAddress: string
  defaultAddress: string
}

type ReceiveActions = {
  selectedAddressChanged: (address: string) => void
}

const defaultState: ReceiveState = Object.freeze({
  selectedAddress: '',
  defaultAddress: '',
})

function missingInit() {
  console.error('[ReceiveContext] missing initialization')
}

const initialReceiveContext: ReceiveContext = {
  ...defaultState,
  selectedAddressChanged: missingInit,
}

enum ReceiveActionType {
  SelectedAddressChanged = 'selectedAddressChanged',
}

type ReceiveContext = ReceiveState & ReceiveActions

const ReceiveContext = React.createContext<ReceiveContext>(initialReceiveContext)
