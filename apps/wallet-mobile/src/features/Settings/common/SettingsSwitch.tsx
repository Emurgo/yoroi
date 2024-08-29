import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Switch} from 'react-native'

export const SettingsSwitch = ({
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
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{false: color.gray_300, true: color.primary_500}}
      thumbColor={color.white_static}
    />
  )
}
