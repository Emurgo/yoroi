import React from 'react'

const PoolTransitionContext = React.createContext<
  [string[], React.Dispatch<React.SetStateAction<string[]>>] | undefined
>(undefined)

export const PoolTransitionProvider = ({children}: {children: React.ReactNode}) => {
  const value = React.useState<Array<string>>([])

  return <PoolTransitionContext.Provider value={value}>{children}</PoolTransitionContext.Provider>
}

export const usePoolTransitionContext = () => React.useContext(PoolTransitionContext) || missingProvider()

const missingProvider = () => {
  throw new Error('PoolTransitionProvider is missing')
}
