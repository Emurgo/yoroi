import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ReduxProvider} from '../../../storybook/ReduxProvider'
import {LanguagePickerScreen} from '.'

storiesOf('LanguagePickerScreen', module).add('Default', () => (
  <ReduxProvider>
    <LanguagePickerScreen />
  </ReduxProvider>
))
