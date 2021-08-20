// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import DeviceItem from './DeviceItem'
import type {Device} from '../types'

const device: Device = {
  id: 123,
  name: 'Device Name',
}

const doTheThing = () => new Promise((resolve) => setTimeout(() => resolve(), 1000))

const onSelect = async (device) => {
  action('onSelect start')(device)
  await doTheThing()
  action('onSelect end')(device)
}

storiesOf('Device Item Button', module).add('default', () => <DeviceItem onSelect={onSelect} device={device} />)
