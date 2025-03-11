import {invalid} from '@yoroi/common'
import {Banners} from '@yoroi/types'
import * as React from 'react'

interface BannersContextProps {
  manager: Readonly<Banners.Manager>
}

const bannersManagerInitial: Banners.Manager = {
  dismiss: (_id: string) => invalid('Banners Manager not provided'),
  dismissedAt: (_id: string) => invalid('Banners Manager not provided'),
}
const BannersContext = React.createContext<BannersContextProps>({
  manager: bannersManagerInitial,
})

export const BannersProvider = ({
  children,
  manager,
}: {
  children: React.ReactNode
  manager: Readonly<Banners.Manager>
}) => {
  const context = React.useMemo(() => ({manager}), [manager])
  return (
    <BannersContext.Provider value={context}>
      {children}
    </BannersContext.Provider>
  )
}

export const useBanners = (): BannersContextProps =>
  React.useContext(BannersContext)
