import * as React from 'react'

import {WalletMeta} from '../../legacy/state'

type SelectedWalletMeta = WalletMeta
type SetSelectedWalletMeta = (selectedWalletMeta?: SelectedWalletMeta) => void

const SelectedWalletMetaContext = React.createContext<undefined | SelectedWalletMeta>(undefined)
const SetSelectedWalletMetaContext = React.createContext<undefined | SetSelectedWalletMeta>(undefined)

export const SelectedWalletMetaProvider: React.FC = ({children}) => {
  const [walletMeta, setWalletMeta] = React.useState<SelectedWalletMeta | undefined>(undefined)

  return (
    <SelectedWalletMetaContext.Provider value={walletMeta}>
      <SetSelectedWalletMetaContext.Provider value={setWalletMeta}>{children}</SetSelectedWalletMetaContext.Provider>
    </SelectedWalletMetaContext.Provider>
  )
}

export const useSelectedWalletMeta = () => {
  const selectedWalletMeta = React.useContext(SelectedWalletMetaContext)

  if (!selectedWalletMeta) {
    throw new Error('missing SelectedWalletMetaProvider or missing SelectedWalletMetaBoundary')
  }

  return selectedWalletMeta
}

export const useSetSelectedWalletMeta = () => {
  const setSelectedWalletMeta = React.useContext(SetSelectedWalletMetaContext)

  if (!setSelectedWalletMeta) {
    throw new Error('missing SelectedWalletMetaProvider')
  }

  return setSelectedWalletMeta
}

export const SelectedWalletMetaBoundary: React.FC<{fallback?: React.ReactNode}> = ({children, fallback = null}) => {
  const walletMeta = useSelectedWalletMeta()

  if (!walletMeta) return <>{fallback}</>

  return <>{children}</>
}
