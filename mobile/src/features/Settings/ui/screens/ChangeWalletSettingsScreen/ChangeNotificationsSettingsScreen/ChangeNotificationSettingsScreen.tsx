import {atoms as a, useTheme} from '@yoroi/theme'

import * as Linking from 'expo-linking'
import * as React from 'react'
import {AppState, Platform, ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {
  getNotificationsAuthorizationStatus,
  triggerNotificationsPermissionModal,
} from '~/features/Notifications/common/tools'
import {usePushNotificationsEnabled} from '~/features/Notifications/common/usePushNotificationsEnabled'
import {
  SettingsItem,
  SettingsSection,
} from '~/features/Settings/ui/shared/SettingsItems'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Icon} from '~/ui/Icon'
import {SettingsSwitch} from '~/ui/SettingsSwitch/SettingsSwitch'

import {useChangeNotificationDisplaySettings} from '../../../../hooks/useChangeNotificationDisplaySettings'
import {useNotificationDisplaySettings} from '../../../../hooks/useNotificationDisplaySettings'
import {SettingsNotificationDurationItem} from './SettingsNotificationDurationItem'

export const ChangeNotificationSettingsScreen = () => {
  const strings = useStrings()
  const {navigateToNotificationDisplayDuration} = useWalletNavigation()
  const {atoms: ta, palette: p} = useTheme()
  const pushNotificationsEnabled = usePushNotificationsEnabled()

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
        {pushNotificationsEnabled && (
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

  const handleToggle = async () => {
    if (permission === 'not_determined') {
      await triggerNotificationsPermissionModal()
      const newStatus = await getNotificationsAuthorizationStatus()
      setPermission(newStatus)
    } else {
      setPermission(permission === 'authorized' ? 'denied' : 'authorized')
      await navigateToAppSettings()
    }
  }

  return {permission, handleToggle}
}

const PushNotificationSettingsItem = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  const {permission, handleToggle} = useNotificationPermission()

  return (
    <SettingsItem
      icon={<Icon.Bell color={p.gray_500} size={23} />}
      label={strings.settings.walletSettings.allowNotifications}
    >
      <SettingsSwitch
        value={permission === 'authorized'}
        onValueChange={handleToggle}
      />
    </SettingsItem>
  )
}

const InAppNotificationDisplaySwitcher = () => {
  const displayNotifications = useNotificationDisplaySettings()
  const {mutate} = useChangeNotificationDisplaySettings()
  const [localValue, setLocalValue] = React.useState(displayNotifications)
  const handleOnToggle = () => {
    const newValue = !localValue
    setLocalValue(newValue)
    mutate(newValue)
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
