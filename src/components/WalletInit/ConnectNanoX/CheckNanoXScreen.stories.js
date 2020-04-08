// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import CheckNanoXScreen from './CheckNanoXScreen'

storiesOf('CheckNanoXScreen', module).add('default', ({navigation}) => (
  <CheckNanoXScreen
    navigation={navigation}
    onPress={(e) => action('clicked')}
  />
))
