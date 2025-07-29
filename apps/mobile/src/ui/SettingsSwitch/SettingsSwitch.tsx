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
  const {palette: p} = useTheme()
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{false: p.gray_300, true: p.primary_500}}
      thumbColor={p.white_static}
    />
  )
}
