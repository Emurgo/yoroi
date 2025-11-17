import {invalid} from '@yoroi/common'
import {Scan} from '@yoroi/types'

import * as React from 'react'

import {logger} from '~/kernel/logger/logger'

type PendingScanActionState = {
  pendingScanAction: Scan.Action | null
}

type PendingScanActionActions = {
  setPendingScanAction: (action: Scan.Action | null) => void
  clearPendingScanAction: () => void
}

type PendingScanActionContext = PendingScanActionState &
  PendingScanActionActions

const defaultState: PendingScanActionState = {
  pendingScanAction: null,
}

const defaultActions: PendingScanActionActions = {
  setPendingScanAction: () =>
    invalid('PendingScanActionProvider not initialized'),
  clearPendingScanAction: () =>
    invalid('PendingScanActionProvider not initialized'),
}

const Context = React.createContext<PendingScanActionContext>({
  ...defaultState,
  ...defaultActions,
})

export const PendingScanActionProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [pendingScanAction, setPendingScanAction] =
    React.useState<Scan.Action | null>(null)

  const clearPendingScanAction = React.useCallback(() => {
    logger.debug('PendingScanActionProvider: clearing pending scan action')
    setPendingScanAction(null)
  }, [])

  const setPendingScanActionWithLogging = React.useCallback(
    (action: Scan.Action | null) => {
      logger.debug('PendingScanActionProvider: setting pending scan action', {
        action: action?.action,
        hasAction: !!action,
      })
      setPendingScanAction(action)
    },
    [],
  )

  const value = React.useMemo<PendingScanActionContext>(
    () => ({
      pendingScanAction,
      setPendingScanAction: setPendingScanActionWithLogging,
      clearPendingScanAction,
    }),
    [
      pendingScanAction,
      setPendingScanActionWithLogging,
      clearPendingScanAction,
    ],
  )

  React.useEffect(() => {
    logger.debug('PendingScanActionProvider: context value changed', {
      hasPendingScanAction: !!value.pendingScanAction,
      action: value.pendingScanAction?.action,
    })
  }, [value])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const usePendingScanAction = () =>
  React.useContext(Context) ??
  invalid('usePendingScanAction must be used within PendingScanActionProvider')
