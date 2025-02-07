import {useNotificationManager} from '@yoroi/notifications'
import {Notifications} from '@yoroi/types'
import * as React from 'react'
import {useMemo} from 'react'

import {useNotificationDisplaySettings} from '../../Settings/useCases/changeWalletSettings/Notifications/NotificationsDisplaySettings'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {NotificationPopup} from './common/NotificationPopup'
import {NotificationStack} from './common/NotificationStack'

const displayLimit = 3

export const NotificationUIHandler = () => {
  const enabled = useNotificationDisplaySettings()
  const {events, removeEvent} = useCollectNewNotifications({enabled})
  const last3Events = useMemo(() => events.slice(-displayLimit), [events])

  if (last3Events.length === 0) {
    return null
  }

  return (
    <NotificationStack>
      {last3Events.map((event) => (
        <NotificationPopup
          key={event.id}
          event={event}
          onCancel={() => removeEvent(event.id)}
          onPress={() => removeEvent(event.id)}
          onExpired={() => removeEvent(event.id)}
        />
      ))}
    </NotificationStack>
  )
}

const useCollectNewNotifications = ({enabled}: {enabled: boolean}) => {
  const manager = useNotificationManager()
  const walletManager = useWalletManager()
  const selectedWalletId = walletManager.selected.wallet?.id ?? ''
  const [events, setEvents] = React.useState<Notifications.Event[]>([])

  React.useEffect(() => {
    if (!enabled) return
    const pushEvent = (event: Notifications.Event) => {
      setEvents((e) => [...e, event])
    }

    const subscription = manager.newEvents$.subscribe((event) => {
      if (event.trigger === Notifications.Trigger.RewardsUpdated && event.metadata.walletId === selectedWalletId) {
        pushEvent(event)
      }

      if (event.trigger === Notifications.Trigger.TransactionReceived && event.metadata.walletId === selectedWalletId) {
        pushEvent(event)
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [manager, setEvents, selectedWalletId, enabled])

  const removeEvent = (id: number) => {
    setEvents((e) => e.filter((ev) => ev.id !== id))
  }

  return {events, removeEvent}
}
