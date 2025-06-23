import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {OpenDeviceAppSettingsButton} from './OpenDeviceAppSettingsButton'

storiesOf('QRCodeScannerButton', module)
  .add('enabled', () => {
    return <OpenDeviceAppSettingsButton />
  })
  .add('disabled', () => {
    return <OpenDeviceAppSettingsButton disabled />
  })
