import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CameraPermissionDeniedIllustration} from './CameraPermissionDeniedIlustration'

storiesOf('Scan Illustrations Gallery', module).add('Camera permission denied', () => {
  return <CameraPermissionDeniedIllustration />
})
