// @flow
import React from 'react'
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import {compose, withHandlers, withStateHandlers} from 'recompose'

import {COLORS} from '../../styles/config'

import type {ComponentType} from 'react'
import type {Device} from './types'

const styles = StyleSheet.create({
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

type Props = {|
  onSelect: (device: Device) => any,
  device: Device,
|}

const DeviceItem = ({device, pending, onPress}) => (
  <TouchableOpacity
    style={styles.deviceItem}
    onPress={onPress}
    disabled={pending}
  >
    <Text style={styles.deviceName}>{device.name}</Text>
    {pending ? <ActivityIndicator /> : null}
  </TouchableOpacity>
)

export default (compose(
  withStateHandlers(
    {
      pending: false,
    },
    {
      setPending: () => (pending) => ({pending}),
    },
  ),
  withHandlers({
    onPress:
      ({setPending, onSelect, device}) =>
      () => {
        setPending(true)
        try {
          onSelect(device)
        } finally {
          setPending(false)
        }
      },
  }),
)(DeviceItem): ComponentType<Props>)
