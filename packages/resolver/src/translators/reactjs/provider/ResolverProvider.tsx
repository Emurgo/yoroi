import {Resolver} from '@yoroi/types'
import * as React from 'react'

import {resolverManagerMocks} from '../../manager.mocks'

type ResolverProviderContext = React.PropsWithChildren<Resolver.Manager>

const initialResolverProvider: ResolverProviderContext = {
  ...resolverManagerMocks.error,
}

const ResolverContext = React.createContext<ResolverProviderContext>(
  initialResolverProvider,
)
export const ResolverProvider = ({
  children,
  resolverManager,
}: {
  children: React.ReactNode
  resolverManager: Resolver.Manager
}) => {
  const context = React.useMemo(() => ({...resolverManager}), [resolverManager])

  return (
    <ResolverContext.Provider value={context}>
      {children}
    </ResolverContext.Provider>
  )
}

export const useResolver = () => React.useContext(ResolverContext)
