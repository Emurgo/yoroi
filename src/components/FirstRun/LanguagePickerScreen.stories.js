// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import LanguagePickerScreen from './LanguagePickerScreen'
import {ReduxProvider} from '../../../storybook/ReduxProvider'

storiesOf('LanguagePickerScreen', module).add('Default', () => (
  <ReduxProvider>
    <LanguagePickerScreen />
  </ReduxProvider>
))
