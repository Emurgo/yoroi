import * as React from 'react'

import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'

type SelectedWallet = YoroiWallet
type SetSelectedWallet = (selectedWallet?: SelectedWallet) => void
type SelectedWalletContext = readonly [SelectedWallet | undefined, SetSelectedWallet]

const SelectedWalletContext = React.createContext<SelectedWalletContext | undefined>(undefined)

export const SelectedWalletProvider = ({children, wallet}: {wallet?: SelectedWallet; children: React.ReactNode}) => {
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
  const [currentWallet, setSelectedWallet] = useSelectedWalletContext()
  const selectWallet = React.useCallback(
    (nextWallet?: YoroiWallet) => {
      if (currentWallet?.id !== nextWallet?.id) currentWallet?.stopSync() // only 1 active wallet at a time
      setSelectedWallet(nextWallet)
    },
    [currentWallet, setSelectedWallet],
  )

  return selectWallet
}

export const SelectedWalletBoundary = ({
  children,
  fallback = null,
}: {
  fallback?: React.ReactNode
  children: React.ReactNode
}) => {
  const [wallet] = useSelectedWalletContext()

  if (!wallet) return <>{fallback}</>

  return <>{children}</>
}

export const useSelectedWalletContext = () => React.useContext(SelectedWalletContext) || missingProvider()

// //////////////////////////////////////////////////////////////

const missingProvider = () => {
  throw new Error('SelectedWalletProvider is missing')
}
