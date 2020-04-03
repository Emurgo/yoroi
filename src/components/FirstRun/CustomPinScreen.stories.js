// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import CustomPinScreen from './CustomPinScreen'

storiesOf('CustomPinScreen', module).add('Default', ({navigation}) => (
  <CustomPinScreen navigation={navigation} />
))
