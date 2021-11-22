// @flow

import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ReduxProvider} from '../../storybook/ReduxProvider'
import LanguagePickerScreen from './LanguagePickerScreen'

storiesOf('LanguagePickerScreen', module).add('Default', () => (
  <ReduxProvider>
    <LanguagePickerScreen />
  </ReduxProvider>
))
