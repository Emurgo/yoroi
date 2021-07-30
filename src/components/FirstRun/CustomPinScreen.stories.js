/* eslint-disable react-native/no-inline-styles */
// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import {withNavigationProps} from '../../../storybook/decorators'
import CustomPinScreen from './CustomPinScreen'

storiesOf('CustomPinScreen', module)
  .addDecorator(withNavigationProps)
  .add('Default', ({navigation, route}) => <CustomPinScreen navigation={navigation} route={route} />)
