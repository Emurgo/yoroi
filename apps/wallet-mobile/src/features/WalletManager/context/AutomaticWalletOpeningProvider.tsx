import {App} from '@yoroi/types'
import * as React from 'react'

import {logger} from '../../../kernel/logger/logger'

const AutomaticWalletOpenerContext = React.createContext<AutomaticWalletOpenerContextType | undefined>(undefined)

export const AutomaticWalletOpenerProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [active, setActive] = React.useState(false)

  return <AutomaticWalletOpenerContext.Provider value={{active, setActive}}>{children}</AutomaticWalletOpenerContext.Provider>
}

type AutomaticWalletOpenerContextType = {
  active: boolean
  setActive: (active: boolean) => void
}

export const useAutomaticWalletOpener = () => {
  const context = React.useContext(AutomaticWalletOpenerContext)

  if (context == undefined) {
    const error = new App.Errors.InvalidState('useAutomaticWalletOpenerProvideris not set, invalid state reached')
    logger.error(error)
    throw error
  }

  return React.useMemo(() => {
    return {
      active: context.active,
      setActive: context.setActive,
    }
  }, [context.active, context.setActive])
}
