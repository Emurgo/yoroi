import {useNavigation} from '@react-navigation/native'
import React from 'react'

type LoadingOverlayState = {
  isLoading: boolean
  text: React.ReactNode
}
type loadingOverlayActions = {
  startLoading: (text?: LoadingOverlayState['text']) => void
  stopLoading: () => void
}

const LoadingOverlayContext = React.createContext<undefined | (LoadingOverlayState & loadingOverlayActions)>(undefined)

export const useLoadingOverlay = () => {
  const value = React.useContext(LoadingOverlayContext)
  if (!value) {
    throw new Error('useLoadingOverlay must be used within a LoadingOverlayProvider')
  }
  return value
}

export const LoadingOverlayProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<LoadingOverlayState>
}) => {
  const [state, dispatch] = React.useReducer(loadingOverlayReducer, {...defaultState, ...initialState})
  const navigation = useNavigation()
  const actions = React.useRef<loadingOverlayActions>({
    stopLoading: () => {
      const lastRouteName = navigation.getState().routes.slice(-1)[0].name
      if (lastRouteName === 'loading') {
        dispatch({type: 'stopLoading'})
        navigation.goBack()
      }
    },
    startLoading: (text: LoadingOverlayState['text']) => {
      dispatch({type: 'startLoading', text})
      navigation.navigate('loading')
    },
  }).current

  const context = React.useMemo(() => ({...state, ...actions}), [state, actions])

  return <LoadingOverlayContext.Provider value={context}>{children}</LoadingOverlayContext.Provider>
}

type ModalAction = {type: 'startLoading'; text: LoadingOverlayState['text']} | {type: 'stopLoading'}

const loadingOverlayReducer = (state: LoadingOverlayState, action: ModalAction) => {
  switch (action.type) {
    case 'stopLoading':
      return {...state, isLoading: false}

    case 'startLoading':
      return {...state, isLoading: true, text: action.text}

    default:
      throw new Error(`loadingOverlayReducer invalid action`)
  }
}

const defaultState: LoadingOverlayState = Object.freeze({
  isLoading: false,
  text: undefined,
})
