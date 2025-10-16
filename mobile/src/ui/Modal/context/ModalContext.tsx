import {App} from '@yoroi/types'

import * as React from 'react'
import {Keyboard} from 'react-native'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useIsKeyboardOpen} from '~/hooks/useIsKeyboardOpen'

type ModalQueueItem = {
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
  canExpand?: boolean
}

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
  hasExpanded?: boolean
  canExpand?: boolean
  queue: ModalQueueItem[]
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
    canExpand?: boolean
  }) => void
  closeModal: (dismissAll?: boolean) => void
  setLoading: (isLoading: boolean) => void
  setFooter: (footer: React.ReactNode | undefined) => void
  setTitle: (title: string) => void
  setCanDiscard: (canDiscard: boolean) => void
  setCanContinue: (canContinue: boolean) => void
  setHasExpanded: (hasExpanded: boolean) => void
  setCanExpand: (canExpand: boolean) => void
  clearQueue: () => void
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
  const {isLoggedOut} = useAuth()
  const [state, dispatch] = React.useReducer(modalReducer, {
    ...defaultState,
    ...initialState,
  })
  const isOpenRef = React.useRef(state.isOpen)
  const queueRef = React.useRef(state.queue)
  const prevLoggedOutRef = React.useRef(isLoggedOut)
  const isKeyboardOpen = useIsKeyboardOpen()

  React.useEffect(() => {
    isOpenRef.current = state.isOpen
    queueRef.current = state.queue
  }, [state.isOpen, state.queue])

  const closeModal = React.useCallback(
    (dismissAll?: boolean) => {
      if (isKeyboardOpen) {
        Keyboard.dismiss()
        return
      }
      dispatch({
        type: 'closeAndProcessQueue',
        dismissAll: Boolean(dismissAll),
      })
    },
    [isKeyboardOpen],
  )

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
      canExpand,
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
      canExpand?: boolean
    }) => {
      Keyboard.dismiss()

      if (isOpenRef.current) {
        dispatch({
          type: 'addToQueue',
          modalData: {
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
            canExpand,
          },
        })

        return
      }

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
        canExpand,
      })
    },
    [],
  )

  const actions = React.useMemo<ModalActions>(
    () => ({
      closeModal,
      openModal,
      setLoading: (isLoading: boolean) => {
        dispatch({
          type: 'setLoading',
          isLoading,
        })
      },
      setFooter: (footer: React.ReactNode | undefined) => {
        dispatch({
          type: 'setFooter',
          footer,
        })
      },
      setWithFeedback: (withFeedback: boolean) => {
        dispatch({
          type: 'setWithFeedback',
          withFeedback,
        })
      },
      setTitle: (title: string) => {
        dispatch({
          type: 'setTitle',
          title,
        })
      },
      setCanDiscard: (canDiscard: boolean) => {
        dispatch({
          type: 'setCanDiscard',
          canDiscard,
        })
      },
      setCanContinue: (canContinue: boolean) => {
        dispatch({
          type: 'setCanContinue',
          canContinue,
        })
      },
      setHasExpanded: (hasExpanded: boolean) => {
        dispatch({
          type: 'setHasExpanded',
          hasExpanded,
        })
      },
      setCanExpand: (canExpand: boolean) => {
        dispatch({
          type: 'setCanExpand',
          canExpand,
        })
      },
      clearQueue: () => {
        dispatch({
          type: 'clearQueue',
        })
      },
    }),
    [closeModal, openModal],
  )

  const context = React.useMemo(
    () => ({...state, ...actions}),
    [state, actions],
  )

  React.useEffect(() => {
    if (
      prevLoggedOutRef.current !== isLoggedOut &&
      isLoggedOut &&
      isOpenRef.current
    ) {
      closeModal()
    }
    prevLoggedOutRef.current = isLoggedOut
  }, [isLoggedOut, closeModal])

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
      canExpand?: boolean
    }
  | {type: 'close'}
  | {type: 'closeAndProcessQueue'; dismissAll?: boolean}
  | {type: 'addToQueue'; modalData: ModalQueueItem}
  | {type: 'clearQueue'}
  | {type: 'setLoading'; isLoading: boolean}
  | {type: 'setFooter'; footer: React.ReactNode | undefined}
  | {type: 'setTitle'; title: string}
  | {type: 'setCanDiscard'; canDiscard: boolean}
  | {type: 'setCanContinue'; canContinue: boolean}
  | {type: 'setWithFeedback'; withFeedback: boolean}
  | {type: 'setHasExpanded'; hasExpanded: boolean}
  | {type: 'setCanExpand'; canExpand: boolean}

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
        hasExpanded: defaultState.hasExpanded, // Always reset to default when opening
        canExpand: action.canExpand ?? defaultState.canExpand,
        isOpen: true,
      }

    case 'addToQueue':
      return {
        ...state,
        queue: [...state.queue, action.modalData],
      }

    case 'clearQueue':
      return {
        ...state,
        queue: [],
      }

    case 'close':
      return {
        ...defaultState,
        queue: state.queue,
      }

    case 'closeAndProcessQueue':
      if (state.onClose) {
        try {
          state.onClose()
        } catch (error) {
          console.error('[ModalReducer] Error calling onClose:', error)
        }
      }

      if (state.queue.length > 0 && action.dismissAll) {
        const nextModal = state.queue[0]
        return {
          ...defaultState,
          content: nextModal.content,
          height: nextModal.height ?? defaultState.height,
          footer: nextModal.footer ?? defaultState.footer,
          isLoading: nextModal.isLoading ?? defaultState.isLoading,
          canDiscard: nextModal.canDiscard ?? defaultState.canDiscard,
          title: nextModal.title ?? defaultState.title,
          withFeedback: nextModal.withFeedback ?? defaultState.withFeedback,
          canContinue: nextModal.canContinue ?? defaultState.canContinue,
          onClose: nextModal.onClose,
          full: nextModal.full ?? defaultState.full,
          hasExpanded: defaultState.hasExpanded,
          canExpand: nextModal.canExpand ?? defaultState.canExpand,
          isOpen: true,
          queue: state.queue.slice(1),
        }
      }

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

    case 'setHasExpanded':
      return {
        ...state,
        hasExpanded: action.hasExpanded,
      }

    case 'setCanExpand':
      return {
        ...state,
        canExpand: action.canExpand,
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
  hasExpanded: false,
  canExpand: false,
  withFeedback: false,
  onClose: undefined,
  queue: [],
})
