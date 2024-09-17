import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity} from 'react-native'

import {Icon} from '../../../../components/Icon'
import {Space} from '../../../../components/Space/Space'
import {Device} from '../../../../yoroi-wallets/types/hw'

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
      <Icon.Ledger />

      <Space width="sm" />

      <Text style={styles.deviceName}>{device.name}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    deviceItem: {
      ...atoms.py_lg,
      ...atoms.px_2xl,
      borderColor: color.primary_500,
      borderWidth: 1,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      ...atoms.justify_center,
    },
    deviceName: {
      ...atoms.heading_3_medium,
      color: color.primary_500,
    },
    disabled: {
      opacity: 0.5,
    },
  })
  return styles
}
