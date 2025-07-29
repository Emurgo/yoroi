import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet'
import * as React from 'react'
import {Keyboard} from 'react-native'
import {GestureHandlerRootView} from 'react-native-gesture-handler'

type ModalState = {
  isOpen: boolean
  content: React.ReactNode
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null> | null
  height: number
  footer: React.ReactNode | undefined
  isLoading: boolean
  canDiscard: boolean
  title: string
}
type ModalActions = {
  openModal: (args: {
    content: React.ReactNode
    height?: number
    footer?: React.ReactNode
    isLoading?: boolean
    canDiscard?: boolean
    title?: string
  }) => void
  closeModal: () => void
  setLoading: (isLoading: boolean) => void
  setFooter: (footer: React.ReactNode | undefined) => void
  setTitle: (title: string) => void
  setCanDiscard: (canDiscard: boolean) => void
}

const ModalContext = React.createContext<
  undefined | (ModalState & ModalActions)
>(undefined)

export const useModal = () => {
  const value = React.useContext(ModalContext)
  if (!value) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return value
}

export const ModalProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<ModalState>
}) => {
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null)
  const [state, dispatch] = React.useReducer(modalReducer, {
    ...defaultState,
    ...initialState,
    bottomSheetModalRef,
  })

  const handlePresentModalPress = React.useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  const handleDismissModalPress = React.useCallback(() => {
    bottomSheetModalRef.current?.close()
  }, [])

  const actions = React.useRef<ModalActions>({
    closeModal: () => {
      dispatch({
        type: 'close',
      })
      handleDismissModalPress()
    },
    openModal: ({content, height, footer, isLoading, canDiscard, title}) => {
      Keyboard.dismiss()
      dispatch({
        type: 'open',
        content,
        height,
        footer,
        isLoading,
        canDiscard,
        title,
      })
      handlePresentModalPress()
    },
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
  }).current

  const context = React.useMemo(
    () => ({...state, ...actions}),
    [state, actions],
  )

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <BottomSheetModalProvider>
        <ModalContext.Provider value={context}>
          {children}
        </ModalContext.Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
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
      title?: string
    }
  | {type: 'close'}
  | {type: 'setLoading'; isLoading: boolean}
  | {type: 'setFooter'; footer: React.ReactNode | undefined}
  | {type: 'setTitle'; title: string}
  | {type: 'setCanDiscard'; canDiscard: boolean}

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
        isOpen: true,
      }

    case 'close':
      return {
        ...defaultState,
        bottomSheetModalRef: state.bottomSheetModalRef,
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

    default:
      throw new Error(`modalReducer invalid action`)
  }
}

const defaultState: ModalState = Object.freeze({
  content: undefined,
  isOpen: false,
  bottomSheetModalRef: null,
  height: 400,
  footer: undefined,
  isLoading: false,
  canDiscard: true,
  title: '',
})
