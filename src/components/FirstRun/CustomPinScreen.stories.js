// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import CustomPinScreen from './CustomPinScreen'

storiesOf('CustomPinScreen', module).add('Default', ({navigation, route}) => (
  <CustomPinScreen navigation={navigation} route={route} />
))
