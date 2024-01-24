import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ShowCameraPermissionDeniedScreen} from './ShowCameraPermissionDeniedScreen'

storiesOf('ShowCameraPermissionDeniedScreen', module).add('initial', () => {
  return <ShowCameraPermissionDeniedScreen />
})
