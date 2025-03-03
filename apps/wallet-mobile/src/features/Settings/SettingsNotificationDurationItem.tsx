import React from 'react'
import {NavigatedSettingsItem, NavigatedSettingsItemProps} from './SettingsItems'

export const SettingsNotificationDurationItem = ({label, onNavigate, icon, disabled}: NavigatedSettingsItemProps) => {
  const formattedValue = `4s`

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
