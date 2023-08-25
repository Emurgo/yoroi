import React, {createContext, ReactNode, useContext, useReducer} from 'react'

type TouchedState = {
  isSellTouched: boolean
  isBuyTouched: boolean
}
type TouchedActions = {
  sellTouched: () => void
  buyTouched: () => void
  switchTouched: () => void
}

const TouchedContext = createContext<undefined | (TouchedState & TouchedActions)>(undefined)

export const useSwapTouched = () => {
  const value = useContext(TouchedContext)
  if (!value) {
    throw new Error('useSwapTouched must be used within a SwapTouchedProvider')
  }
  return value
}

export const SwapTouchedProvider = ({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: Partial<TouchedState>
}) => {
  const [state, dispatch] = useReducer(touchedReducer, {...defaultState, ...initialState})
  const actions = React.useRef<TouchedActions>({
    sellTouched: () => dispatch({type: 'sellTouched'}),
    buyTouched: () => dispatch({type: 'buyTouched'}),
    switchTouched: () => dispatch({type: 'switchTouched'}),
  }).current

  const context = React.useMemo(() => ({...state, ...actions}), [state, actions])

  return <TouchedContext.Provider value={context}>{children}</TouchedContext.Provider>
}

type TouchedAction = {type: 'sellTouched'} | {type: 'buyTouched'} | {type: 'switchTouched'}

function touchedReducer(state: TouchedState, action: TouchedAction) {
  switch (action.type) {
    case 'sellTouched':
      return {...state, isSellTouched: true}

    case 'buyTouched':
      return {...state, isBuyTouched: true}

    case 'switchTouched':
      return {
        ...state,
        isSellTouched: state.isBuyTouched,
        isBuyTouched: state.isSellTouched,
      }

    default:
      throw new Error(`touchedReducer invalid action`)
  }
}

const defaultState: TouchedState = Object.freeze({isSellTouched: true, isBuyTouched: false})
