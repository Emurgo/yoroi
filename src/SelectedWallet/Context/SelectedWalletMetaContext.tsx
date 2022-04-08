import * as React from 'react'

import {WalletMeta} from '../../legacy/state'

type SelectedWalletMeta = WalletMeta
type SetSelectedWalletMeta = (selectedWalletMeta?: SelectedWalletMeta) => void
type SelectedWalletMetaContext = readonly [SelectedWalletMeta | undefined, SetSelectedWalletMeta]

const SelectedWalletMetaContext = React.createContext<SelectedWalletMetaContext | undefined>(undefined)

export const SelectedWalletMetaProvider: React.FC = ({children}) => {
  const [selectedWalletMeta, setSelectedWalletMeta] = React.useState<SelectedWalletMeta | undefined>(undefined)

  return (
    <SelectedWalletMetaContext.Provider value={[selectedWalletMeta, setSelectedWalletMeta] as const}>
      {children}
    </SelectedWalletMetaContext.Provider>
  )
}

export const useSelectedWalletMeta = () => {
  const [selectedWalletMeta] = useSelectedWalletMetaContext()

  return selectedWalletMeta
}

export const useSetSelectedWalletMeta = () => {
  const [, setSelectedWalletMeta] = useSelectedWalletMetaContext()

  return setSelectedWalletMeta
}

export const SelectedWalletMetaBoundary: React.FC<{fallback?: React.ReactNode}> = ({children, fallback = null}) => {
  const [walletMeta] = useSelectedWalletMetaContext()

  if (!walletMeta) return <>{fallback}</>

  return <>{children}</>
}

export const useSelectedWalletMetaContext = () => React.useContext(SelectedWalletMetaContext) || missingProvider()

// //////////////////////////////////////////////////////////////

const missingProvider = () => {
  throw new Error('SelectedWalletMetaProvider is missing')
}
