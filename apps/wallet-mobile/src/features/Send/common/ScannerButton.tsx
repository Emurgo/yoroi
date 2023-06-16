import {Camera} from 'expo-camera'
import React from 'react'
import {TouchableOpacity} from 'react-native'

import {Icon} from '../../../components'
import {COLORS} from '../../../theme'

type Props = {
  disabled?: boolean
  onPress: () => void
}
export const ScannerButton = ({disabled, onPress}: Props) => {
  const [status, requestPermissions] = Camera.useCameraPermissions()
  const color = disabled ? COLORS.TEXT_INPUT : 'black'

  const handleOnPress = () => {
    if (status && !status.granted) {
      requestPermissions()
    }
    onPress()
  }

  return (
    <TouchableOpacity onPress={handleOnPress} disabled={disabled}>
      <Icon.Qr color={color} size={30} />
    </TouchableOpacity>
  )
}
