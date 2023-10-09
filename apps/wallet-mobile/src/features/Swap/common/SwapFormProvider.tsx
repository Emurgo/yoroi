import React, {createContext, ReactNode, useContext, useReducer} from 'react'

type TouchedState = {
  isSellTouched: boolean
  isBuyTouched: boolean
  isPoolTouched: boolean
}
type TouchedActions = {
  sellTouched: () => void
  buyTouched: () => void
  switchTouched: () => void
  poolTouched: () => void
  poolDefaulted: () => void
  resetTouches: () => void
}

const TouchedContext = createContext<undefined | (TouchedState & TouchedActions)>(undefined)

export const useSwapTouched = () => {
  const value = useContext(TouchedContext)
  if (!value) {
    throw new Error('useSwapTouched must be used within a SwapFormProvider')
  }
  return value
}

export const SwapFormProvider = ({
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
    poolTouched: () => dispatch({type: 'poolTouched'}),
    poolDefaulted: () => dispatch({type: 'poolDefaulted'}),
    resetTouches: () => dispatch({type: 'resetTouches'}),
  }).current

  const context = React.useMemo(() => ({...state, ...actions}), [state, actions])

  return <TouchedContext.Provider value={context}>{children}</TouchedContext.Provider>
}

type TouchedAction =
  | {type: 'sellTouched'}
  | {type: 'buyTouched'}
  | {type: 'switchTouched'}
  | {type: 'poolTouched'}
  | {type: 'poolDefaulted'}
  | {type: 'resetTouches'}

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

    case 'poolTouched':
      return {...state, isPoolTouched: true}

    case 'poolDefaulted':
      return {...state, isPoolTouched: false}

    case 'resetTouches':
      return defaultState

    default:
      throw new Error(`touchedReducer invalid action`)
  }
}

const defaultState: TouchedState = Object.freeze({isSellTouched: true, isBuyTouched: false, isPoolTouched: false})
