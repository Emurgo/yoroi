import {Notification, Notifications} from '@jamsinclair/react-native-notifications'
import {useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {Notifications as NotificationTypes} from '@yoroi/types'
import * as React from 'react'
import {Switch as RNSwitch, Text, View, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {Subject} from 'rxjs'

import {Button} from '../../../components'
import {notificationManagerMaker} from '@yoroi/notifications'
import uuid from 'uuid'
import {UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'
import {useTheme} from '@yoroi/theme'

const useRequestPermissions = () => {
  React.useEffect(() => {
    Notifications.registerRemoteNotifications()
  }, [])
}

const useHandleNotification = () => {
  React.useEffect(() => {
    const s = Notifications.events().registerNotificationReceivedForeground(
      (notification: Notification, completion) => {
        console.log(`Notification received in foreground: ${notification.title} : ${notification.body}`)
        completion({alert: true, sound: true, badge: true})
      },
    )
    return () => {
      s.remove()
    }
  }, [])
}

const useNotificationsConfig = () => {
  const manager = useNotificationsManager()
  return useQuery(['notificationsConfig'], async () => await manager.config.read())
}

const useUpdateNotificationsConfig = () => {
  const manager = useNotificationsManager()
  const mutationFn = async (newConfig: NotificationTypes.Config) => {
    await manager.config.save(newConfig)
  }

  return useMutationWithInvalidations({
    mutationFn,
    invalidateQueries: [['notificationsConfig']],
  })
}

const useResetNotificationsConfig = (options: UseMutationOptions<NotificationTypes.Config, Error> = {}) => {
  const manager = useNotificationsManager()
  const mutationFn = async () => {
    await manager.config.reset()
    return await manager.config.read()
  }

  return useMutationWithInvalidations({
    mutationFn,
    invalidateQueries: [['notificationsConfig']],
    ...options,
  })
}

const useReceivedNotificationEvents = (
  options: UseQueryOptions<ReadonlyArray<NotificationTypes.Event>, Error> = {},
) => {
  const manager = useNotificationsManager()
  const queryFn = async () => await manager.events.read()
  return useQuery({
    queryKey: ['receivedNotificationEvents'],
    queryFn,
    ...options,
  })
}

const useSendNotification = () => {
  const sendNotification = (title: string, body: string) => {
    const notification = new Notification({
      title,
      body,
      sound: 'default',
    })
    Notifications.postLocalNotification(notification.payload)
  }

  return {send: sendNotification}
}

const useNotificationsManager = ({
  subscriptions,
}: {
  subscriptions?: NotificationTypes.ManagerMakerProps['subscriptions']
} = {}) => {
  const storage = useAsyncStorage()

  return React.useMemo(() => {
    const eventsStorage = storage.join('events/')
    const configStorage = storage.join('settings/')

    const manager = notificationManagerMaker({
      eventsStorage,
      configStorage,
      subscriptions,
    })
    manager.hydrate()
    return manager
  }, [storage])
}

const useNotifications = () => {
  const {send} = useSendNotification()
  const [transactionReceivedSubject] = React.useState(new Subject<NotificationTypes.TransactionReceivedEvent>())
  const manager = useNotificationsManager({
    subscriptions: {[NotificationTypes.Trigger.TransactionReceived]: transactionReceivedSubject},
  })
  React.useEffect(() => {
    const subscription = manager.notification$.subscribe(async (notificationEvent) => {
      if (notificationEvent.trigger === NotificationTypes.Trigger.TransactionReceived) {
        send('Transaction received', 'You have received a new transaction')
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [manager])

  const triggerTransactionReceived = (metadata: NotificationTypes.TransactionReceivedEvent['metadata']) => {
    transactionReceivedSubject.next({
      id: uuid.v4(),
      date: new Date().toISOString(),
      isRead: false,
      trigger: NotificationTypes.Trigger.TransactionReceived,
      metadata,
    })
  }

  return {triggerTransactionReceived}
}

export const NotificationsDevScreen = () => {
  useRequestPermissions()
  useHandleNotification()
  const {triggerTransactionReceived} = useNotifications()

  const handleOnTriggerTransactionReceived = () => {
    triggerTransactionReceived({
      previousTxsCounter: 0,
      nextTxsCounter: 1,
      txId: '123',
      isSentByUser: false,
    })
  }

  return (
    <SafeAreaView edges={['bottom', 'top', 'left', 'right']}>
      <View style={{padding: 16, gap: 8}}>
        <Text style={{fontSize: 24}}>Notifications Playground</Text>

        <Button
          title={`Trigger ${NotificationTypes.Trigger.TransactionReceived}`}
          shelleyTheme
          onPress={handleOnTriggerTransactionReceived}
        />

        <Text style={{fontSize: 24}}>Settings</Text>
        <NotificationSettings />
      </View>
    </SafeAreaView>
  )
}

const NotificationSettings = () => {
  const {data: notificationsConfig} = useNotificationsConfig()
  const {mutate: saveConfig} = useUpdateNotificationsConfig()
  const {mutate: resetConfig} = useResetNotificationsConfig({
    onSuccess: (config) => setLocalConfig(config),
  })
  const [localConfig, setLocalConfig] = React.useState<NotificationTypes.Config | null>(null)

  const handleSaveConfig = (newConfig: NotificationTypes.Config) => {
    saveConfig(newConfig)
    setLocalConfig(newConfig)
  }

  const config = (localConfig || notificationsConfig) ?? null

  if (!config) return null

  const handleOnUpdateTransactionReceivedConfig = (value: NotificationTypes.Config['TransactionReceived']) => {
    handleSaveConfig({
      ...config,
      [NotificationTypes.Trigger.TransactionReceived]: value,
    })
  }

  const handleOnUpdateRewardsUpdatedConfig = (value: NotificationTypes.Config['RewardsUpdated']) => {
    handleSaveConfig({
      ...config,
      [NotificationTypes.Trigger.RewardsUpdated]: value,
    })
  }

  const handleOnUpdatePrimaryTokenPriceChangedConfig = (
    value: NotificationTypes.Config['PrimaryTokenPriceChanged'],
  ) => {
    handleSaveConfig({
      ...config,
      [NotificationTypes.Trigger.PrimaryTokenPriceChanged]: value,
    })
  }

  const handleOnReset = () => resetConfig()

  return (
    <View>
      <Button title={'Reset'} shelleyTheme onPress={handleOnReset}></Button>
      <View style={{gap: 16}}>
        <TransactionReceivedSetting
          value={config[NotificationTypes.Trigger.TransactionReceived]}
          onChange={handleOnUpdateTransactionReceivedConfig}
        />
        <RewardsUpdateSetting
          value={config[NotificationTypes.Trigger.RewardsUpdated]}
          onChange={handleOnUpdateRewardsUpdatedConfig}
        />
        <PrimaryTokenPriceChangedSetting
          value={config[NotificationTypes.Trigger.PrimaryTokenPriceChanged]}
          onChange={handleOnUpdatePrimaryTokenPriceChangedConfig}
        />
      </View>
    </View>
  )
}

const TransactionReceivedSetting = ({
  value,
  onChange,
}: {
  value: NotificationTypes.Config['TransactionReceived']
  onChange: (value: NotificationTypes.Config['TransactionReceived']) => void
}) => {
  const styles = useStyles()
  return (
    <View>
      <Text>Transaction Received</Text>
      <View style={styles.row}>
        <Text>Notify</Text>
        <Switch value={value.notify} onValueChange={(notify) => onChange({notify})} />
      </View>
    </View>
  )
}

const RewardsUpdateSetting = ({
  value,
  onChange,
}: {
  value: NotificationTypes.Config['RewardsUpdated']
  onChange: (value: NotificationTypes.Config['RewardsUpdated']) => void
}) => {
  const styles = useStyles()
  return (
    <View>
      <Text>Rewards Updated</Text>
      <View style={styles.row}>
        <Text>Notify</Text>
        <Switch value={value.notify} onValueChange={(notify) => onChange({notify})} />
      </View>
    </View>
  )
}

const PrimaryTokenPriceChangedSetting = ({
  value,
  onChange,
}: {
  value: NotificationTypes.Config['PrimaryTokenPriceChanged']
  onChange: (value: NotificationTypes.Config['PrimaryTokenPriceChanged']) => void
}) => {
  const styles = useStyles()
  return (
    <View>
      <Text>Primary Token Price Changed</Text>
      <View style={styles.row}>
        <Text>Notify</Text>
        <Switch value={value.notify} onValueChange={(notify) => onChange({...value, notify})} />
      </View>
      <View style={styles.row}>
        <Text>Threshold</Text>
        <Text>{value.thresholdInPercent}</Text>
      </View>
      <View style={styles.row}>
        <Text>Interval</Text>
        <Text>{value.interval}</Text>
      </View>
    </View>
  )
}

const Switch = ({
  value,
  onValueChange,
  disabled,
}: {
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}) => {
  const {color} = useTheme()
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{false: color.gray_300, true: color.primary_500}}
      thumbColor={color.white_static}
    />
  )
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      ...atoms.gap_sm,
    },
  })
  return styles
}
