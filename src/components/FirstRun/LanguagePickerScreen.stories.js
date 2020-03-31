// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import LanguagePickerScreen from './LanguagePickerScreen'

storiesOf('LanguagePickerScreen', module)
  .add('Default', ({navigation}) => (
    <LanguagePickerScreen navigation={navigation} />
  ))
