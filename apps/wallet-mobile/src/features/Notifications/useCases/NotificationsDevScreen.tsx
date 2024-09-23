import {useTheme} from '@yoroi/theme'
import {Notifications as NotificationTypes} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Switch as RNSwitch, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../components/Button/Button'
import {ScrollableView} from '../../../components/ScrollableView'
import {
  useHandleNotification,
  useMockedNotifications,
  useNotificationsConfig,
  useReceivedNotificationEvents,
  useRequestPermissions,
  useResetNotificationsConfig,
  useUpdateNotificationsConfig,
} from './common/hooks'

export const NotificationsDevScreen = () => {
  useRequestPermissions()
  useHandleNotification()
  const {triggerTransactionReceived} = useMockedNotifications()

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
      <ScrollableView>
        <View style={{padding: 16, gap: 8}}>
          <Text style={{fontSize: 24}}>Notifications Playground</Text>

          <Button
            title={`Trigger Transacrion Received Notification`}
            shelleyTheme
            onPress={handleOnTriggerTransactionReceived}
          />

          <Text style={{fontSize: 24}}>Settings</Text>

          <NotificationSettings />

          <ReceivedNotificationsList />
        </View>
      </ScrollableView>
    </SafeAreaView>
  )
}

const ReceivedNotificationsList = () => {
  const {data: receivedNotifications} = useReceivedNotificationEvents()
  return (
    <View>
      <Text
        style={{
          fontSize: 24,
          marginTop: 16,
        }}
      >
        Received Notifications
      </Text>

      {receivedNotifications?.map((notification) => (
        <ReceivedNotification key={notification.id} notification={notification} />
      ))}
    </View>
  )
}

const ReceivedNotification = ({notification}: {notification: NotificationTypes.Event}) => {
  const readStatus = notification.isRead ? 'Read' : 'Unread'

  if (notification.trigger === NotificationTypes.Trigger.TransactionReceived) {
    const title = `You received a transaction at ${new Date(notification.date).toLocaleString()}`

    return (
      <View>
        <Text>{title}</Text>
        <Text>{notification.metadata.txId}</Text>
        <Text>{readStatus}</Text>
      </View>
    )
  }

  return (
    <View>
      <Text>{notification.trigger}</Text>
      <Text>{notification.date}</Text>
      <Text>{readStatus}</Text>
    </View>
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

  const config = localConfig ?? notificationsConfig ?? null

  if (config === null) return null

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
      <Button title="Reset" shelleyTheme onPress={handleOnReset}></Button>

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
