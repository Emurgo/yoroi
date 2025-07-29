import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Text, TouchableOpacity} from 'react-native'

import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
import {Device} from '~/wallets/types/hw'

type Props = {
  device: Device
  onSelect: (device: Device) => Promise<void> | void
  disabled?: boolean
}

export const DeviceItem = ({device, onSelect, disabled}: Props) => {
  const [pending, setPending] = React.useState(false)
  const {palette: p} = useTheme()
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
      style={[
        a.py_lg,
        a.px_2xl,
        {
          borderColor: p.primary_500,
          borderWidth: 1,
          borderRadius: 8,
        },
        a.align_center,
        a.flex_row,
        a.justify_center,
        isButtonDisabled && {opacity: 0.5},
      ]}
      onPress={onPress}
      disabled={isButtonDisabled}
    >
      <Icon.Ledger />

      <Space.Width.sm />

      <Text style={[a.heading_3_medium, {color: p.primary_500}]}>
        {device.name}
      </Text>
    </TouchableOpacity>
  )
}
