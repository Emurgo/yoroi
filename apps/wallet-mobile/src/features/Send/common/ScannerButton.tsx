import {useTheme} from '@yoroi/theme'
import React from 'react'
import {TouchableOpacity} from 'react-native'

import {Icon} from '../../../components'

type Props = {
  disabled?: boolean
  onPress: () => void
}
export const ScannerButton = ({disabled, onPress}: Props) => {
  const {colors} = useStyles()

  const color = disabled ? colors.disabled : colors.enabled

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Icon.Qr color={color} size={30} />
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const colors = {
    disabled: color.gray_c600,
    enabled: color.gray_cmax,
  }
  return {colors}
}
