import React from 'react'
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity} from 'react-native'

import {COLORS} from '../../../theme'
import {Device} from '../../../types'

type Props = {
  device: Device
  onSelect: (device: Device) => Promise<void> | void
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
      {pending && <ActivityIndicator color={'black'} />}
    </TouchableOpacity>
  )
}

export const styles = StyleSheet.create({
  deviceItem: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginVertical: 8,
    marginHorizontal: 16,
    borderColor: COLORS.LIGHT_POSITIVE_GREEN,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceName: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 'bold',
    color: COLORS.LIGHT_POSITIVE_GREEN,
  },
})
