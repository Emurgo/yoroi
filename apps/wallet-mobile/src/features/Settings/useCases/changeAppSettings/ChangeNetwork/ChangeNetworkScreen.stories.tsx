import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SafeAreaInsets} from '../../../../../../.storybook/decorators'
import {ChangeNetworkScreen} from './ChangeNetworkScreen'

storiesOf('ChangeNetworkScreen', module).add('Default', () => (
  <SafeAreaInsets sides={['left', 'right', 'bottom']}>
    <ChangeNetworkScreen />
  </SafeAreaInsets>
))
