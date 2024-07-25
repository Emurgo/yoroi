import React from 'react'

import {features} from '../..'

export type ActiveTab = 'performance' | 'overview' | 'transactions'
interface TokenDetailContext {
  activeTab: ActiveTab
  setActiveTab: (value: ActiveTab) => void
}

const Context = React.createContext<TokenDetailContext | null>(null)

export const usePortfolioTokenDetailContext = () => {
  const ctx = React.useContext(Context)

  if (ctx === null) {
    throw new Error('PortfolioTokenDetailProvider is missing')
  }

  return ctx
}

export const PortfolioTokenDetailProvider = ({children}: {children: React.ReactNode}) => {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>(
    features.portfolioPerformance ? 'performance' : 'overview',
  )
  const setActiveTabTx = (value: ActiveTab) => {
    React.startTransition(() => {
      setActiveTab(value)
    })
  }

  return (
    <Context.Provider
      value={{
        activeTab,
        setActiveTab: setActiveTabTx,
      }}
    >
      {children}
    </Context.Provider>
  )
}
