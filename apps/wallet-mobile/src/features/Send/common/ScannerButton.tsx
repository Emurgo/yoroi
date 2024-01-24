import React from 'react'
import {TouchableOpacity} from 'react-native'

import {Icon} from '../../../components'
import {COLORS} from '../../../theme'

type Props = {
  disabled?: boolean
  onPress: () => void
}
export const ScannerButton = ({disabled, onPress}: Props) => {
  const color = disabled ? COLORS.TEXT_INPUT : 'black'

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Icon.Qr color={color} size={30} />
    </TouchableOpacity>
  )
}
