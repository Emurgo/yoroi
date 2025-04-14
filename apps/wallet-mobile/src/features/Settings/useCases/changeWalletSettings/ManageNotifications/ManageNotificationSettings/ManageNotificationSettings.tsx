import messaging from '@react-native-firebase/messaging'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {AppState, Linking, Platform, ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, ButtonType} from '../../../../../../components/Button/Button'
import {Icon} from '../../../../../../components/Icon'
import {Spacer} from '../../../../../../components/Spacer/Spacer'
import {Text} from '../../../../../../components/Text'
import {useMetrics} from '../../../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../../../kernel/navigation'
import {
  hasAuthorizedNotifications,
  triggerNotificationsPermissionModal,
} from '../../../../../Notifications/common/tools'
import {SettingsSwitch} from '../../../../common/SettingsSwitch'
import {SettingsItem, SettingsSection} from '../../../../SettingsItems'
import {SettingsNotificationDurationItem} from '../../../../SettingsNotificationDurationItem'
import {
  useChangeNotificationDisplaySettings,
  useNotificationDisplaySettings,
} from '../../Notifications/NotificationsDisplaySettings'
import {useStrings} from '../useStrings'

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
    const handleAppStateChange = async () => setHasPermission(await hasAuthorizedNotifications())
    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [])

  React.useEffect(() => {
    const fetchPermission = async () => setHasPermission(await hasAuthorizedNotifications())

    fetchPermission()
  }, [])

  const togglePermissions = async () => {
    const oldStatus = await messaging().requestPermission()
    if (oldStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
      await triggerNotificationsPermissionModal()
    } else {
      await navigateToAppSettings()
    }

    setHasPermission(await hasAuthorizedNotifications())
  }

  const navigateToAppSettings = async () => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:')
    } else {
      await Linking.openSettings()
    }
  }

  return {hasPermission, togglePermissions}
}

const PushNotificationSettingsItem = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  const {hasPermission, togglePermissions} = useNotificationPermission()

  if (hasPermission) {
    return (
      <SettingsItem icon={<Icon.Bell {...styles.icon} />} label={strings.pushNotifications}>
        <SettingsSwitch value={true} onValueChange={togglePermissions} />
      </SettingsItem>
    )
  }

  return (
    <View>
      <Text style={styles.enableSetting}>{strings.enableNotificationsThroughSettings}</Text>

      <Button
        style={styles.enableSettingButton}
        title={strings.goToSettings}
        onPress={togglePermissions}
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
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
    enableSetting: {
      ...atoms.body_1_lg_medium,
      ...atoms.py_sm,
    },
    enableSettingButton: {
      ...atoms.justify_start,
      ...atoms.p_0,
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
