import {Banners} from '@yoroi/types'
import * as React from 'react'

interface BannersContextProps<K extends string = string> {
  manager: Readonly<Banners.Manager<K>>
}

const BannersContext = React.createContext<
  BannersContextProps<any> | undefined
>(undefined)

export const BannersProvider = <K extends string>({
  children,
  manager,
}: React.PropsWithChildren<{
  manager: Readonly<Banners.Manager<K>>
}>) => {
  const context = React.useMemo(() => ({manager}), [manager])

  return (
    <BannersContext.Provider value={context}>
      {children}
    </BannersContext.Provider>
  )
}

export const useBanners = <
  K extends string = string,
>(): BannersContextProps<K> => {
  const context = React.useContext(BannersContext)

  if (!context) {
    throw new Error('useBanners must be used within a BannersProvider')
  }

  return context as BannersContextProps<K>
}
