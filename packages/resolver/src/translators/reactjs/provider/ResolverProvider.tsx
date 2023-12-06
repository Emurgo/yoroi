import {Resolver} from '@yoroi/types'
import * as React from 'react'

import {resolverModuleMocks} from '../../../translators/module.mocks'

type ResolverProviderContext = React.PropsWithChildren<Resolver.Module>

const initialResolverProvider: ResolverProviderContext = {
  ...resolverModuleMocks.error,
}

const ResolverContext = React.createContext<ResolverProviderContext>(
  initialResolverProvider,
)
export const ResolverProvider = ({
  children,
  resolverModule,
}: {
  children: React.ReactNode
  resolverModule: Resolver.Module
}) => {
  const context = React.useMemo(() => ({...resolverModule}), [resolverModule])

  return (
    <ResolverContext.Provider value={context}>
      {children}
    </ResolverContext.Provider>
  )
}

export const useResolver = () => React.useContext(ResolverContext)
