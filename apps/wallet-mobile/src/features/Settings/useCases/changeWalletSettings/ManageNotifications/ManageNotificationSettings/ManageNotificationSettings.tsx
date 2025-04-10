import messaging from '@react-native-firebase/messaging'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Linking, Platform, ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon} from '../../../../../../components/Icon'
import {Spacer} from '../../../../../../components/Spacer/Spacer'
import {useMetrics} from '../../../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../../../kernel/navigation'
import {triggerNotificationsPermissionModal} from '../../../../../Notifications/common/tools'
import {SettingsSwitch} from '../../../../common/SettingsSwitch'
import {SettingsItem, SettingsSection} from '../../../../SettingsItems'
import {SettingsNotificationDurationItem} from '../../../../SettingsNotificationDurationItem'
import {
  useChangeNotificationDisplaySettings,
  useNotificationDisplaySettings,
} from '../../Notifications/NotificationsDisplaySettings'

export const ManageNotificationSettings = () => {
  const strings = useStrings()
  const {navigateToNotificationDisplayDuration} = useWalletNavigation()
  const {styles} = useStyles()

  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.root}>
      <ScrollView bounces={false} style={styles.settings}>
        <SettingsSection title="Push notifications">
          <PushNotificationSettingsItem />
        </SettingsSection>

        <Spacer height={24} />

        <SettingsSection title={strings.inAppNotifications}>
          <SettingsItem icon={<Icon.Bell {...styles.icon} />} label={strings.inAppNotifications}>
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
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    const fetchPermission = async () => {
      const status = await messaging().requestPermission()
      setHasPermission(status === messaging.AuthorizationStatus.AUTHORIZED)
    }

    fetchPermission()
  }, [])

  const togglePermissions = async () => {
    const oldStatus = await messaging().requestPermission()
    if (oldStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
      await triggerNotificationsPermissionModal()
    } else {
      navigateToAppSettings()
    }

    const status = await messaging().requestPermission()
    setHasPermission(status === messaging.AuthorizationStatus.AUTHORIZED)
  }

  const navigateToAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:')
    } else {
      Linking.openSettings()
    }
  }

  return {hasPermission, togglePermissions}
}

const PushNotificationSettingsItem = () => {
  const {styles} = useStyles()

  const {hasPermission, togglePermissions} = useNotificationPermission()

  if (hasPermission) {
    return (
      <SettingsItem icon={<Icon.Bell {...styles.icon} />} label="Push notifications">
        <SettingsSwitch value={true} onValueChange={togglePermissions} />
      </SettingsItem>
    )
  }

  return (
    <SettingsItem icon={<Icon.Bell {...styles.icon} />} label="Push notifications">
      <SettingsSwitch value={false} onValueChange={togglePermissions} />
    </SettingsItem>
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
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
    settings: {
      ...atoms.flex_1,
      ...atoms.py_lg,
      ...atoms.px_lg,
    },
    icon: {
      color: color.gray_500,
      size: 23,
    },
  })
  return {styles} as const
}

const useStrings = () => {
  const intl = useIntl()

  return {
    inAppNotifications: intl.formatMessage(messages.inAppNotifications),
    displayDuration: intl.formatMessage(messages.displayDuration),
  }
}

const messages = defineMessages({
  inAppNotifications: {
    id: 'components.settings.walletsettingscreen.inAppNotifications',
    defaultMessage: '!!!In-app notifications',
  },
  displayDuration: {
    id: 'components.settings.walletsettingscreen.displayDuration',
    defaultMessage: '!!!Display duration',
  },
})
