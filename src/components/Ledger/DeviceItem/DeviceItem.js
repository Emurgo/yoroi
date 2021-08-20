// @flow

import React from 'react'
import {Text, TouchableOpacity, ActivityIndicator} from 'react-native'

import {styles} from './styles'
import type {Device} from '../types'

type Props = {
  device: Device,
  onSelect: (device: Device) => any,
}

export const DeviceItem = ({device, onSelect}: Props) => {
  const [pending, setPending] = React.useState(false)
  const onPress = async () => {
    setPending(true)
    try {
      await onSelect(device)
    } finally {
      setPending(false)
    }
  }

  return (
    <TouchableOpacity style={styles.deviceItem} onPress={onPress} disabled={pending}>
      <Text style={styles.deviceName}>{device.name}</Text>
      {pending ? <ActivityIndicator /> : null}
    </TouchableOpacity>
  )
}

export default DeviceItem
