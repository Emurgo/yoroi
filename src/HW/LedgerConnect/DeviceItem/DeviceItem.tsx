import React from 'react'
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity} from 'react-native'

import {COLORS} from '../../../theme'
import {Device} from '../../../yoroi-wallets/types'

type Props = {
  device: Device
  onSelect: (device: Device) => Promise<void> | void
  disabled?: boolean
}

export const DeviceItem = ({device, onSelect, disabled}: Props) => {
  const [pending, setPending] = React.useState(false)
  const onPress = async () => {
    setPending(true)
    try {
      await onSelect(device)
    } finally {
      setPending(false)
    }
  }

  const isButtonDisabled = disabled || pending

  return (
    <TouchableOpacity
      style={[styles.deviceItem, isButtonDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isButtonDisabled}
    >
      <Text style={styles.deviceName}>{device.name}</Text>

      {pending && <ActivityIndicator color="black" />}
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
  disabled: {
    opacity: 0.5,
  },
})
