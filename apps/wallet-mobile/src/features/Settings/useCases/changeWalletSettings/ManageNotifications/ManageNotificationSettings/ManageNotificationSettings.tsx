import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon} from '../../../../../../components/Icon'
import {useMetrics} from '../../../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../../../kernel/navigation'
import {SettingsSwitch} from '../../../../common/SettingsSwitch'
import {SettingsItem, SettingsSection} from '../../../../SettingsItems'
import {SettingsNotificationDurationItem} from '../../../../SettingsNotificationDurationItem'
import {
  useChangeNotificationDisplaySettings,
  useNotificationDisplaySettings,
} from '../../Notifications/NotificationsDisplaySettings'

export const ManageNotificationSettings = () => {
  const strings = useStrings()
  const {color} = useTheme()
  const {navigateToNotificationDisplayDuration} = useWalletNavigation()
  const {styles} = useStyles()

  const iconProps = {
    color: color.gray_500,
    size: 23,
  }

  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.root}>
      <ScrollView bounces={false} style={styles.settings}>
        <SettingsSection title={strings.inAppNotifications}>
          <SettingsItem icon={<Icon.Bell {...iconProps} />} label={strings.inAppNotifications}>
            <NotificationDisplaySwitcher />
          </SettingsItem>

          <SettingsNotificationDurationItem
            icon={<Icon.Time {...iconProps} />}
            onNavigate={() => navigateToNotificationDisplayDuration()}
            label={strings.displayDuration}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  )
}

const NotificationDisplaySwitcher = () => {
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
  })
  return {styles, colors: {icon: color.gray_500}} as const
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
