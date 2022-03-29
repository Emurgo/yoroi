import * as React from 'react'

import {YoroiWallet} from '../../yoroi-wallets'

type SelectedWallet = YoroiWallet
type SetSelectedWallet = (selectedWallet?: SelectedWallet) => void
type SelectedWalletContext = readonly [SelectedWallet | undefined, SetSelectedWallet]

const SelectedWalletContext = React.createContext<SelectedWalletContext | undefined>(undefined)

export const SelectedWalletProvider: React.FC<{wallet?: SelectedWallet}> = ({children, wallet}) => {
  const [selectedWallet, selectWallet] = React.useState<SelectedWallet | undefined>(wallet)

  return (
    <SelectedWalletContext.Provider value={[selectedWallet, selectWallet] as const}>
      {children}
    </SelectedWalletContext.Provider>
  )
}

export const useSelectedWallet = () => {
  const [wallet] = useSelectedWalletContext()

  if (!wallet) {
    throw new Error('SelectedWalletBoundary is missing')
  }

  return wallet
}

export const useSetSelectedWallet = () => {
  const [, setSelectedWallet] = useSelectedWalletContext()

  return setSelectedWallet
}

export const SelectedWalletBoundary: React.FC<{fallback?: React.ReactNode}> = ({children, fallback = null}) => {
  const [wallet] = useSelectedWalletContext()

  if (!wallet) return <>{fallback}</>

  return <>{children}</>
}

export const useSelectedWalletContext = () => React.useContext(SelectedWalletContext) || missingProvider()

// //////////////////////////////////////////////////////////////

const missingProvider = () => {
  throw new Error('SelectedWalletProvider is missing')
}
