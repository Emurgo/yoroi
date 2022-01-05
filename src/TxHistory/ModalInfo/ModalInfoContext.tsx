import * as React from 'react'

type SetModalInfo = React.Dispatch<React.SetStateAction<boolean>>
type ModalInfoContext = readonly [boolean | undefined, SetModalInfo]

const ModalInfoContext = React.createContext<ModalInfoContext | undefined>(undefined)

export const ModalInfoProvider: React.FC<{showInfoModal?: boolean}> = ({children, showInfoModal}) => {
  const state = React.useState<boolean>(Boolean(showInfoModal))

  return <ModalInfoContext.Provider value={state}>{children}</ModalInfoContext.Provider>
}

const missingProvider = () => {
  throw new Error('ModalInfoProvider is missing')
}

export const useModalInfoContext = () => React.useContext(ModalInfoContext) || missingProvider()

export const useModalInfo = () => {
  const [modalInfoState, setModalInfoState] = useModalInfoContext()
  const showModalInfo = React.useCallback(() => setModalInfoState(true), [setModalInfoState])
  const hideModalInfo = React.useCallback(() => setModalInfoState(false), [setModalInfoState])

  return {isModalInfoOpen: modalInfoState, showModalInfo, hideModalInfo}
}
