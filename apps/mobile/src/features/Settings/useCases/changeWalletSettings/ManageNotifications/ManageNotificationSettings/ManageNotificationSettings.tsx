import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {
  AppState,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useMetrics} from '../../../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../../../kernel/navigation/navigation'
import {Button, ButtonType} from '../../../../../../ui/Button/Button'
import {Icon} from '../../../../../../ui/Icon'
import {SettingsSwitch} from '../../../../../../ui/SettingsSwitch/SettingsSwitch'
import {Space} from '../../../../../../ui/Space/Space'
import {Text} from '../../../../../../ui/Text/Text'
// import {getNotificationsAuthorizationStatus} from '../../../../../Notifications/common/tools'
import {SettingsItem, SettingsSection} from '../../../../SettingsItems'
import {SettingsNotificationDurationItem} from '../../../../SettingsNotificationDurationItem'
import {
  useChangeNotificationDisplaySettings,
  useNotificationDisplaySettings,
} from '../../Notifications/NotificationsDisplaySettings'
import {useStrings} from '../useStrings'

const getNotificationsAuthorizationStatus = () => {
  Alert.aler('getNotificationsAuthorizationStatus not implemented')
}

export const ManageNotificationSettings = () => {
  const strings = useStrings()
  const {navigateToNotificationDisplayDuration} = useWalletNavigation()

  const {styles} = useStyles()

  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.root}>
      <ScrollView bounces={false} style={styles.settings}>
        <SettingsSection title={strings.pushNotifications}>
          <PushNotificationSettingsItem />
        </SettingsSection>

        <Space.Height.xl />

        <SettingsSection title={strings.inAppNotifications}>
          <SettingsItem
            icon={<Icon.Bell {...styles.icon} />}
            label={strings.inAppNotifications}
          >
            <InAppNotificationDisplaySwitcher />
          </SettingsItem>

          <SettingsNotificationDurationItem
            icon={<Icon.Time {...styles.icon} />}
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
      setPermission(await getNotificationsAuthorizationStatus())
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
      setPermission(await getNotificationsAuthorizationStatus())

    fetchPermission()
  }, [])

  const togglePermissions = async () => {
    const oldStatus = await getNotificationsAuthorizationStatus()

    if (oldStatus === 'not_determined') {
      Alert.alert('triggerNotificationsPermissionModal not implemented')
    } else {
      await navigateToAppSettings()
    }

    const currentStatus = await getNotificationsAuthorizationStatus()
    const nextStatus = currentStatus === 'authorized' ? 'denied' : 'authorized'
    track.settingsPushNotificationsStatusUpdated({
      is_enabled: nextStatus === 'authorized' ? 'enabled' : 'disabled',
    })
    setPermission(nextStatus)
  }

  return {permission, togglePermissions}
}

const PushNotificationSettingsItem = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  const {permission, togglePermissions} = useNotificationPermission()

  if (permission === 'authorized' || permission === 'not_determined') {
    return (
      <SettingsItem
        icon={<Icon.Bell {...styles.icon} />}
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
      <Text style={styles.enableSetting}>
        {strings.enableNotificationsThroughSettings}
      </Text>

      <Button
        style={styles.enableSettingButton}
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

const useStyles = () => {
  const {palette: p} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...a.flex_1,
      backgroundColor: p.bg_color_max,
    },
    enableSetting: {
      ...a.body_1_lg_medium,
      ...a.py_sm,
    },
    enableSettingButton: {
      ...a.justify_start,
      ...a.p_0,
    },
    settings: {
      ...a.flex_1,
      ...a.py_lg,
      ...a.px_lg,
    },
    icon: {
      color: p.gray_500,
      size: 23,
    },
  })
  return {styles} as const
}

const navigateToAppSettings = async () => {
  if (Platform.OS === 'ios') {
    await Linking.openURL('app-settings:')
  } else {
    await Linking.openSettings()
  }
}
