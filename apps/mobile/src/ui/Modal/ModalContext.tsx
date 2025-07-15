import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet'
import * as React from 'react'
import {Keyboard} from 'react-native'
import {GestureHandlerRootView} from 'react-native-gesture-handler'

type ModalState = {
  isOpen: boolean
  content: React.ReactNode
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null> | null
}
type ModalActions = {
  openModal: (args: {content: React.ReactNode}) => void
  closeModal: () => void
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
    openModal: ({content}) => {
      Keyboard.dismiss()
      dispatch({
        type: 'open',
        content,
      })
      handlePresentModalPress()
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
    }
  | {type: 'close'}

const modalReducer = (state: ModalState, action: ModalAction) => {
  switch (action.type) {
    case 'open':
      return {
        ...state,
        content: action.content,
        isOpen: true,
      }

    case 'close':
      return {
        ...defaultState,
        bottomSheetModalRef: state.bottomSheetModalRef,
      }

    default:
      throw new Error(`modalReducer invalid action`)
  }
}

const defaultState: ModalState = Object.freeze({
  content: undefined,
  isOpen: false,
  bottomSheetModalRef: null,
})
