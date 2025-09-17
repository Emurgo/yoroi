import {atoms as a, useTheme} from '@yoroi/theme'

import * as Linking from 'expo-linking'
import * as React from 'react'
import {AppState, Platform, ScrollView, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {getNotificationsAuthorizationStatus} from '~/features/Notifications/common/tools'
import {
  SettingsItem,
  SettingsSection,
} from '~/features/Settings/ui/shared/SettingsItems'
import {features} from '~/kernel/features'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {SettingsSwitch} from '~/ui/SettingsSwitch/SettingsSwitch'
import {Text} from '~/ui/Text/Text'

import {useChangeNotificationDisplaySettings} from '../../../../hooks/useChangeNotificationDisplaySettings'
import {useNotificationDisplaySettings} from '../../../../hooks/useNotificationDisplaySettings'
import {SettingsNotificationDurationItem} from './SettingsNotificationDurationItem'

export const ChangeNotificationSettingsScreen = () => {
  const strings = useStrings()
  const {navigateToNotificationDisplayDuration} = useWalletNavigation()
  const {atoms: ta, palette: p} = useTheme()

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[a.flex_1, ta.bg_color_max, a.py_lg]}
    >
      <ScrollView
        bounces={false}
        style={a.flex_1}
        contentContainerStyle={[a.gap_lg, a.px_lg]}
      >
        {features.pushNotifications && (
          <SettingsSection
            title={strings.manageNotifications.pushNotifications}
          >
            <PushNotificationSettingsItem />
          </SettingsSection>
        )}

        <SettingsSection title={strings.manageNotifications.inAppNotifications}>
          <SettingsItem
            icon={<Icon.Bell color={p.gray_500} size={23} />}
            label={strings.settings.walletSettings.inAppNotifications}
          >
            <InAppNotificationDisplaySwitcher />
          </SettingsItem>

          <SettingsNotificationDurationItem
            icon={<Icon.Time color={p.gray_500} size={23} />}
            onNavigate={() => navigateToNotificationDisplayDuration()}
            label={strings.settings.walletSettings.displayDuration}
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
    const handleAppStateChange = async () => {
      const status = await getNotificationsAuthorizationStatus()
      setPermission(status)
    }
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    return () => {
      subscription.remove()
    }
  }, [])

  React.useEffect(() => {
    const fetchPermission = async () => {
      const status = await getNotificationsAuthorizationStatus()
      setPermission(status)
    }

    fetchPermission()
  }, [])

  const togglePermissions = async () => {
    const oldStatus = await getNotificationsAuthorizationStatus()

    if (oldStatus === 'not_determined') {
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
  const {palette: p} = useTheme()
  const strings = useStrings()

  const {permission, togglePermissions} = useNotificationPermission()

  if (permission === 'authorized' || permission === 'not_determined') {
    return (
      <SettingsItem
        icon={<Icon.Bell color={p.gray_500} size={23} />}
        label={strings.settings.walletSettings.allowNotifications}
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
        {strings.manageNotifications.enableNotificationsThroughSettings}
      </Text>

      <Button
        style={[a.justify_start, a.p_0]}
        title={strings.manageNotifications.goToSettings}
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
