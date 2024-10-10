import {App} from '@yoroi/types'
import * as React from 'react'

import {logger} from '../../../kernel/logger/logger'

const AutomaticWalletOpenerContext = React.createContext<AutomaticWalletOpenerContextType | undefined>(undefined)

export const AutomaticWalletOpenerProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [shouldOpen, setShouldOpen] = React.useState(false)

  return (
    <AutomaticWalletOpenerContext.Provider value={{shouldOpen, setShouldOpen}}>
      {children}
    </AutomaticWalletOpenerContext.Provider>
  )
}

type AutomaticWalletOpenerContextType = {
  shouldOpen: boolean
  setShouldOpen: (shouldOpen: boolean) => void
}

export const useAutomaticWalletOpener = () => {
  const context = React.useContext(AutomaticWalletOpenerContext)

  if (context == undefined) {
    const error = new App.Errors.InvalidState('AutomaticWalletOpenerProvider is not set, invalid state reached')
    logger.error(error)
    throw error
  }

  return React.useMemo(() => {
    return {
      shouldOpen: context.shouldOpen,
      setShouldOpen: context.setShouldOpen,
    }
  }, [context.setShouldOpen, context.shouldOpen])
}
