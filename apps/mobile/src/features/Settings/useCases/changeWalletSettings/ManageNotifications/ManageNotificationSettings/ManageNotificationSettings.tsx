import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {
  Alert,
  AppState,
  Linking,
  Platform,
  ScrollView,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {SettingsItem, SettingsSection} from '~/features/Settings/SettingsItems'
import {SettingsNotificationDurationItem} from '~/features/Settings/SettingsNotificationDurationItem'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/navigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {SettingsSwitch} from '~/ui/SettingsSwitch/SettingsSwitch'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {
  useChangeNotificationDisplaySettings,
  useNotificationDisplaySettings,
} from '../../Notifications/NotificationsDisplaySettings'
import {useStrings} from '../useStrings'

const getNotificationsAuthorizationStatus = () => {
  // TODO: Alert.alert('getNotificationsAuthorizationStatus not implemented')
  return 'not_determined' as const
}

export const ManageNotificationSettings = () => {
  const strings = useStrings()
  const {navigateToNotificationDisplayDuration} = useWalletNavigation()
  const {atoms: ta, palette: p} = useTheme()

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[a.flex_1, ta.bg_color_max]}
    >
      <ScrollView bounces={false} style={[a.flex_1, a.py_lg, a.px_lg]}>
        <SettingsSection title={strings.pushNotifications}>
          <PushNotificationSettingsItem />
        </SettingsSection>

        <Space.Height.xl />

        <SettingsSection title={strings.inAppNotifications}>
          <SettingsItem
            icon={<Icon.Bell color={p.gray_500} size={23} />}
            label={strings.inAppNotifications}
          >
            <InAppNotificationDisplaySwitcher />
          </SettingsItem>

          <SettingsNotificationDurationItem
            icon={<Icon.Time color={p.gray_500} size={23} />}
            onNavigate={() => navigateToNotificationDisplayDuration()}
            label={strings.displayDuration}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  )
}

export function useNotificationPermission() {
  const {track} = useMetrics()
  const [permission, setPermission] = React.useState<
    'authorized' | 'not_determined' | 'denied'
  >('not_determined')

  React.useEffect(() => {
    const handleAppStateChange = async () =>
      setPermission(getNotificationsAuthorizationStatus())
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    return () => {
      subscription.remove()
    }
  }, [])

  React.useEffect(() => {
    const fetchPermission = async () =>
      setPermission(getNotificationsAuthorizationStatus())

    fetchPermission()
  }, [])

  const togglePermissions = async () => {
    const oldStatus = getNotificationsAuthorizationStatus()

    if (oldStatus === 'not_determined') {
      Alert.alert('triggerNotificationsPermissionModal not implemented')
    } else {
      await navigateToAppSettings()
    }

    const currentStatus = getNotificationsAuthorizationStatus()
    const nextStatus = currentStatus === 'authorized' ? 'denied' : 'authorized'
    track.settingsPushNotificationsStatusUpdated({
      is_enabled: nextStatus === 'authorized' ? 'enabled' : 'disabled',
    })
    setPermission(nextStatus)
  }

  return {permission, togglePermissions}
}

const PushNotificationSettingsItem = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  const {permission, togglePermissions} = useNotificationPermission()

  if (permission === 'authorized' || permission === 'not_determined') {
    return (
      <SettingsItem
        icon={<Icon.Bell color={p.gray_500} size={23} />}
        label={strings.pushNotifications}
      >
        <SettingsSwitch
          value={permission === 'authorized'}
          onValueChange={togglePermissions}
        />
      </SettingsItem>
    )
  }

  return (
    <View>
      <Text style={[a.body_1_lg_medium, a.py_sm]}>
        {strings.enableNotificationsThroughSettings}
      </Text>

      <Button
        style={[a.justify_start, a.p_0]}
        title={strings.goToSettings}
        onPress={navigateToAppSettings}
        type={ButtonType.Text}
      />
    </View>
  )
}

const InAppNotificationDisplaySwitcher = () => {
  const displayNotifications = useNotificationDisplaySettings()
  const {mutate} = useChangeNotificationDisplaySettings()
  const [localValue, setLocalValue] = React.useState(displayNotifications)
  const {track} = useMetrics()

  const handleOnToggle = () => {
    const newValue = !localValue
    setLocalValue(newValue)
    mutate(newValue)
    const status = newValue ? 'enabled' : 'disabled'
    track.settingsInAppNotificationsStatusUpdated({status})
  }

  return <SettingsSwitch value={localValue} onValueChange={handleOnToggle} />
}

const navigateToAppSettings = async () => {
  if (Platform.OS === 'ios') {
    await Linking.openURL('app-settings:')
  } else {
    await Linking.openSettings()
  }
}
