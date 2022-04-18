import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SafeAreaInsets} from '../../../storybook'
import {LanguagePickerScreen} from '.'

storiesOf('LanguagePickerScreen', module).add('Default', () => (
  <SafeAreaInsets>
    <LanguagePickerScreen />
  </SafeAreaInsets>
))
