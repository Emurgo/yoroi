import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SafeAreaInsets} from '../../../storybook'
import {ChangeLanguageScreen} from './ChangeLanguageScreen'

storiesOf('ChangeLanguageScreen', module).add('Default', () => (
  <SafeAreaInsets sides={['left', 'right', 'bottom']}>
    <ChangeLanguageScreen />
  </SafeAreaInsets>
))
