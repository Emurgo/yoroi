import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SafeAreaInsets} from '../../../../.storybook/decorators'
import {LanguagePickerScreen} from './LanguagePickerScreen'

storiesOf('LanguagePickerScreen', module).add('Default', () => (
  <SafeAreaInsets>
    <LanguagePickerScreen />
  </SafeAreaInsets>
))
