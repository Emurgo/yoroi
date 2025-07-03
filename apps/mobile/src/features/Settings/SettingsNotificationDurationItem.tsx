import {isNumber} from '@yoroi/common'
import {useNotificationsConfig} from '@yoroi/notifications'
import React from 'react'

import {
  NavigatedSettingsItem,
  NavigatedSettingsItemProps,
} from './SettingsItems'

export const SettingsNotificationDurationItem = ({
  label,
  onNavigate,
  icon,
  disabled,
}: NavigatedSettingsItemProps) => {
  const notificationsConfig = useNotificationsConfig()
  const value = notificationsConfig.data?.displayDuration
  const formattedValue = isNumber(value) ? `${value}s` : ''

  return (
    <NavigatedSettingsItem
      label={label}
      icon={icon}
      disabled={disabled}
      onNavigate={onNavigate}
      selected={formattedValue}
    />
  )
}
