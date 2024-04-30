import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity} from 'react-native'

import {Device} from '../../../yoroi-wallets/types'

type Props = {
  device: Device
  onSelect: (device: Device) => Promise<void> | void
  disabled?: boolean
}

export const DeviceItem = ({device, onSelect, disabled}: Props) => {
  const [pending, setPending] = React.useState(false)
  const styles = useStyles()
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

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    deviceItem: {
      ...atoms.py_lg,
      ...atoms.px_2xl,
      marginVertical: 8,
      marginHorizontal: 16,
      borderColor: color.secondary_c500,
      borderWidth: 1,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    deviceName: {
      ...atoms.heading_3_medium,
      color: color.secondary_c500,
    },
    disabled: {
      opacity: 0.5,
    },
  })
  return styles
}
