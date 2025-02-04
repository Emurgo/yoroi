import {NavigationProp, useNavigation} from '@react-navigation/native'
import React from 'react'
import {Keyboard} from 'react-native'

type ModalState = {
  height: number
  isOpen: boolean
  title: string
  content: React.ReactNode
  footer?: React.ReactNode
  isLoading: boolean
  full: boolean
  canContinue?: boolean
  canDiscard: boolean
}
type ModalActions = {
  openModal: (args: {
    height?: number
    title?: string
    content: React.ReactNode
    footer?: React.ReactNode
    full?: boolean
    onClose?: () => void
    canContinue?: boolean
    canDiscard?: boolean
  }) => void
  closeModal: () => void
  setCanContinue: (v: boolean) => void
  startLoading: () => void
  stopLoading: () => void
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
  const onCloseRef = React.useRef<() => void>()
  const actions = React.useRef<ModalActions>({
    closeModal: () => {
      if (getLastRouteName(navigation) === 'modal') {
        dispatch({type: 'close'})
        navigation.goBack()
        onCloseRef.current?.()
      }
    },
    openModal: ({title = '', content, height, onClose, full = false, footer, canContinue, canDiscard = true}) => {
      Keyboard.dismiss()
      dispatch({type: 'open', title, content, footer, height, full, canContinue, canDiscard})
      navigation.navigate('modal')
      onCloseRef.current = onClose
    },
    startLoading: () => dispatch({type: 'startLoading'}),
    stopLoading: () => dispatch({type: 'stopLoading'}),
    setCanContinue: (v) => dispatch({type: 'canContinue', canContinue: v}),
  }).current

  const context = React.useMemo(() => ({...state, ...actions}), [state, actions])

  return <ModalContext.Provider value={context}>{children}</ModalContext.Provider>
}

type ModalAction =
  | {
      type: 'open'
      height: ModalState['height'] | undefined
      content: ModalState['content']
      footer: ModalState['footer']
      title: ModalState['title']
      full: ModalState['full']
      canContinue: ModalState['canContinue']
      canDiscard: ModalState['canDiscard']
    }
  | {type: 'close'}
  | {type: 'startLoading'}
  | {type: 'stopLoading'}
  | {type: 'canContinue'; canContinue: boolean}

const modalReducer = (state: ModalState, action: ModalAction) => {
  switch (action.type) {
    case 'open':
      return {
        ...state,
        content: action.content,
        footer: action.footer,
        height: action.height ?? defaultState.height,
        title: action.title,
        isOpen: true,
        isLoading: false,
        full: action.full,
        canDiscard: action.canDiscard,
      }

    case 'close':
      return {...defaultState}

    case 'stopLoading':
      return {...state, isLoading: false}

    case 'startLoading':
      return {...state, isLoading: true}

    case 'canContinue':
      return {...state, canContinue: action.canContinue}

    default:
      throw new Error(`modalReducer invalid action`)
  }
}

const defaultState: ModalState = Object.freeze({
  content: undefined,
  footer: undefined,
  height: 350,
  title: '',
  isOpen: false,
  isLoading: false,
  full: false,
  canDiscard: true,
})

const getLastRouteName = (navigation: NavigationProp<ReactNavigation.RootParamList>) => {
  return navigation.getState().routes.slice(-1)[0].name
}
