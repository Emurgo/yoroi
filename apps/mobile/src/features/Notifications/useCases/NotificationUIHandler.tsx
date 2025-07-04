import {useNavigation} from '@react-navigation/native'
import {isString} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {Notifications} from '@yoroi/types'
import * as React from 'react'

import {
  isTxHistoryRoute,
  isWalletSelectionRoute,
} from '../../../kernel/navigation'
import {useNotificationDisplaySettings} from '../../Settings/useCases/changeWalletSettings/Notifications/NotificationsDisplaySettings'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {pushNotificationsManager} from '../common/notification-manager'
import {NotificationPopup} from '../common/NotificationPopup'
import {NotificationStack} from '../common/NotificationStack'

const displayLimit = 3

export const NotificationUIHandler = () => {
  const enabled = useNotificationDisplaySettings()
  const {events, removeEvent} = useCollectNewNotifications({enabled})
  const last3Events = React.useMemo(() => events.slice(-displayLimit), [events])

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
  const selectedWalletId = walletManager.selected.wallet?.id ?? null
  const [events, setEvents] = React.useState<Notifications.Event[]>([])
  const navigator = useNavigation()
  const navigatorState = navigator.getState()
  const isWalletSelectionScreen = React.useMemo(
    () => isWalletSelectionRoute(navigatorState),
    [navigatorState],
  )
  const isTxHistoryScreen = React.useMemo(
    () => isTxHistoryRoute(navigatorState),
    [navigatorState],
  )

  React.useEffect(() => {
    if (!enabled || !isString(selectedWalletId) || isWalletSelectionScreen)
      return
    const pushEvent = (event: Notifications.Event) => {
      setEvents((e) => [...e, event])
    }

    const pushSubscription = pushNotificationsManager.newEvents$.subscribe(
      (e) => {
        if (e.trigger === Notifications.Trigger.Push) {
          pushEvent(e)
        }
      },
    )

    const localSubscription = manager.newEvents$.subscribe((event) => {
      if (
        event.trigger === Notifications.Trigger.RewardsUpdated &&
        event.metadata.walletId === selectedWalletId &&
        !isTxHistoryScreen
      ) {
        pushEvent(event)
      }

      if (
        event.trigger === Notifications.Trigger.TransactionReceived &&
        event.metadata.walletId === selectedWalletId &&
        !isTxHistoryScreen
      ) {
        pushEvent(event)
      }

      if (event.trigger === Notifications.Trigger.Banner) {
        pushEvent(event)
      }
    })
    return () => {
      localSubscription.unsubscribe()
      pushSubscription.unsubscribe()
    }
  }, [
    manager,
    setEvents,
    selectedWalletId,
    enabled,
    isWalletSelectionScreen,
    isTxHistoryScreen,
    walletManager.selected.network,
  ])

  const removeEvent = (id: number) => {
    setEvents((e) => e.filter((ev) => ev.id !== id))
  }

  return {events, removeEvent}
}
