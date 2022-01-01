import * as React from 'react'

type ReceiveContextState = {
  isInfoModalOpen: boolean
}
const defaultValue: ReceiveContextState = {
  isInfoModalOpen: false,
}

type SetReceiveContextState = React.Dispatch<React.SetStateAction<ReceiveContextState | undefined>>
type ReceiveContext = readonly [ReceiveContextState | undefined, SetReceiveContextState]

const ReceiveContext = React.createContext<ReceiveContext | undefined>(undefined)

export const ReceiveProvider: React.FC<{initialState?: ReceiveContextState}> = ({children, initialState}) => {
  const receiveContextState = React.useState<ReceiveContextState | undefined>(initialState || defaultValue)

  return <ReceiveContext.Provider value={receiveContextState}>{children}</ReceiveContext.Provider>
}

const missingProvider = () => {
  throw new Error('ReceiveProvider is missing')
}

export const useReceiveContext = () => React.useContext(ReceiveContext) || missingProvider()

export const useReceiveContextInfoModal = () => {
  const [receiveContextState, setReceiveContextState] = useReceiveContext()
  const showInfoModal = () => setReceiveContextState({isInfoModalOpen: true})
  const hideInfoModal = () => setReceiveContextState({isInfoModalOpen: false})

  return {isInfoModalOpen: receiveContextState?.isInfoModalOpen, showInfoModal, hideInfoModal}
}
