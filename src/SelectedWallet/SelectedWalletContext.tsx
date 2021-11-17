import * as React from 'react'

import {WalletMeta} from '../../legacy/state'

type SelectedWalletMeta = WalletMeta
type SetSelectedWalletMeta = (selectedWalletMeta?: SelectedWalletMeta) => void

const SelectedWalletMetaContext = React.createContext<
  readonly [SelectedWalletMeta | undefined, SetSelectedWalletMeta] | undefined
>(undefined)

export const SelectedWalletMetaProvider: React.FC = ({children}) => {
  return (
    <SelectedWalletMetaContext.Provider value={React.useState<SelectedWalletMeta | undefined>(undefined)}>
      {children}
    </SelectedWalletMetaContext.Provider>
  )
}

export const useSelectedWalletMeta = () => {
  const selectedWalletMetaContext = React.useContext(SelectedWalletMetaContext)

  if (!selectedWalletMetaContext) {
    throw new Error('missing SelectedWalletMetaProvider')
  }

  const [selectedWalletMeta] = selectedWalletMetaContext
  if (!selectedWalletMeta) {
    throw new Error('missing SelectedWalletMetaBoundary')
  }

  return selectedWalletMeta
}

export const useSetSelectedWalletMeta = () => {
  const selectedWalletMetaContext = React.useContext(SelectedWalletMetaContext)

  if (!selectedWalletMetaContext) {
    throw new Error('missing SelectedWalletMetaProvider')
  }

  const [, setSelectedWalletMeta] = selectedWalletMetaContext

  return setSelectedWalletMeta
}

export const SelectedWalletMetaBoundary: React.FC<{fallback?: React.ReactNode}> = ({children, fallback = null}) => {
  const walletMeta = useSelectedWalletMeta()

  if (!walletMeta) return <>{fallback}</>

  return <>{children}</>
}
