import * as React from 'react'

import {WalletMeta} from '../../legacy/state'
import {WalletInterface} from '../types'

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

export const useSelectedWalletMeta = () => React.useContext(SelectedWalletMetaContext) || missingProvider()
export const useSetSelectedWalletMeta = () => React.useContext(SetSelectedWalletMetaContext) || missingProvider()

export const SelectedWalletMetaBoundary: React.FC<{fallback?: React.ReactNode}> = ({children, fallback = null}) => {
  const walletMeta = React.useContext(SelectedWalletMetaContext)

  if (!walletMeta) return <>{fallback}</>

  return <>{children}</>
}

type SelectedWallet = WalletInterface
type SetSelectedWallet = (selectedWallet?: SelectedWallet) => void

const SelectedWalletContext = React.createContext<undefined | SelectedWallet>(undefined)
const SetSelectedWalletContext = React.createContext<undefined | SetSelectedWallet>(undefined)

export const SelectedWalletProvider: React.FC<{wallet?: WalletInterface}> = ({children, ...props}) => {
  const [wallet, setWallet] = React.useState<SelectedWallet | undefined>(props.wallet)

  return (
    <SelectedWalletContext.Provider value={wallet}>
      <SetSelectedWalletContext.Provider value={setWallet}>{children}</SetSelectedWalletContext.Provider>
    </SelectedWalletContext.Provider>
  )
}

export const useSelectedWallet = () => React.useContext(SelectedWalletContext) || missingProvider()
export const useSetSelectedWallet = () => React.useContext(SetSelectedWalletContext) || missingProvider()

export const WalletBoundary: React.FC<{fallback?: React.ReactNode}> = ({children, fallback = null}) => {
  const wallet = useSelectedWallet()

  if (!wallet) return <>{fallback}</>

  return <>{children}</>
}

const missingProvider = () => {
  throw new Error('missing provider or boundary')
}
