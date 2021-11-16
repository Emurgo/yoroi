import * as React from 'react'

import {WalletMeta} from '../../legacy/state'

type SelectedWalletMeta = WalletMeta
type SetSelectedWalletMeta = (selectedWalletMeta?: SelectedWalletMeta) => void

const SelectedWalletMetaContext = React.createContext<SelectedWalletMeta | undefined>(undefined)
const SetSelectedWalletMetaContext = React.createContext<void | SetSelectedWalletMeta>(undefined)

export const SelectedWalletMetaProvider: React.FC = ({children}) => {
  const [walletMeta, setWalletMeta] = React.useState<SelectedWalletMeta | undefined>(undefined)

  return (
    <SelectedWalletMetaContext.Provider value={walletMeta}>
      <SetSelectedWalletMetaContext.Provider value={setWalletMeta}>{children}</SetSelectedWalletMetaContext.Provider>
    </SelectedWalletMetaContext.Provider>
  )
}

const missingProvider = () => {
  throw new Error('missing SelectedWalletMetaProvider/SelectedWalletMetaBoundary')
}

export const useSelectedWalletMeta = () => React.useContext(SelectedWalletMetaContext) || missingProvider()
export const useSetSelectedWalletMeta = () => React.useContext(SetSelectedWalletMetaContext) || missingProvider()

export const SelectedWalletMetaBoundary: React.FC<{fallback?: React.ReactNode}> = ({children, fallback = null}) => {
  const walletMeta = React.useContext(SelectedWalletMetaContext)

  if (!walletMeta) return <>{fallback}</>

  return <>{children}</>
}
