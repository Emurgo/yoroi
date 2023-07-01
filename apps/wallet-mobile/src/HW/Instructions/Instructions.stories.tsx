import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {Instructions} from './Instructions'

storiesOf('Instructions', module)
  .add('ble', () => <Instructions useUSB={false} />)
  .add('usb', () => <Instructions useUSB={true} />)
