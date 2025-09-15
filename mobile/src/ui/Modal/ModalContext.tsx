import {App} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Keyboard} from 'react-native'

type ModalState = {
  isOpen: boolean
  content: React.ReactNode
  height: number
  footer: React.ReactNode | undefined
  isLoading: boolean
  canDiscard: boolean
  withFeedback: boolean
  title: string
  canContinue?: boolean
  onClose?: () => void
  full?: boolean
}
type ModalActions = {
  openModal: (args: {
    content: React.ReactNode
    height?: number
    footer?: React.ReactNode
    isLoading?: boolean
    canDiscard?: boolean
    withFeedback?: boolean
    title?: string
    canContinue?: boolean
    onClose?: () => void
    full?: boolean
  }) => void
  closeModal: () => void
  setLoading: (isLoading: boolean) => void
  setFooter: (footer: React.ReactNode | undefined) => void
  setTitle: (title: string) => void
  setCanDiscard: (canDiscard: boolean) => void
  setCanContinue: (canContinue: boolean) => void
}

const ModalContext = React.createContext<
  undefined | (ModalState & ModalActions)
>(undefined)

export const useModal = () => {
  const value = React.useContext(ModalContext)
  if (!value) {
    throw new App.Errors.InvalidState(
      'useModal must be used within a ModalProvider',
    )
  }
  return value
}

type Props = React.PropsWithChildren<{
  initialState?: Partial<ModalState>
}>

export const ModalProvider = ({children, initialState}: Props) => {
  const navigation = useNavigation()
  const [state, dispatch] = React.useReducer(modalReducer, {
    ...defaultState,
    ...initialState,
  })
  const isOpenRef = React.useRef(state.isOpen)

  // Keep ref in sync with state
  React.useEffect(() => {
    isOpenRef.current = state.isOpen
  }, [state.isOpen])

  const closeModal = React.useCallback(() => {
    if (state.onClose) {
      state.onClose()
    }
    dispatch({
      type: 'close',
    })
  }, [state])

  const openModal = React.useCallback(
    ({
      content,
      height,
      footer,
      isLoading,
      canDiscard,
      withFeedback,
      title,
      canContinue,
      onClose,
      full,
    }: {
      content: React.ReactNode
      height?: number
      footer?: React.ReactNode
      isLoading?: boolean
      canDiscard?: boolean
      withFeedback?: boolean
      title?: string
      canContinue?: boolean
      onClose?: () => void
      full?: boolean
    }) => {
      Keyboard.dismiss()
      dispatch({
        type: 'open',
        content,
        height,
        footer,
        isLoading,
        canDiscard,
        withFeedback,
        title,
        canContinue,
        onClose,
        full,
      })
    },
    [],
  )

  const setLoading = React.useCallback((isLoading: boolean) => {
    dispatch({
      type: 'setLoading',
      isLoading,
    })
  }, [])

  const setFooter = React.useCallback((footer: React.ReactNode | undefined) => {
    dispatch({
      type: 'setFooter',
      footer,
    })
  }, [])

  const setWithFeedback = React.useCallback((withFeedback: boolean) => {
    dispatch({
      type: 'setWithFeedback',
      withFeedback,
    })
  }, [])

  const setTitle = React.useCallback((title: string) => {
    dispatch({
      type: 'setTitle',
      title,
    })
  }, [])

  const setCanDiscard = React.useCallback((canDiscard: boolean) => {
    dispatch({
      type: 'setCanDiscard',
      canDiscard,
    })
  }, [])

  const setCanContinue = React.useCallback((canContinue: boolean) => {
    dispatch({
      type: 'setCanContinue',
      canContinue,
    })
  }, [])

  const actions = React.useMemo<ModalActions>(
    () => ({
      closeModal,
      openModal,
      setLoading,
      setFooter,
      setWithFeedback,
      setTitle,
      setCanDiscard,
      setCanContinue,
    }),
    [
      closeModal,
      openModal,
      setLoading,
      setFooter,
      setWithFeedback,
      setTitle,
      setCanDiscard,
      setCanContinue,
    ],
  )

  const context = React.useMemo(
    () => ({...state, ...actions}),
    [state, actions],
  )

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      if (isOpenRef.current) {
        closeModal()
      }
    })
    return unsubscribe
  }, [navigation, closeModal])

  return (
    <ModalContext.Provider value={context}>{children}</ModalContext.Provider>
  )
}

type ModalAction =
  | {
      type: 'open'
      content: ModalState['content']
      height?: number
      footer?: React.ReactNode
      isLoading?: boolean
      canDiscard?: boolean
      withFeedback?: boolean
      title?: string
      canContinue?: boolean
      onClose?: () => void
      full?: boolean
    }
  | {type: 'close'}
  | {type: 'setLoading'; isLoading: boolean}
  | {type: 'setFooter'; footer: React.ReactNode | undefined}
  | {type: 'setTitle'; title: string}
  | {type: 'setCanDiscard'; canDiscard: boolean}
  | {type: 'setCanContinue'; canContinue: boolean}
  | {type: 'setWithFeedback'; withFeedback: boolean}

const modalReducer = (state: ModalState, action: ModalAction) => {
  switch (action.type) {
    case 'open':
      return {
        ...state,
        content: action.content,
        height: action.height ?? defaultState.height,
        footer: action.footer ?? defaultState.footer,
        isLoading: action.isLoading ?? defaultState.isLoading,
        canDiscard: action.canDiscard ?? defaultState.canDiscard,
        title: action.title ?? defaultState.title,
        withFeedback: action.withFeedback ?? defaultState.withFeedback,
        canContinue: action.canContinue ?? defaultState.canContinue,
        onClose: action.onClose,
        full: action.full ?? defaultState.full,
        isOpen: true,
      }

    case 'close':
      return {
        ...defaultState,
      }

    case 'setLoading':
      return {
        ...state,
        isLoading: action.isLoading,
      }

    case 'setFooter':
      return {
        ...state,
        footer: action.footer,
      }

    case 'setWithFeedback':
      return {
        ...state,
        withFeedback: action.withFeedback,
      }

    case 'setTitle':
      return {
        ...state,
        title: action.title,
      }

    case 'setCanDiscard':
      return {
        ...state,
        canDiscard: action.canDiscard,
      }

    case 'setCanContinue':
      return {
        ...state,
        canContinue: action.canContinue,
      }

    default:
      throw new Error(`modalReducer invalid action`)
  }
}

const defaultState: ModalState = Object.freeze({
  content: undefined,
  isOpen: false,
  height: 400,
  footer: undefined,
  isLoading: false,
  canDiscard: true,
  title: '',
  canContinue: false,
  full: false,
  withFeedback: false,
})
