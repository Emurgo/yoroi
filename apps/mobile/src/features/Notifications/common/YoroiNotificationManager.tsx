import {NotificationProvider} from '@yoroi/notifications'
import * as React from 'react'

import {useNotificationManagerMaker} from './notification-manager'

type Props = {
  children: React.ReactNode
}

export const YoroiNotificationManager: React.FC<Props> = ({children}) => {
  const manager = useNotificationManagerMaker()
  return (
    <NotificationProvider manager={manager}>{children}</NotificationProvider>
  )
}
