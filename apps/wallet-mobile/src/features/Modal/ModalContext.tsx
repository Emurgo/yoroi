import {useNavigation} from '@react-navigation/native'
import React from 'react'

type ModalState = {
  height: number
  title: string
  content: React.ReactNode
  isOpen: boolean
}
type ModalActions = {
  openModal: (title: ModalState['title'], content: ModalState['content'], height?: ModalState['height']) => void
  closeModal: () => void
}

const ModalContext = React.createContext<undefined | (ModalState & ModalActions)>(undefined)

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
  const [state, dispatch] = React.useReducer(modalReducer, {...defaultState, ...initialState})
  const navigation = useNavigation()
  const actions = React.useRef<ModalActions>({
    closeModal: () => {
      if (state.isOpen) {
        dispatch({type: 'close'})
        navigation.goBack()
      }
    },
    openModal: (title: ModalState['title'], content: ModalState['content'], height?: ModalState['height']) => {
      dispatch({type: 'open', title, content, height})
      navigation.navigate('modal')
    },
  }).current

  const context = React.useMemo(() => ({...state, ...actions}), [state, actions])

  return <ModalContext.Provider value={context}>{children}</ModalContext.Provider>
}

type ModalAction =
  | {type: 'open'; height: ModalState['height'] | undefined; content: ModalState['content']; title: ModalState['title']}
  | {type: 'close'}

const modalReducer = (state: ModalState, action: ModalAction) => {
  switch (action.type) {
    case 'open':
      return {
        ...state,
        isOpen: true,
        content: action.content,
        height: action.height ?? defaultState.height,
        title: action.title,
      }

    case 'close':
      return {...defaultState}

    default:
      throw new Error(`modalReducer invalid action`)
  }
}

const defaultState: ModalState = Object.freeze({content: null, height: 350, title: '', isOpen: false})
