import * as React from 'react'
import {Notifications} from '@yoroi/types'

type NotificationContextType = {
  manager: Notifications.Manager
}

const Context = React.createContext<NotificationContextType | null>(null)

type Props = {
  manager: Notifications.Manager
  children: React.ReactNode
}

export const NotificationProvider = ({manager, children}: Props) => {
  const value = React.useMemo(() => ({manager}), [manager])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useNotificationManager = () => {
  const context = React.useContext(Context)

  if (context === null) {
    throw new Error(
      'useNotificationManager must be used within a NotificationProvider',
    )
  }
  return context.manager
}
