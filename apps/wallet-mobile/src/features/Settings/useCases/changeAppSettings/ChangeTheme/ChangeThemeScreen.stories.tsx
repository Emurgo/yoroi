import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SafeAreaInsets} from '../../../../../../.storybook/decorators'
import {ChangeThemeScreen} from './ChangeThemeScreen'

storiesOf('ChangeThemeScreen', module).add('Default', () => (
  <SafeAreaInsets sides={['left', 'right', 'bottom']}>
    <ChangeThemeScreen />
  </SafeAreaInsets>
))
