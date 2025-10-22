import {useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Switch} from 'react-native'

export const SettingsSwitch = ({
  value,
  disabled,
  onValueChange,
}: {
  value: boolean
  disabled?: boolean
  onValueChange?: () => void
}) => {
  const {palette: p} = useTheme()
  return (
    <Switch
      value={value}
      disabled={disabled}
      onValueChange={() => onValueChange?.()}
      trackColor={{false: p.gray_300, true: p.primary_500}}
      thumbColor={p.white_static}
    />
  )
}
