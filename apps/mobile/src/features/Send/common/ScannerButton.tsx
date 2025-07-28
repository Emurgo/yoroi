import {useTheme} from '@yoroi/theme'
import React from 'react'
import {TouchableOpacity} from 'react-native'

import {Icon} from '~/ui/Icon'

type Props = {
  disabled?: boolean
  onPress: () => void
}
export const ScannerButton = ({disabled, onPress}: Props) => {
  const {color: themeColor} = useTheme()

  const color = disabled ? themeColor.gray_600 : themeColor.gray_max

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Icon.Qr color={color} size={30} />
    </TouchableOpacity>
  )
}
